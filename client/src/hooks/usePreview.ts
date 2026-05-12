import { useMemo } from 'react';
import type { ProjectFile } from '../types/project';
import { buildPreviewHtml } from '../lib/previewBuilder';
export function usePreview(files: ProjectFile[]) { return useMemo(() => buildPreviewHtml(files), [files]); }
