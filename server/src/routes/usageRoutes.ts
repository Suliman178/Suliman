import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { store } from '../services/storage.js';
export const usageRoutes = Router();
usageRoutes.use(requireAuth);
usageRoutes.get('/', async (req, res) => res.json({ usage: await store.listUsage(req.user!.id) }));
