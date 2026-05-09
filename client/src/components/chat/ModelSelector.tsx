const models = ['gpt-4.1-mini','gpt-4.1','gpt-4o-mini'];
export function ModelSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) { return <select className="rounded-lg border border-gray-200 px-2 py-2 text-sm" value={value} onChange={(e)=>onChange(e.target.value)}>{models.map((m)=><option key={m}>{m}</option>)}</select>; }
