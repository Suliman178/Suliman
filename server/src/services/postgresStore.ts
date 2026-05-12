import pg from 'pg';
import { randomUUID } from 'node:crypto';
import type { AiUsage, ChatMessage, Project, ProjectFile, User } from '../../../shared/types.js';

type StoredUser = User & { passwordHash: string };
type DbUser = { id: string; email: string; password_hash: string; name: string; created_at: Date; updated_at: Date };
type DbProject = { id: string; user_id: string; name: string; description: string; created_at: Date; updated_at: Date };
type DbProjectFile = { id: string; project_id: string; path: string; language: string; content: string; created_at: Date; updated_at: Date };
type DbChatMessage = { id: string; project_id: string; role: ChatMessage['role']; content: string; agent_role: string | null; model: string | null; created_at: Date };
type DbAiUsage = { id: string; user_id: string; project_id: string | null; provider: string; model: string; agent_role: string; input_tokens: number; output_tokens: number; estimated_cost: string; created_at: Date };

const toIso = (value: Date | string) => value instanceof Date ? value.toISOString() : new Date(value).toISOString();
const userFromRow = (row: DbUser): StoredUser => ({ id: row.id, email: row.email, passwordHash: row.password_hash, name: row.name, createdAt: toIso(row.created_at), updatedAt: toIso(row.updated_at) });
const projectFromRow = (row: DbProject): Project => ({ id: row.id, userId: row.user_id, name: row.name, description: row.description, createdAt: toIso(row.created_at), updatedAt: toIso(row.updated_at) });
const fileFromRow = (row: DbProjectFile): ProjectFile => ({ id: row.id, projectId: row.project_id, path: row.path, language: row.language, content: row.content, createdAt: toIso(row.created_at), updatedAt: toIso(row.updated_at) });
const chatFromRow = (row: DbChatMessage): ChatMessage => ({ id: row.id, projectId: row.project_id, role: row.role, content: row.content, agentRole: row.agent_role ?? undefined, model: row.model ?? undefined, createdAt: toIso(row.created_at) });
const usageFromRow = (row: DbAiUsage): AiUsage => ({ id: row.id, userId: row.user_id, projectId: row.project_id ?? undefined, provider: row.provider, model: row.model, agentRole: row.agent_role, inputTokens: row.input_tokens, outputTokens: row.output_tokens, estimatedCost: Number(row.estimated_cost), createdAt: toIso(row.created_at) });

