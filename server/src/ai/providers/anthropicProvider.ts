import type { AiProvider } from './baseProvider.js';
export class AnthropicProvider implements AiProvider { name = 'anthropic'; isConfigured(){ return Boolean(process.env.ANTHROPIC_API_KEY); } async generateProject(){ throw new Error('Anthropic provider is prepared but not enabled yet.'); } }
