import { index, numeric, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => [index('projects_user_id_idx').on(table.userId)]);

export const projectFiles = pgTable('project_files', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  path: text('path').notNull(),
  language: text('language').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (table) => [
  uniqueIndex('project_files_project_id_path_unique').on(table.projectId, table.path),
  index('project_files_project_id_idx').on(table.projectId)
]);

export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  agentRole: text('agent_role'),
  model: text('model'),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => [index('chat_messages_project_id_idx').on(table.projectId)]);

export const aiUsage = pgTable('ai_usage', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  agentRole: text('agent_role').notNull(),
  inputTokens: numeric('input_tokens'),
  outputTokens: numeric('output_tokens'),
  estimatedCost: numeric('estimated_cost'),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (table) => [index('ai_usage_user_id_idx').on(table.userId)]);
