import Editor from '@monaco-editor/react';
import type { ProjectFile } from '../../types/project';
export function CodeEditor({ file, onChange }: { file?: ProjectFile; onChange: (content: string)=>void }) {
  if (!file) return <div className="grid h-full place-items-center bg-white text-slate-500">Select or create a file to edit.</div>;
  return <Editor height="100%" path={file.path} language={file.language} value={file.content} theme="vs" onChange={(value) => onChange(value || '')} options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', automaticLayout: true }} />;
}
