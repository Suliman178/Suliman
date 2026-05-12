export function ModelSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <label className="text-xs font-semibold text-slate-600">Model<select className="input mt-1" value={value} onChange={(e) => onChange(e.target.value)}><option value="gpt-4o-mini">OpenAI GPT-4o mini</option><option value="gpt-4o">OpenAI GPT-4o</option><option value="gpt-4.1-mini">OpenAI GPT-4.1 mini</option></select></label>;
}
