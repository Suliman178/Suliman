import { ExternalLink, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ProjectFile } from '../../types/project';
import type { ProjectType } from '../../types/ai';
import { buildPreview } from '../../lib/previewBuilder';
export function LivePreview({ files, projectType }: { files: ProjectFile[]; projectType?: ProjectType }) {
  const [key, setKey] = useState(0); const [error, setError] = useState('');
  const srcDoc = useMemo(() => buildPreview(files, projectType), [files, projectType, key]);
  useEffect(() => { const listener = (event: MessageEvent) => { if (event.data?.type === 'preview-error') setError(event.data.message); }; window.addEventListener('message', listener); return () => window.removeEventListener('message', listener); }, []);
  function openNewTab() { const win = window.open(); if (win) { win.document.write(srcDoc); win.document.close(); } }
  return <section className="flex h-full flex-col panel"><div className="flex items-center justify-between border-b border-slate-200 p-3"><div><h2 className="font-bold">Live Preview</h2>{error && <p className="text-xs text-red-600">{error}</p>}</div><div className="flex gap-2"><button className="btn-secondary px-3" onClick={() => { setError(''); setKey((v) => v + 1); }}><RefreshCw size={15}/></button><button className="btn-secondary px-3" onClick={openNewTab}><ExternalLink size={15}/></button></div></div><iframe key={key} title="Live preview" sandbox="allow-scripts allow-forms allow-modals" className="h-full w-full flex-1 bg-white" srcDoc={srcDoc}/></section>;
}
