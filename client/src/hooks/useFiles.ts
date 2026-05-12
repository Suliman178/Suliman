import { useState } from 'react';
import type { ProjectFile } from '../types/project';
export function useFiles(initial: ProjectFile[] = []) { const [files, setFiles] = useState(initial); return { files, setFiles }; }
