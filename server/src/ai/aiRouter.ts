import type { AgentRole, GeneratedProjectJson } from '../../../shared/types.js';
import type { AiRequest, AiResponse } from './types.js';
import { OpenAIProvider } from './providers/openaiProvider.js';
import { AnthropicProvider } from './providers/anthropicProvider.js';
import { GeminiProvider } from './providers/geminiProvider.js';
import { plannerPrompt } from './prompts/plannerPrompt.js';
import { coderPrompt } from './prompts/coderPrompt.js';
import { reviewerPrompt } from './prompts/reviewerPrompt.js';
import { fixerPrompt } from './prompts/fixerPrompt.js';
import { uiPrompt } from './prompts/uiPrompt.js';

const fallbackProject = (instruction: string): GeneratedProjectJson => ({
  projectName: 'Starter App', description: `Generated starter for: ${instruction}`, summary: 'OPENAI_API_KEY is not configured, so a local working starter app was generated. Add OPENAI_API_KEY for full AI generation.',
  files: [
    { path: 'index.html', language: 'html', content: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Starter App</title>\n  <link rel="stylesheet" href="style.css" />\n</head>\n<body>\n  <main class="app">\n    <section class="hero">\n      <p class="eyebrow">AI App Builder</p>\n      <h1>Starter project ready</h1>\n      <p id="requestText"></p>\n      <div class="actions">\n        <input id="itemInput" placeholder="Add an item" />\n        <button id="addBtn">Add item</button>\n      </div>\n      <ul id="items"></ul>\n    </section>\n  </main>\n  <script src="script.js"></script>\n</body>\n</html>' },
    { path: 'style.css', language: 'css', content: ':root{font-family:Inter,system-ui,sans-serif;color:#111827;background:#fff}body{margin:0}.app{min-height:100vh;display:grid;place-items:center;padding:32px;background:linear-gradient(135deg,#fff,#f0fdf4)}.hero{width:min(760px,100%);background:white;border:1px solid #dcfce7;border-radius:28px;padding:40px;box-shadow:0 20px 60px rgba(22,163,74,.12)}.eyebrow{color:#16a34a;font-weight:800;letter-spacing:.12em;text-transform:uppercase}h1{font-size:clamp(36px,6vw,64px);line-height:1;margin:0 0 16px}.actions{display:flex;gap:12px;margin:28px 0}input{flex:1;border:1px solid #d1d5db;border-radius:14px;padding:14px 16px;font-size:16px}button{border:0;border-radius:14px;background:#16a34a;color:white;font-weight:800;padding:14px 18px;cursor:pointer}button:hover{background:#15803d}li{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:1px solid #e5e7eb}li button{background:#111827;padding:8px 10px}' },
    { path: 'script.js', language: 'javascript', content: 'const request = ' + JSON.stringify(instruction) + ';\nconst items = [];\nconst list = document.getElementById("items");\ndocument.getElementById("requestText").textContent = `Requested: ${request}`;\nfunction render(){\n  list.innerHTML = items.map((item,index)=>`<li><span>${item}</span><button data-index="${index}">Delete</button></li>`).join("");\n}\ndocument.getElementById("addBtn").addEventListener("click",()=>{\n  const input = document.getElementById("itemInput");\n  const value = input.value.trim();\n  if(!value) return;\n  items.push(value); input.value = ""; render();\n});\nlist.addEventListener("click",(event)=>{\n  const button = event.target.closest("button[data-index]");\n  if(!button) return;\n  items.splice(Number(button.dataset.index),1); render();\n});\nrender();' }
  ]
});

export class AiRouter {
  private providers = [new OpenAIProvider(), new AnthropicProvider(), new GeminiProvider()];
  routeAgent(instruction: string, requested: AgentRole): AgentRole {
    if (requested !== 'auto') return requested;
    const text = instruction.toLowerCase();
    if (/fix|error|broken|bug/.test(text)) return 'fixer';
    if (/beautiful|design|ui|ux|style|redesign/.test(text)) return 'uiux';
    if (/review|check|audit/.test(text)) return 'reviewer';
    if (/plan|architecture/.test(text)) return 'planner';
    return 'coder';
  }
  private promptFor(role: AgentRole) { return role === 'planner' ? plannerPrompt : role === 'reviewer' ? reviewerPrompt : role === 'fixer' ? fixerPrompt : role === 'uiux' ? uiPrompt : coderPrompt; }
  async run(request: AiRequest): Promise<AiResponse> {
    const role = this.routeAgent(request.instruction, request.agentRole);
    const provider = this.providers[0];
    if (!provider.isConfigured()) {
      const project = fallbackProject(request.instruction);
      return { project, message: project.summary, provider: 'openai', model: request.model || 'gpt-4o-mini', inputTokens: 0, outputTokens: 0 };
    }
    return provider.generateProjectJson({ ...request, agentRole: role }, this.promptFor(role));
  }
}
export const aiRouter = new AiRouter();
