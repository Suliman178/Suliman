import type { RequestHandler } from 'express';
import { appStore } from '../services/appStore.js';

declare module 'express-session' { interface SessionData { userId?: string } }
declare global { namespace Express { interface Request { user?: import('../services/memoryStore.js').StoredUser } } }

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const user = userId ? await appStore.findUserById(userId) : undefined;
    if (!user) return res.status(401).json({ error: 'Authentication required' });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
