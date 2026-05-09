import { nanoid } from 'nanoid';
import type { AiUsage, ChatMessage, Project, ProjectFile, User } from '../types.js';

export interface StoredUser extends User { passwordHash: string; }
const now = () => new Date().toISOString();

class MemoryStore {
  users = new Map<string, StoredUser>();
  projects = new Map<string, Project>();
  files = new Map<string, ProjectFile>();
  messages = new Map<string, ChatMessage>();
  usage = new Map<string, AiUsage>();

  createUser(email: string, passwordHash: string, name?: string) {
    const user: StoredUser = { id: nanoid(), email: email.toLowerCase(), passwordHash, name: name || email.split('@')[0], createdAt: now(), updatedAt: now() };
    this.users.set(user.id, user);
    return user;
  }
  findUserByEmail(email: string) { return [...this.users.values()].find((u) => u.email === email.toLowerCase()); }
  createProject(userId: string, name: string, description = '') {
    const project: Project = { id: nanoid(), userId, name, description, createdAt: now(), updatedAt: now() };
    this.projects.set(project.id, project); return project;
  }
  updateProject(id: string, patch: Partial<Pick<Project, 'name' | 'description'>>) {
    const p = this.projects.get(id); if (!p) return undefined;
    const next = { ...p, ...patch, updatedAt: now() }; this.projects.set(id, next); return next;
  }
  deleteProject(id: string) {
    this.projects.delete(id);
    for (const [fid, f] of this.files) if (f.projectId === id) this.files.delete(fid);
    for (const [mid, m] of this.messages) if (m.projectId === id) this.messages.delete(mid);
  }
  projectFiles(projectId: string) { return [...this.files.values()].filter((f) => f.projectId === projectId).sort((a,b)=>a.path.localeCompare(b.path)); }
  upsertFile(projectId: string, path: string, language: string, content: string) {
    const existing = [...this.files.values()].find((f) => f.projectId === projectId && f.path === path);
    if (existing) { const updated = { ...existing, language, content, updatedAt: now() }; this.files.set(existing.id, updated); return updated; }
    const file: ProjectFile = { id: nanoid(), projectId, path, language, content, createdAt: now(), updatedAt: now() };
    this.files.set(file.id, file); return file;
  }
  deleteFile(projectId: string, path: string) {
    const existing = [...this.files.values()].find((f) => f.projectId === projectId && f.path === path);
    if (existing) this.files.delete(existing.id);
  }
  addMessage(projectId: string, role: ChatMessage['role'], content: string, agentRole?: any, model?: string) {
    const msg: ChatMessage = { id: nanoid(), projectId, role, content, agentRole, model, createdAt: now() };
    this.messages.set(msg.id, msg); return msg;
  }
  addUsage(usage: Omit<AiUsage, 'id' | 'createdAt'>) {
    const item: AiUsage = { id: nanoid(), createdAt: now(), ...usage };
    this.usage.set(item.id, item); return item;
  }
}
export const store = new MemoryStore();
