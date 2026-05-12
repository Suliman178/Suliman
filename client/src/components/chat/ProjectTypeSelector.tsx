import type { ProjectType } from '../../types/ai';

const options: Array<{ value: ProjectType; label: string }> = [
  { value: 'static', label: 'Static HTML/CSS/JS' },
  { value: 'react', label: 'React App' },
  { value: 'fullstack', label: 'Full-stack App' }
];

export function ProjectTypeSelector({ value, onChange }: { value: ProjectType; onChange: (value: ProjectType) => void }) {
  return <label className="text-xs font-semibold text-slate-600">Project type<select className="input mt-1" value={value} onChange={(event) => onChange(event.target.value as ProjectType)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}
