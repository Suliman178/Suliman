import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateBody.js';
import { store } from '../services/storage.js';

export const projectRoutes = Router();
projectRoutes.use(requireAuth);
const projectSchema = z.object({ name: z.string().min(1).max(80), description: z.string().max(500).optional().default('') });

projectRoutes.post('/', validateBody(projectSchema), async (req, res) => res.status(201).json({ project: await store.createProject(req.user!.id, req.body.name, req.body.description) }));
projectRoutes.get('/', async (req, res) => res.json({ projects: await store.listProjects(req.user!.id) }));
projectRoutes.get('/:projectId', async (req, res) => {
  const project = await store.getProject(req.user!.id, req.params.projectId); if (!project) return res.status(404).json({ error: 'Project not found.' });
  res.json({ project, files: await store.listFiles(project.id), chatMessages: await store.listChat(project.id) });
});
projectRoutes.patch('/:projectId', validateBody(projectSchema.partial()), async (req, res) => {
  const project = await store.updateProject(req.user!.id, req.params.projectId, req.body); if (!project) return res.status(404).json({ error: 'Project not found.' }); res.json({ project });
});
projectRoutes.delete('/:projectId', async (req, res) => res.json({ ok: await store.deleteProject(req.user!.id, req.params.projectId) }));
