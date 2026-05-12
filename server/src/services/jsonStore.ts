import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { AiUsage, ChatMessage, Project, ProjectFile, User } from '../../../shared/types.js';

type StoredUser = User & { passwordHash: string };
interface StoreData { users: StoredUser[]; projects: Project[]; projectFiles: ProjectFile[]; chatMessages: ChatMessage[]; aiUsage: AiUsage[]; }
const EMPTY: StoreData = { users: [], projects: [], projectFiles: [], chatMessages: [], aiUsage: [] };

export class JsonStore {
  private filePath = path.resolve(process.cwd(), 'data', 'storage.json');
  private queue = Promise.resolve();

  private async read(): Promise<StoreData> {
    try { return JSON.parse(await fs.readFile(this.filePath, 'utf8')) as StoreData; }
    catch { await fs.mkdir(path.dirname(this.filePath), { recursive: true }); await fs.writeFile(this.filePath, JSON.stringify(EMPTY, null, 2)); return structuredClone(EMPTY); }
  }
  private async write(data: StoreData) { await fs.mkdir(path.dirname(this.filePath), { recursive: true }); await fs.writeFile(this.filePath, JSON.stringify(data, null, 2)); }
  private async mutate<T>(fn: (data: StoreData) => T | Promise<T>): Promise<T> {
    const run = async () => { const data = await this.read(); const result = await fn(data); await this.write(data); return result; };
    const next = this.queue.then(run, run); this.queue = next.then(() => undefined, () => undefined); return next;
  }
  now() { return new Date().toISOString(); }
  id() { return randomUUID(); }

  async publicUser(user: StoredUser): Promise<User> { const { passwordHash: _passwordHash, ...safe } = user; return safe; }
  async findUserByEmail(email: string) { const d = await this.read(); return d.users.find((u) => u.email.toLowerCase() === email.toLowerCase()); }
  async findUserById(id: string) { const d = await this.read(); return d.users.find((u) => u.id === id); }
  async createUser(email: string, name: string, passwordHash: string) { return this.mutate((d) => { const now = this.now(); const user: StoredUser = { id: this.id(), email: email.toLowerCase(), name, passwordHash, createdAt: now, updatedAt: now }; d.users.push(user); return user; }); }

  async listProjects(userId: string) { const d = await this.read(); return d.projects.filter((p) => p.userId === userId).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)); }
  async getProject(userId: string, projectId: string) { const d = await this.read(); return d.projects.find((p) => p.id === projectId && p.userId === userId); }
  async createProject(userId: string, name: string, description = '') { return this.mutate((d) => { const now = this.now(); const p: Project = { id: this.id(), userId, name, description, createdAt: now, updatedAt: now }; d.projects.push(p); return p; }); }
  async updateProject(userId: string, projectId: string, patch: Partial<Pick<Project,'name'|'description'>>) { return this.mutate((d) => { const p = d.projects.find((x) => x.id === projectId && x.userId === userId); if (!p) return undefined; Object.assign(p, patch, { updatedAt: this.now() }); return p; }); }
  async deleteProject(userId: string, projectId: string) { return this.mutate((d) => { const p = d.projects.find((x) => x.id === projectId && x.userId === userId); if (!p) return false; d.projects = d.projects.filter((x) => x.id !== projectId); d.projectFiles = d.projectFiles.filter((x) => x.projectId !== projectId); d.chatMessages = d.chatMessages.filter((x) => x.projectId !== projectId); return true; }); }

  async listFiles(projectId: string) { const d = await this.read(); return d.projectFiles.filter((f) => f.projectId === projectId).sort((a,b) => a.path.localeCompare(b.path)); }
  async upsertFile(projectId: string, file: { path: string; language: string; content: string }) { return this.mutate((d) => { const now = this.now(); let existing = d.projectFiles.find((f) => f.projectId === projectId && f.path === file.path); if (existing) { Object.assign(existing, file, { updatedAt: now }); return existing; } existing = { id: this.id(), projectId, ...file, createdAt: now, updatedAt: now }; d.projectFiles.push(existing); return existing; }); }
  async deleteFile(projectId: string, filePath: string) { return this.mutate((d) => { const before = d.projectFiles.length; d.projectFiles = d.projectFiles.filter((f) => !(f.projectId === projectId && f.path === filePath)); return d.projectFiles.length < before; }); }
  async replaceFiles(projectId: string, files: Array<{ path: string; language: string; content: string }>, preserveExisting = true) { return this.mutate((d) => { const now = this.now(); if (!preserveExisting) d.projectFiles = d.projectFiles.filter((f) => f.projectId !== projectId); for (const file of files) { let current = d.projectFiles.find((f) => f.projectId === projectId && f.path === file.path); if (current) Object.assign(current, file, { updatedAt: now }); else d.projectFiles.push({ id: this.id(), projectId, ...file, createdAt: now, updatedAt: now }); } const project = d.projects.find((p) => p.id === projectId); if (project) project.updatedAt = now; return d.projectFiles.filter((f) => f.projectId === projectId).sort((a,b) => a.path.localeCompare(b.path)); }); }
  async addChatMessage(projectId: string, role: ChatMessage['role'], content: string, agentRole?: string, model?: string) { return this.mutate((d) => { const msg: ChatMessage = { id: this.id(), projectId, role, content, agentRole, model, createdAt: this.now() }; d.chatMessages.push(msg); return msg; }); }
  async listChat(projectId: string) { const d = await this.read(); return d.chatMessages.filter((m) => m.projectId === projectId).sort((a,b) => a.createdAt.localeCompare(b.createdAt)); }
  async addUsage(usage: Omit<AiUsage, 'id'|'createdAt'>) { return this.mutate((d) => { const row: AiUsage = { id: this.id(), createdAt: this.now(), ...usage }; d.aiUsage.push(row); return row; }); }
  async listUsage(userId: string) { const d = await this.read(); return d.aiUsage.filter((u) => u.userId === userId).sort((a,b) => b.createdAt.localeCompare(a.createdAt)); }
}
