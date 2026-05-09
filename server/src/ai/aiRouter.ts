import type { AgentRole } from '../types.js';
import type { AiRequest } from './types.js';
import { OpenAiProvider } from './providers/openaiProvider.js';
import { AnthropicProvider } from './providers/anthropicProvider.js';
import { GeminiProvider } from './providers/geminiProvider.js';
import { coderPrompt } from './prompts/coderPrompt.js';
import { plannerPrompt } from './prompts/plannerPrompt.js';
import { reviewerPrompt } from './prompts/reviewerPrompt.js';
import { fixerPrompt } from './prompts/fixerPrompt.js';
import { uiPrompt } from './prompts/uiPrompt.js';

const providers = { openai: new OpenAiProvider(), anthropic: new AnthropicProvider(), gemini: new GeminiProvider() };
export function inferAgentRole(instruction: string, selected: AgentRole): AgentRole {
  if (selected !== 'auto') return selected;
  const text = instruction.toLowerCase();
  if (/fix|error|bug|broken|crash/.test(text)) return 'fixer';
  if (/beautiful|design|ui|ux|style|redesign/.test(text)) return 'uiux';
  if (/review|check|audit/.test(text)) return 'reviewer';
  if (/plan|architecture/.test(text)) return 'planner';
  return 'coder';
}
function promptFor(role: AgentRole) {
  const base = `${coderPrompt}\nStrictly validate paths: no absolute paths or parent traversal. Preserve unrelated existing files on modification.`;
  return ({ planner: `${plannerPrompt}\n${base}`, coder: base, reviewer: `${reviewerPrompt}\n${base}`, fixer: `${fixerPrompt}\n${base}`, uiux: `${uiPrompt}\n${base}`, auto: base } as Record<AgentRole,string>)[role];
}
export async function routeAi(request: AiRequest) {
  const provider = providers.openai;
  const role = inferAgentRole(request.instruction, request.agentRole);
  return provider.generateProject({ ...request, agentRole: role }, promptFor(role));
}
export function aiSetupStatus() { return { openaiConfigured: providers.openai.isConfigured(), providers: Object.values(providers).map((p) => ({ name: p.name, configured: p.isConfigured() })) }; }
