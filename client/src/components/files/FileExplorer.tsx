import { FilePlus, Trash2 } from 'lucide-react';
import type { ProjectFile } from '../../types/project';
import { iconForLanguage } from '../../lib/fileLanguage';

export function FileExplorer({ files, selectedPath, onSelect, onCreate, onDelete }: { files: ProjectFile[]; selectedPath?: string; onSelect: (path: string)=>void; onCreate: ()=>void; onDelete: (path: string)=>void }) {
  return <aside className="flex h-full w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
    <div className="flex items-center justify-between border-b border-slate-200 p-3"><h3 className="text-sm font-bold">Files</h3><button className="rounded-lg p-2 hover:bg-slate-100" title="Create file" onClick={onCreate}><FilePlus size={16}/></button></div>
    <div className="flex-1 overflow-auto p-2">{files.length === 0 && <p className="p-3 text-xs text-slate-500">No files yet. Generate with AI or create a file.</p>}{files.map((file) => <div key={file.path} className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm ${selectedPath === file.path ? 'bg-green-50 font-semibold text-green-800' : 'hover:bg-slate-50'}`}><button className="min-w-0 flex-1 truncate text-left" title={file.path} onClick={() => onSelect(file.path)}><span className="mr-2">{iconForLanguage(file.language)}</span>{file.path}</button><button className="opacity-0 group-hover:opacity-100" title="Delete file" onClick={() => onDelete(file.path)}><Trash2 size={14}/></button></div>)}</div>
  </aside>;
}
