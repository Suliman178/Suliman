export type AgentRole = 'auto' | 'planner' | 'coder' | 'reviewer' | 'fixer' | 'uiux';
export type ChatRole = 'user' | 'assistant' | 'system';
export type ProjectType = 'static' | 'react' | 'fullstack';

export interface User { id: string; email: string; name: string; createdAt: string; updatedAt: string; }
export interface Project { id: string; userId: string; name: string; description: string; createdAt: string; updatedAt: string; }
export interface ProjectFile { id: string; projectId: string; path: string; language: string; content: string; createdAt: string; updatedAt: string; }
export interface ChatMessage { id: string; projectId: string; role: ChatRole; content: string; agentRole?: string; model?: string; createdAt: string; }
export interface AiUsage { id: string; userId: string; projectId?: string; provider: string; model: string; agentRole: string; inputTokens: number; outputTokens: number; estimatedCost: number; createdAt: string; }
export interface GeneratedProjectJson { projectName: string; description: string; summary: string; projectType: ProjectType; files: Array<{ path: string; language: string; content: string; }>; }
