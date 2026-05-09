import { useState } from 'react';
import type { AgentRole } from '../../types/ai';
import type { ChatMessage } from '../../types/project';
import { Button } from '../ui/Button';
import { AgentSelector } from './AgentSelector';
import { ModelSelector } from './ModelSelector';
import { MessageBubble } from './MessageBubble';
export function ChatPanel({ messages, onSend, loading, model, setModel, agentRole, setAgentRole, error }: { messages: ChatMessage[]; onSend: (text: string) => void; loading: boolean; model: string; setModel: (m: string)=>void; agentRole: AgentRole; setAgentRole: (r: AgentRole)=>void; error?: string }) {
  const [text, setText] = useState('');
  function submit() { if (!text.trim() || loading) return; onSend(text.trim()); setText(''); }
  return <aside className="flex h-full flex-col border-r border-gray-200 bg-gray-50">
    <div className="space-y-2 border-b border-gray-200 p-3"><ModelSelector value={model} onChange={setModel}/><AgentSelector value={agentRole} onChange={setAgentRole}/></div>
    <div className="flex-1 space-y-3 overflow-auto p-3">{messages.length === 0 && <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">Describe an app to generate real files. Try: “Create a modern habit tracker with daily habits, streak counter, add habit form, delete habit button, and clean green design.”</div>}{messages.map((m)=><MessageBubble key={m.id} message={m}/>)}{loading && <div className="text-sm text-gray-500">AI is working…</div>}{error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}</div>
    <div className="border-t border-gray-200 bg-white p-3"><textarea className="h-24 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-accent-500" value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter' && (e.metaKey || e.ctrlKey)) submit(); }} placeholder="Ask the AI to build, modify, fix, review, or redesign…"/><Button className="mt-2 w-full" onClick={submit} disabled={loading || !text.trim()}>Send</Button></div>
  </aside>;
}
