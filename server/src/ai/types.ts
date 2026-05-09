import type { AgentRole, AiProjectJson, GeneratedFile } from '../types.js';
export interface AiRequest { instruction: string; agentRole: AgentRole; model: string; currentFiles?: GeneratedFile[]; projectName?: string; }
export interface AiResponse { project?: AiProjectJson; text: string; provider: string; model: string; inputTokens?: number; outputTokens?: number; }
