import { z } from 'zod';
import { validateProjectFilePath } from '../../utils/filePathValidator.js';

export const generatedProjectSchema = z.object({
  projectName: z.string().min(1).max(80),
  description: z.string().min(1).max(500),
  summary: z.string().min(1).max(2000),
  projectType: z.enum(['static', 'react', 'fullstack']),
  files: z.array(z.object({ path: z.string(), language: z.string().min(1).max(40), content: z.string().min(1) })).min(1).max(120)
});

const requiredByType = {
  static: ['index.html', 'style.css', 'script.js'],
  react: ['package.json', 'src/App.tsx', 'src/main.tsx'],
  fullstack: ['package.json', 'client/src/App.tsx', 'client/src/main.tsx', 'server/src/index.ts', 'server/src/db/schema.ts', 'shared/types.ts']
} as const;

export function validateGeneratedProject(input: unknown) {
  const parsed = generatedProjectSchema.parse(input);
  const seen = new Set<string>();
  const files = parsed.files.map((file) => {
    const path = validateProjectFilePath(file.path);
    if (seen.has(path)) throw new Error(`Duplicate file path: ${path}`);
    seen.add(path);
    return { ...file, path };
  });

  for (const requiredPath of requiredByType[parsed.projectType]) {
    if (!seen.has(requiredPath)) throw new Error(`Generated ${parsed.projectType} project is missing required file: ${requiredPath}`);
  }

  return { ...parsed, files };
}
