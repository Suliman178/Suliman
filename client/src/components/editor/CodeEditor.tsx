import type { ProjectFile } from '../../types/project';

export function CodeEditor({ file, onChange }: { file?: ProjectFile; onChange: (content: string) => void }) {
  if (!file) {
    return <div className="flex h-full items-center justify-center bg-gray-50 text-gray-500">Select or create a file to edit.</div>;
  }

  return (
    <textarea
      className="h-full w-full resize-none border-0 bg-gray-950 p-4 font-mono text-sm leading-6 text-gray-50 outline-none"
      spellCheck={false}
      value={file.content}
      onChange={(event) => onChange(event.target.value)}
      aria-label={`Code editor for ${file.path}`}
    />
  );
}
