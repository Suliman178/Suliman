import { Router, type RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import { z } from 'zod';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateBody.js';
import { store } from '../services/storage.js';
import { validateProjectFilePath } from '../utils/filePathValidator.js';

type ProjectParams = ParamsDictionary & { projectId: string };

export const fileRoutes = Router({ mergeParams: true });
fileRoutes.use(requireAuth);
const fileSchema = z.object({ path: z.string(), language: z.string().min(1).max(40), content: z.string().default('') });
const deleteSchema = z.object({ path: z.string() });

type FileBody = z.infer<typeof fileSchema>;
type DeleteBody = z.infer<typeof deleteSchema>;

async function ensureProject(userId: string, projectId: string) {
  const project = await store.getProject(userId, projectId);
  if (!project) throw new Error('Project not found.');
  return project;
}

const listFiles: RequestHandler<ProjectParams> = async (req, res, next) => {
  try {
    await ensureProject(req.user!.id, req.params.projectId);
    res.json({ files: await store.listFiles(req.params.projectId) });
  } catch (error) { next(error); }
};

const createFile: RequestHandler<ProjectParams, unknown, FileBody> = async (req, res, next) => {
  try {
    await ensureProject(req.user!.id, req.params.projectId);
    const file = await store.upsertFile(req.params.projectId, { ...req.body, path: validateProjectFilePath(req.body.path) });
    res.status(201).json({ file });
  } catch (error) { next(error); }
};

const updateFile: RequestHandler<ProjectParams, unknown, FileBody> = async (req, res, next) => {
  try {
    await ensureProject(req.user!.id, req.params.projectId);
    const file = await store.upsertFile(req.params.projectId, { ...req.body, path: validateProjectFilePath(req.body.path) });
    res.json({ file });
  } catch (error) { next(error); }
};

const deleteFile: RequestHandler<ProjectParams, unknown, DeleteBody> = async (req, res, next) => {
  try {
    await ensureProject(req.user!.id, req.params.projectId);
    res.json({ ok: await store.deleteFile(req.params.projectId, validateProjectFilePath(req.body.path)) });
  } catch (error) { next(error); }
};

fileRoutes.get('/', listFiles);
fileRoutes.post('/', validateBody(fileSchema), createFile);
fileRoutes.patch('/', validateBody(fileSchema), updateFile);
fileRoutes.delete('/', validateBody(deleteSchema), deleteFile);
