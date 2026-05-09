import OpenAI from 'openai';
import type { AiProvider } from './baseProvider.js';
import type { AiRequest, AiResponse } from '../types.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import { validateAiProjectJson } from '../validators/projectJsonValidator.js';

export class OpenAiProvider implements AiProvider {
  name = 'openai';
  isConfigured() { return Boolean(process.env.OPENAI_API_KEY); }
  async generateProject(request: AiRequest, systemPrompt: string): Promise<AiResponse> {
    if (!this.isConfigured()) { const error = new Error('OPENAI_API_KEY is missing. Add it to environment secrets to enable AI generation.'); (error as any).status = 400; throw error; }
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const current = request.currentFiles?.length ? `\nCurrent files JSON:\n${JSON.stringify(request.currentFiles)}` : '';
    const completion = await client.chat.completions.create({
      model: request.model || 'gpt-4.1-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${request.instruction}${current}` }
      ]
    });
    const content = completion.choices[0]?.message?.content || '{}';
    const project = validateAiProjectJson(safeJsonParse(content));
    return { project, text: project.summary, provider: this.name, model: request.model, inputTokens: completion.usage?.prompt_tokens, outputTokens: completion.usage?.completion_tokens };
  }
}
