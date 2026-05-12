import type { AiProvider, AiRequest, AiResponse } from '../types.js';
export class GeminiProvider implements AiProvider { name = 'gemini' as const; isConfigured() { return Boolean(process.env.GEMINI_API_KEY); } async generateProjectJson(_request: AiRequest): Promise<AiResponse> { throw new Error('Gemini provider is prepared but not enabled in this MVP.'); } }
