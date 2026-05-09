import type { AiProvider } from './baseProvider.js';
export class GeminiProvider implements AiProvider { name = 'gemini'; isConfigured(){ return Boolean(process.env.GEMINI_API_KEY); } async generateProject(){ throw new Error('Gemini provider is prepared but not enabled yet.'); } }
