import type { AgentRole, GeneratedProjectJson, ProjectType } from '../../../shared/types.js';
export type AiProviderName = 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'huggingface' | 'nvidia' | 'local';
export interface AiFileContext { path: string; language: string; content: string; }
export interface AiRequest { instruction: string; agentRole: AgentRole; model: string; projectType: ProjectType; projectName?: string; files?: AiFileContext[]; }
export interface AiResponse { project?: GeneratedProjectJson; message: string; provider: AiProviderName; model: string; inputTokens: number; outputTokens: number; }
export interface AiProvider { name: AiProviderName; isConfigured(): boolean; generateProjectJson(request: AiRequest, systemPrompt: string): Promise<AiResponse>; }
