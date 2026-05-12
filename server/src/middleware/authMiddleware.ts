import type { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import { store } from '../services/storage.js';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; name: string };
    }
  }
}

export function sessionMiddleware() {
  return session({
    name: 'ai_app_builder.sid',
    secret: process.env.SESSION_SECRET || 'dev-only-change-me-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  });
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) return res.status(401).json({ error: 'Authentication required.' });
    const user = await store.findUserById(req.session.userId);
    if (!user) {
      req.session.destroy(() => undefined);
      return res.status(401).json({ error: 'Invalid session.' });
    }
    const safe = await store.publicUser(user);
    req.user = { id: safe.id, email: safe.email, name: safe.name };
    next();
  } catch (error) {
    next(error);
  }
}
