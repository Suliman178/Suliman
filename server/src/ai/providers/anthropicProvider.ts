import type { AiProvider, AiRequest, AiResponse } from '../types.js';
export class AnthropicProvider implements AiProvider { name = 'anthropic' as const; isConfigured() { return Boolean(process.env.ANTHROPIC_API_KEY); } async generateProjectJson(_request: AiRequest): Promise<AiResponse> { throw new Error('Anthropic provider is prepared but not enabled in this MVP.'); } }
