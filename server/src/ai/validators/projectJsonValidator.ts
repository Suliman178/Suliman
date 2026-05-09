import { z } from 'zod';
import { sanitizePath } from '../../utils/filePathValidator.js';

export const generatedFileSchema = z.object({ path: z.string().min(1), language: z.string().min(1), content: z.string().min(1) });
export const aiProjectSchema = z.object({ projectName: z.string().min(1), description: z.string().default(''), summary: z.string().default(''), files: z.array(generatedFileSchema).min(1) });

export function validateAiProjectJson(input: unknown) {
  const parsed = aiProjectSchema.parse(input);
  const paths = new Set<string>();
  parsed.files.forEach((file) => {
    file.path = sanitizePath(file.path);
    if (paths.has(file.path)) throw new Error(`Duplicate file path: ${file.path}`);
    paths.add(file.path);
    if (/add your code here|todo: implement|placeholder only/i.test(file.content)) throw new Error(`Placeholder content rejected in ${file.path}`);
  });
  return parsed;
}
