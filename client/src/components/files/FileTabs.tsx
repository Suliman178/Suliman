import { X } from 'lucide-react';
import type { ProjectFile } from '../../types/project';
export function FileTabs({ tabs, selectedPath, onSelect, onClose }: { tabs: ProjectFile[]; selectedPath?: string; onSelect: (path: string)=>void; onClose: (path: string)=>void }) {
  return <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">{tabs.map((file) => <button key={file.path} onClick={() => onSelect(file.path)} className={`flex items-center gap-2 border-r border-slate-200 px-3 py-2 text-xs ${file.path === selectedPath ? 'bg-white font-bold text-green-700' : 'text-slate-600 hover:bg-white'}`}>{file.path}<span onClick={(e) => { e.stopPropagation(); onClose(file.path); }}><X size={12}/></span></button>)}</div>;
}
