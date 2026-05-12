import type { FormEvent } from 'react';
import { Send } from 'lucide-react';
import type { AgentRole, ProjectType } from '../../types/ai';
import type { ChatMessage } from '../../types/project';
import { AgentSelector } from './AgentSelector';
import { MessageBubble } from './MessageBubble';
import { ModelSelector } from './ModelSelector';
import { ProjectTypeSelector } from './ProjectTypeSelector';

export function ChatPanel(props: {
  messages: ChatMessage[];
  model: string;
  agent: AgentRole;
  projectType: ProjectType;
  realAiDisabled: boolean;
  loading: boolean;
  error?: string;
  onModelChange: (v: string) => void;
  onAgentChange: (v: AgentRole) => void;
  onProjectTypeChange: (v: ProjectType) => void;
  onSend: (text: string) => void;
}) {
  const { messages, model, agent, projectType, realAiDisabled, loading, error } = props;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const text = String(formData.get('message') || '').trim();
    if (text) {
      props.onSend(text);
      form.reset();
    }
  };

  return (
    <section className="flex h-full flex-col panel">
      <div className="border-b border-slate-200 p-4">
        <h2 className="font-bold">AI Agent</h2>
        <div className="mt-3 grid gap-3">
          <ProjectTypeSelector value={projectType} onChange={props.onProjectTypeChange} />
          <ModelSelector value={model} onChange={props.onModelChange} />
          <AgentSelector value={agent} onChange={props.onAgentChange} />
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-4">
        {realAiDisabled && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-base font-bold leading-relaxed text-amber-900">
            Real AI generation is disabled. Add OPENAI_API_KEY to enable serious AI generation.
          </div>
        )}
        {messages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            Describe the app you want. Example: "Create a modern habit tracker with daily habits, streak counter, add
            habit form, delete habit button, and clean green design."
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {loading && <div className="rounded-2xl bg-slate-100 p-4 text-sm">AI is building your files...</div>}
        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      </div>
      <form onSubmit={submit} className="border-t border-slate-200 p-4">
        <textarea
          name="message"
          className="input min-h-24 resize-none"
          placeholder="Ask AI to build, modify, fix, review, or redesign..."
          disabled={loading}
        />
        <button className="btn-primary mt-3 w-full" disabled={loading}>
          <Send size={16} />
          <span className="ml-2">Send</span>
        </button>
      </form>
    </section>
  );
}
