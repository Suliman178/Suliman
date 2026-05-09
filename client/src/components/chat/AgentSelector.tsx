import type { AgentRole } from '../../types/ai';
const roles: AgentRole[] = ['auto','planner','coder','reviewer','fixer','uiux'];
export function AgentSelector({ value, onChange }: { value: AgentRole; onChange: (v: AgentRole) => void }) { return <select className="rounded-lg border border-gray-200 px-2 py-2 text-sm" value={value} onChange={(e)=>onChange(e.target.value as AgentRole)}>{roles.map((r)=><option key={r} value={r}>{r === 'uiux' ? 'UI/UX' : r[0].toUpperCase()+r.slice(1)}</option>)}</select>; }
