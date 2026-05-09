const SAFE_PATH = /^[a-zA-Z0-9._\-/ ]+$/;
export function validateProjectFilePath(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/').replace(/^\/+/, '').trim();
  if (!normalized || normalized.length > 180) throw new Error('File path is required and must be under 180 characters.');
  if (!SAFE_PATH.test(normalized) || normalized.includes('..') || normalized.split('/').some((part) => !part || part === '.' || part === '..')) throw new Error('Unsafe file path.');
  return normalized;
}
