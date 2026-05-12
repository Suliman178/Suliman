import type { AgentRole } from '../../types/ai';
export function AgentSelector({ value, onChange }: { value: AgentRole; onChange: (v: AgentRole) => void }) {
  return <label className="text-xs font-semibold text-slate-600">Agent mode<select className="input mt-1" value={value} onChange={(e) => onChange(e.target.value as AgentRole)}>{['auto','planner','coder','reviewer','fixer','uiux'].map((a) => <option key={a} value={a}>{a === 'uiux' ? 'UI/UX' : a[0].toUpperCase()+a.slice(1)}</option>)}</select></label>;
}
