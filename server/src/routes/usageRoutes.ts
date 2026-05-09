import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { appStore } from '../services/appStore.js';
const router = Router(); router.use(requireAuth);
router.get('/', async (req, res, next) => { try { res.json({ usage: await appStore.usage(req.user!.id) }); } catch (e) { next(e); } });
export default router;
