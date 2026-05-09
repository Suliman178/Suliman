import { appStore } from './appStore.js';
import { sanitizePath, languageFromPath } from '../utils/filePathValidator.js';
import type { GeneratedFile } from '../types.js';
export async function assertProjectOwner(projectId: string, userId: string) {
  const project = await appStore.getProject(projectId);
  if (!project || project.userId !== userId) { const err = new Error('Project not found'); (err as any).status = 404; throw err; }
  return project;
}
export async function saveGeneratedFiles(projectId: string, files: GeneratedFile[], preserve = true) {
  if (!preserve) {
    for (const file of await appStore.projectFiles(projectId)) await appStore.deleteFile(projectId, file.path);
  }
  const saved = [];
  for (const f of files) saved.push(await appStore.upsertFile(projectId, sanitizePath(f.path), f.language || languageFromPath(f.path), f.content));
  return saved;
}
