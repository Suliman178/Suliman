import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateBody.js';
import { aiSetupStatus, inferAgentRole, routeAi } from '../ai/aiRouter.js';
import { assertProjectOwner, saveGeneratedFiles } from '../services/projectService.js';
import { appStore } from '../services/appStore.js';
import type { AgentRole } from '../types.js';
const router = Router(); router.use(requireAuth);
const aiBody = z.object({ projectId: z.string().optional(), instruction: z.string().min(1), model: z.string().default('gpt-4.1-mini'), agentRole: z.enum(['auto','planner','coder','reviewer','fixer','uiux']).default('auto') });
async function handle(req: any, res: any, next: any, type: AgentRole | 'auto') {
  try {
    const agentRole = type === 'auto' ? req.body.agentRole : type;
    let project = req.body.projectId ? await assertProjectOwner(req.body.projectId, req.user.id) : await appStore.createProject(req.user.id, 'Untitled AI Project', 'Generated with AI');
    const currentFiles = (await appStore.projectFiles(project.id)).map(({ path, language, content }) => ({ path, language, content }));
    await appStore.addMessage(project.id, 'user', req.body.instruction, agentRole, req.body.model);
    const actualRole = inferAgentRole(req.body.instruction, agentRole);
    const ai = await routeAi({ instruction: req.body.instruction, model: req.body.model, agentRole, currentFiles, projectName: project.name });
    if (ai.project) {
      project = await appStore.updateProject(project.id, { name: ai.project.projectName || project.name, description: ai.project.description || project.description }) || project;
      await saveGeneratedFiles(project.id, ai.project.files, true);
    }
    const assistant = await appStore.addMessage(project.id, 'assistant', ai.text, actualRole, ai.model);
    await appStore.addUsage({ userId: req.user.id, projectId: project.id, provider: ai.provider, model: ai.model, agentRole: actualRole, inputTokens: ai.inputTokens, outputTokens: ai.outputTokens, estimatedCost: null });
    res.json({ project, files: await appStore.projectFiles(project.id), message: assistant, ai });
  } catch (e) { next(e); }
}
router.get('/status', (_req, res) => res.json(aiSetupStatus()));
router.post('/generate-project', validateBody(aiBody), (req, res, next) => handle(req, res, next, 'auto'));
router.post('/modify-project', validateBody(aiBody.required({ projectId: true })), (req, res, next) => handle(req, res, next, 'auto'));
router.post('/review-project', validateBody(aiBody.required({ projectId: true })), (req, res, next) => handle(req, res, next, 'reviewer'));
router.post('/fix-project', validateBody(aiBody.required({ projectId: true })), (req, res, next) => handle(req, res, next, 'fixer'));
router.post('/improve-design', validateBody(aiBody.required({ projectId: true })), (req, res, next) => handle(req, res, next, 'uiux'));
export default router;
