import { useCallback, useState } from 'react';
import type { ProjectFile } from '../types/project';
export function useFiles(initial: ProjectFile[] = []) { const [files, setFiles] = useState(initial); const upsertLocal = useCallback((file: ProjectFile) => setFiles((prev)=> prev.some((f)=>f.path===file.path) ? prev.map((f)=>f.path===file.path?file:f) : [...prev, file].sort((a,b)=>a.path.localeCompare(b.path))), []); return { files, setFiles, upsertLocal }; }
