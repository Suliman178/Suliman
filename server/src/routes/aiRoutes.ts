import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateBody.js';
import { aiRouter } from '../ai/aiRouter.js';
import { store } from '../services/storage.js';
import { PROJECT_TYPES } from '../../../shared/types.js';
import type { AgentRole } from '../../../shared/types.js';

export const aiRoutes = Router();
aiRoutes.use(requireAuth);
const aiSchema = z.object({
  projectId: z.string().optional(),
  instruction: z.string().min(1).max(4000),
  model: z.string().default('gpt-4o-mini'),
  agentRole: z.enum(['auto','planner','coder','reviewer','fixer','uiux']).default('auto'),
  projectType: z.enum(PROJECT_TYPES).default('static')
});

async function handle(req: any, res: any, mode: AgentRole) {
  const body = req.body as z.infer<typeof aiSchema>;
  let project = body.projectId ? await store.getProject(req.user.id, body.projectId) : undefined;
  if (body.projectId && !project) return res.status(404).json({ error: 'Project not found.' });
  if (!project) project = await store.createProject(req.user.id, 'Untitled AI Project', body.instruction.slice(0, 200));
  await store.addChatMessage(project.id, 'user', body.instruction, body.agentRole, body.model);
  const files = await store.listFiles(project.id);
  const result = await aiRouter.run({ instruction: body.instruction, agentRole: mode === 'auto' ? body.agentRole : mode, model: body.model, projectType: body.projectType, projectName: project.name, files });
  let savedFiles = files;
  if (result.project) {
    project = await store.updateProject(req.user.id, project.id, { name: result.project.projectName, description: result.project.description }) || project;
    savedFiles = await store.replaceFiles(project.id, result.project.files, true);
  }
  await store.addChatMessage(project.id, 'assistant', result.message, mode, result.model);
  await store.addUsage({ userId: req.user.id, projectId: project.id, provider: result.provider, model: result.model, agentRole: mode, inputTokens: result.inputTokens, outputTokens: result.outputTokens, estimatedCost: 0 });
  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  res.json({ project, files: savedFiles, message: result.message, provider: result.provider, model: result.model, projectType: result.project?.projectType ?? body.projectType, missingApiKey: !openAiKey });
}
aiRoutes.post('/generate-project', validateBody(aiSchema), (req, res, next) => handle(req, res, 'coder').catch(next));
aiRoutes.post('/modify-project', validateBody(aiSchema), (req, res, next) => handle(req, res, 'auto').catch(next));
aiRoutes.post('/review-project', validateBody(aiSchema), (req, res, next) => handle(req, res, 'reviewer').catch(next));
aiRoutes.post('/fix-project', validateBody(aiSchema), (req, res, next) => handle(req, res, 'fixer').catch(next));
aiRoutes.post('/improve-design', validateBody(aiSchema), (req, res, next) => handle(req, res, 'uiux').catch(next));
