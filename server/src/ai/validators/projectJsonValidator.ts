import { z } from 'zod';
import { validateProjectFilePath } from '../../utils/filePathValidator.js';

export const generatedProjectSchema = z.object({
  projectName: z.string().min(1).max(80),
  description: z.string().min(1).max(500),
  summary: z.string().min(1).max(2000),
  files: z.array(z.object({ path: z.string(), language: z.string().min(1).max(40), content: z.string().min(1) })).min(1).max(60)
});

export function validateGeneratedProject(input: unknown) {
  const parsed = generatedProjectSchema.parse(input);
  const seen = new Set<string>();
  const files = parsed.files.map((file) => {
    const path = validateProjectFilePath(file.path);
    if (seen.has(path)) throw new Error(`Duplicate file path: ${path}`);
    seen.add(path);
    return { ...file, path };
  });
  return { ...parsed, files };
}
