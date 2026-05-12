import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { store } from '../services/storage.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateBody.js';

export const authRoutes = Router();
const registerSchema = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1).max(80).optional() });
const loginSchema = registerSchema.pick({ email: true, password: true });

authRoutes.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body as z.infer<typeof registerSchema>;
    if (await store.findUserByEmail(email)) return res.status(409).json({ error: 'An account with this email already exists.' });
    const user = await store.createUser(email, name || email.split('@')[0], await bcrypt.hash(password, 12));
    req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.userId = user.id;
      req.session.save(async (saveError) => saveError ? next(saveError) : res.status(201).json({ user: await store.publicUser(user) }));
    });
  } catch (error) { next(error); }
});

authRoutes.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const user = await store.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password.' });
    req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.userId = user.id;
      req.session.save(async (saveError) => saveError ? next(saveError) : res.json({ user: await store.publicUser(user) }));
    });
  } catch (error) { next(error); }
});

authRoutes.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('ai_app_builder.sid').json({ ok: true });
  });
});

authRoutes.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));