export class PostgresStore {
  private pool: pg.Pool;
  private initialized: Promise<void>;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({ connectionString });
    this.initialized = this.init();
  }

  id() { return randomUUID(); }
  async ready() { await this.initialized; }

  private async query<T extends pg.QueryResultRow>(sql: string, values: unknown[] = []) {
    await this.ready();
    return this.pool.query<T>(sql, values);
  }

  private async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY,
        email text NOT NULL UNIQUE,
        password_hash text NOT NULL,
        name text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS projects (
        id text PRIMARY KEY,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name text NOT NULL,
        description text NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS project_files (
        id text PRIMARY KEY,
        project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        path text NOT NULL,
        language text NOT NULL,
        content text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(project_id, path)
      );
      CREATE TABLE IF NOT EXISTS chat_messages (
        id text PRIMARY KEY,
        project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        role text NOT NULL CHECK (role IN ('user','assistant','system')),
        content text NOT NULL,
        agent_role text,
        model text,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS ai_usage (
        id text PRIMARY KEY,
        user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_id text REFERENCES projects(id) ON DELETE SET NULL,
        provider text NOT NULL,
        model text NOT NULL,
        agent_role text NOT NULL,
        input_tokens integer NOT NULL DEFAULT 0,
        output_tokens integer NOT NULL DEFAULT 0,
        estimated_cost numeric NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);
  }

  async publicUser(user: StoredUser): Promise<User> { const { passwordHash: _passwordHash, ...safe } = user; return safe; }
  async findUserByEmail(email: string) { const result = await this.query<DbUser>('SELECT * FROM users WHERE lower(email) = lower($1) LIMIT 1', [email]); return result.rows[0] ? userFromRow(result.rows[0]) : undefined; }
  async findUserById(id: string) { const result = await this.query<DbUser>('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]); return result.rows[0] ? userFromRow(result.rows[0]) : undefined; }
  async createUser(email: string, name: string, passwordHash: string) { const result = await this.query<DbUser>('INSERT INTO users (id,email,password_hash,name) VALUES ($1,lower($2),$3,$4) RETURNING *', [this.id(), email, passwordHash, name]); return userFromRow(result.rows[0]); }

  async listProjects(userId: string) { const result = await this.query<DbProject>('SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC', [userId]); return result.rows.map(projectFromRow); }
  async getProject(userId: string, projectId: string) { const result = await this.query<DbProject>('SELECT * FROM projects WHERE id = $1 AND user_id = $2 LIMIT 1', [projectId, userId]); return result.rows[0] ? projectFromRow(result.rows[0]) : undefined; }
  async createProject(userId: string, name: string, description = '') { const result = await this.query<DbProject>('INSERT INTO projects (id,user_id,name,description) VALUES ($1,$2,$3,$4) RETURNING *', [this.id(), userId, name, description]); return projectFromRow(result.rows[0]); }
  async updateProject(userId: string, projectId: string, patch: Partial<Pick<Project, 'name' | 'description'>>) {
    const current = await this.getProject(userId, projectId);
    if (!current) return undefined;
    const result = await this.query<DbProject>('UPDATE projects SET name = $3, description = $4, updated_at = now() WHERE id = $1 AND user_id = $2 RETURNING *', [projectId, userId, patch.name ?? current.name, patch.description ?? current.description]);
    return result.rows[0] ? projectFromRow(result.rows[0]) : undefined;
  }
  async deleteProject(userId: string, projectId: string) { const result = await this.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]); return (result.rowCount ?? 0) > 0; }

  async listFiles(projectId: string) { const result = await this.query<DbProjectFile>('SELECT * FROM project_files WHERE project_id = $1 ORDER BY path ASC', [projectId]); return result.rows.map(fileFromRow); }
  async upsertFile(projectId: string, file: { path: string; language: string; content: string }) {
    const result = await this.query<DbProjectFile>(`INSERT INTO project_files (id,project_id,path,language,content) VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (project_id,path) DO UPDATE SET language = EXCLUDED.language, content = EXCLUDED.content, updated_at = now()
      RETURNING *`, [this.id(), projectId, file.path, file.language, file.content]);
    await this.query('UPDATE projects SET updated_at = now() WHERE id = $1', [projectId]);
    return fileFromRow(result.rows[0]);
  }
  async deleteFile(projectId: string, filePath: string) { const result = await this.query('DELETE FROM project_files WHERE project_id = $1 AND path = $2', [projectId, filePath]); await this.query('UPDATE projects SET updated_at = now() WHERE id = $1', [projectId]); return (result.rowCount ?? 0) > 0; }
  async replaceFiles(projectId: string, files: Array<{ path: string; language: string; content: string }>, preserveExisting = true) {
    const client = await this.pool.connect();
    try {
      await this.ready();
      await client.query('BEGIN');
      if (!preserveExisting) await client.query('DELETE FROM project_files WHERE project_id = $1', [projectId]);
      for (const file of files) {
        await client.query(`INSERT INTO project_files (id,project_id,path,language,content) VALUES ($1,$2,$3,$4,$5)
          ON CONFLICT (project_id,path) DO UPDATE SET language = EXCLUDED.language, content = EXCLUDED.content, updated_at = now()`, [this.id(), projectId, file.path, file.language, file.content]);
      }
      await client.query('UPDATE projects SET updated_at = now() WHERE id = $1', [projectId]);
      await client.query('COMMIT');
      return this.listFiles(projectId);
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  }

  async addChatMessage(projectId: string, role: ChatMessage['role'], content: string, agentRole?: string, model?: string) { const result = await this.query<DbChatMessage>('INSERT INTO chat_messages (id,project_id,role,content,agent_role,model) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [this.id(), projectId, role, content, agentRole ?? null, model ?? null]); return chatFromRow(result.rows[0]); }
  async listChat(projectId: string) { const result = await this.query<DbChatMessage>('SELECT * FROM chat_messages WHERE project_id = $1 ORDER BY created_at ASC', [projectId]); return result.rows.map(chatFromRow); }
  async addUsage(usage: Omit<AiUsage, 'id' | 'createdAt'>) { const result = await this.query<DbAiUsage>('INSERT INTO ai_usage (id,user_id,project_id,provider,model,agent_role,input_tokens,output_tokens,estimated_cost) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', [this.id(), usage.userId, usage.projectId ?? null, usage.provider, usage.model, usage.agentRole, usage.inputTokens, usage.outputTokens, usage.estimatedCost]); return usageFromRow(result.rows[0]); }
  async listUsage(userId: string) { const result = await this.query<DbAiUsage>('SELECT * FROM ai_usage WHERE user_id = $1 ORDER BY created_at DESC', [userId]); return result.rows.map(usageFromRow); }
}
