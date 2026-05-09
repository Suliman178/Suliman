const blocked = /(^|\/|\\)\.\.($|\/|\\)|^\/|^[a-zA-Z]:|\\|\0/;
export function sanitizePath(path: string) {
  const cleaned = path.trim().replace(/^\.\//, '');
  if (!cleaned || blocked.test(cleaned) || cleaned.length > 180) throw new Error(`Invalid file path: ${path}`);
  return cleaned;
}
export function languageFromPath(path: string) {
  const ext = path.split('.').pop()?.toLowerCase();
  return ({ html: 'html', css: 'css', js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', json: 'json', md: 'markdown' } as Record<string,string>)[ext || ''] || 'plaintext';
}
