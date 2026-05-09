import type { ChatMessage } from '../../types/project';
export function MessageBubble({ message }: { message: Pick<ChatMessage, 'role' | 'content' | 'agentRole' | 'model'> }) {
  const isUser = message.role === 'user';
  return <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-900'}`}><div className="mb-1 text-[11px] font-bold uppercase tracking-wide opacity-70">{isUser ? 'You' : `AI ${message.agentRole ? `· ${message.agentRole}` : ''}`}</div><p className="whitespace-pre-wrap">{message.content}</p></div>;
}
