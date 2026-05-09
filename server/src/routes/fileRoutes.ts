import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateBody.js';
import { store } from '../services/storage.js';
import { validateProjectFilePath } from '../utils/filePathValidator.js';

export const fileRoutes = Router({ mergeParams: true });
fileRoutes.use(requireAuth);
const fileSchema = z.object({ path: z.string(), language: z.string().min(1).max(40), content: z.string().default('') });
const deleteSchema = z.object({ path: z.string() });
async function ensureProject(userId: string, projectId: string) { const p = await store.getProject(userId, projectId); if (!p) throw new Error('Project not found.'); return p; }
fileRoutes.get('/', async (req, res, next) => { try { await ensureProject(req.user!.id, req.params.projectId); res.json({ files: await store.listFiles(req.params.projectId) }); } catch (e) { next(e); } });
fileRoutes.post('/', validateBody(fileSchema), async (req, res, next) => { try { await ensureProject(req.user!.id, req.params.projectId); const file = await store.upsertFile(req.params.projectId, { ...req.body, path: validateProjectFilePath(req.body.path) }); res.status(201).json({ file }); } catch (e) { next(e); } });
fileRoutes.patch('/', validateBody(fileSchema), async (req, res, next) => { try { await ensureProject(req.user!.id, req.params.projectId); const file = await store.upsertFile(req.params.projectId, { ...req.body, path: validateProjectFilePath(req.body.path) }); res.json({ file }); } catch (e) { next(e); } });
fileRoutes.delete('/', validateBody(deleteSchema), async (req, res, next) => { try { await ensureProject(req.user!.id, req.params.projectId); res.json({ ok: await store.deleteFile(req.params.projectId, validateProjectFilePath(req.body.path)) }); } catch (e) { next(e); } });
