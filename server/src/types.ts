export type AgentRole = 'auto' | 'planner' | 'coder' | 'reviewer' | 'fixer' | 'uiux';
export type ChatRole = 'user' | 'assistant' | 'system';

export interface User { id: string; email: string; name?: string | null; createdAt: string; updatedAt: string; }
export interface Project { id: string; userId: string; name: string; description: string; createdAt: string; updatedAt: string; }
export interface ProjectFile { id: string; projectId: string; path: string; language: string; content: string; createdAt: string; updatedAt: string; }
export interface ChatMessage { id: string; projectId: string; role: ChatRole; content: string; agentRole?: AgentRole | null; model?: string | null; createdAt: string; }
export interface AiUsage { id: string; userId: string; projectId?: string | null; provider: string; model: string; agentRole: AgentRole; inputTokens?: number | null; outputTokens?: number | null; estimatedCost?: number | null; createdAt: string; }
export interface GeneratedFile { path: string; language: string; content: string; }
export interface AiProjectJson { projectName: string; description: string; summary: string; files: GeneratedFile[]; }
