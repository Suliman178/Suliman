import type { AiRequest, AiResponse } from '../types.js';
export interface AiProvider { name: string; isConfigured(): boolean; generateProject(request: AiRequest, systemPrompt: string): Promise<AiResponse>; }
