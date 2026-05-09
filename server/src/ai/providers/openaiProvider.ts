import OpenAI from 'openai';
import type { AiProvider, AiRequest, AiResponse } from '../types.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import { validateGeneratedProject } from '../validators/projectJsonValidator.js';

export class OpenAIProvider implements AiProvider {
  name = 'openai' as const;
  isConfigured() { return Boolean(process.env.OPENAI_API_KEY); }
  async generateProjectJson(request: AiRequest, systemPrompt: string): Promise<AiResponse> {
    if (!this.isConfigured()) throw new Error('OPENAI_API_KEY is missing. Add it to your environment secrets to enable AI generation.');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const context = request.files?.length ? `\nCurrent files JSON:\n${JSON.stringify(request.files)}` : '';
    const completion = await client.chat.completions.create({
      model: request.model || 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `${systemPrompt}\nRequired JSON keys: projectName, description, summary, projectType, files. projectType must be static, react, or fullstack. Files must contain path, language, content. Return JSON only.` },
        { role: 'user', content: `Project: ${request.projectName ?? 'New project'}\nTarget projectType: ${request.projectType}\nInstruction: ${request.instruction}${context}` }
      ]
    });
    const raw = completion.choices[0]?.message?.content ?? '';
    const project = validateGeneratedProject(safeJsonParse(raw));
    if (project.projectType !== request.projectType) throw new Error(`AI returned projectType ${project.projectType}, expected ${request.projectType}.`);
    return { project, message: project.summary, provider: this.name, model: request.model, inputTokens: completion.usage?.prompt_tokens ?? 0, outputTokens: completion.usage?.completion_tokens ?? 0 };
  }
}
