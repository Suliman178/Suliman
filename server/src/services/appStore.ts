import { and, desc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { AgentRole, AiUsage, ChatMessage, Project, ProjectFile } from '../types.js';
import { db, hasDatabase } from '../db/db.js';
import { aiUsage, chatMessages, projectFiles, projects, users } from '../db/schema.js';
import { store, type StoredUser } from './memoryStore.js';

const now = () => new Date();
const iso = (value: Date | string) => value instanceof Date ? value.toISOString() : value;

type DbUser = typeof users.$inferSelect;
type DbProject = typeof projects.$inferSelect;
type DbFile = typeof projectFiles.$inferSelect;
type DbMessage = typeof chatMessages.$inferSelect;
type DbUsage = typeof aiUsage.$inferSelect;

function mapUser(user: DbUser): StoredUser {
  return { id: user.id, email: user.email, passwordHash: user.passwordHash || '', name: user.name, createdAt: iso(user.createdAt), updatedAt: iso(user.updatedAt) };
}
function mapProject(project: DbProject): Project {
  return { id: project.id, userId: project.userId, name: project.name, description: project.description, createdAt: iso(project.createdAt), updatedAt: iso(project.updatedAt) };
}
function mapFile(file: DbFile): ProjectFile {
  return { id: file.id, projectId: file.projectId, path: file.path, language: file.language, content: file.content, createdAt: iso(file.createdAt), updatedAt: iso(file.updatedAt) };
}
function mapMessage(message: DbMessage): ChatMessage {
  return { id: message.id, projectId: message.projectId, role: message.role as ChatMessage['role'], content: message.content, agentRole: message.agentRole as AgentRole | null, model: message.model, createdAt: iso(message.createdAt) };
}
function mapUsage(item: DbUsage): AiUsage {
  return { id: item.id, userId: item.userId, projectId: item.projectId, provider: item.provider, model: item.model, agentRole: item.agentRole as AgentRole, inputTokens: item.inputTokens == null ? null : Number(item.inputTokens), outputTokens: item.outputTokens == null ? null : Number(item.outputTokens), estimatedCost: item.estimatedCost == null ? null : Number(item.estimatedCost), createdAt: iso(item.createdAt) };
}

export const appStore = {
  databaseEnabled: hasDatabase,
  async createUser(email: string, passwordHash: string, name?: string) {
    if (!db) return store.createUser(email, passwordHash, name);
    const [user] = await db.insert(users).values({ id: nanoid(), email: email.toLowerCase(), passwordHash, name: name || email.split('@')[0], createdAt: now(), updatedAt: now() }).returning();
    return mapUser(user);
  },
  async findUserByEmail(email: string) {
    if (!db) return store.findUserByEmail(email);
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    return user ? mapUser(user) : undefined;
  },
  async findUserById(userId: string) {
    if (!db) return store.users.get(userId);
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user ? mapUser(user) : undefined;
  },
  async createProject(userId: string, name: string, description = '') {
    if (!db) return store.createProject(userId, name, description);
    const [project] = await db.insert(projects).values({ id: nanoid(), userId, name, description, createdAt: now(), updatedAt: now() }).returning();
    return mapProject(project);
  },
  async listProjects(userId: string) {
    if (!db) return [...store.projects.values()].filter((p) => p.userId === userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const rows = await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
    return rows.map(mapProject);
  },
  async getProject(projectId: string) {
    if (!db) return store.projects.get(projectId);
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    return project ? mapProject(project) : undefined;
  },
  async updateProject(projectId: string, patch: Partial<Pick<Project, 'name' | 'description'>>) {
    if (!db) return store.updateProject(projectId, patch);
    const [project] = await db.update(projects).set({ ...patch, updatedAt: now() }).where(eq(projects.id, projectId)).returning();
    return project ? mapProject(project) : undefined;
  },
  async deleteProject(projectId: string) {
    if (!db) return store.deleteProject(projectId);
    await db.delete(projects).where(eq(projects.id, projectId));
  },
  async projectFiles(projectId: string) {
    if (!db) return store.projectFiles(projectId);
    const rows = await db.select().from(projectFiles).where(eq(projectFiles.projectId, projectId)).orderBy(projectFiles.path);
    return rows.map(mapFile);
  },
  async upsertFile(projectId: string, path: string, language: string, content: string) {
    if (!db) return store.upsertFile(projectId, path, language, content);
    const [file] = await db.insert(projectFiles).values({ id: nanoid(), projectId, path, language, content, createdAt: now(), updatedAt: now() }).onConflictDoUpdate({ target: [projectFiles.projectId, projectFiles.path], set: { language, content, updatedAt: now() } }).returning();
    await this.updateProject(projectId, {});
    return mapFile(file);
  },
  async deleteFile(projectId: string, path: string) {
    if (!db) return store.deleteFile(projectId, path);
    await db.delete(projectFiles).where(and(eq(projectFiles.projectId, projectId), eq(projectFiles.path, path)));
    await this.updateProject(projectId, {});
  },
  async messages(projectId: string) {
    if (!db) return [...store.messages.values()].filter((m) => m.projectId === projectId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const rows = await db.select().from(chatMessages).where(eq(chatMessages.projectId, projectId)).orderBy(chatMessages.createdAt);
    return rows.map(mapMessage);
  },
  async addMessage(projectId: string, role: ChatMessage['role'], content: string, agentRole?: AgentRole, model?: string) {
    if (!db) return store.addMessage(projectId, role, content, agentRole, model);
    const [message] = await db.insert(chatMessages).values({ id: nanoid(), projectId, role, content, agentRole, model, createdAt: now() }).returning();
    return mapMessage(message);
  },
  async addUsage(input: Omit<AiUsage, 'id' | 'createdAt'>) {
    if (!db) return store.addUsage(input);
    const [item] = await db.insert(aiUsage).values({ id: nanoid(), ...input, inputTokens: input.inputTokens?.toString(), outputTokens: input.outputTokens?.toString(), estimatedCost: input.estimatedCost?.toString(), createdAt: now() }).returning();
    return mapUsage(item);
  },
  async usage(userId: string) {
    if (!db) return [...store.usage.values()].filter((u) => u.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const rows = await db.select().from(aiUsage).where(eq(aiUsage.userId, userId)).orderBy(desc(aiUsage.createdAt));
    return rows.map(mapUsage);
  }
};
