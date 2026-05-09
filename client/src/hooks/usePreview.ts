import { useMemo } from 'react';
import type { ProjectFile } from '../types/project';
import { buildPreview } from '../lib/previewBuilder';
export function usePreview(files: ProjectFile[]) { return useMemo(() => buildPreview(files), [files]); }
