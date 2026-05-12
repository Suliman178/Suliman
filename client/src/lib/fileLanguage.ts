const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  html: 'html', css: 'css', js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript',
  ts: 'typescript', tsx: 'typescript', json: 'json', md: 'markdown', markdown: 'markdown', svg: 'xml', xml: 'xml',
  py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java', c: 'c', cpp: 'cpp', h: 'c', hpp: 'cpp', yml: 'yaml', yaml: 'yaml'
};

export function languageFromPath(path: string) {
  const cleanPath = path.split('?')[0]?.split('#')[0] || path;
  const ext = cleanPath.includes('.') ? cleanPath.split('.').pop()?.toLowerCase() : undefined;
  return EXTENSION_LANGUAGE_MAP[ext || ''] || 'plaintext';
}

export function iconForLanguage(language: string) {
  if (language === 'html') return '🌐';
  if (language === 'css') return '🎨';
  if (language === 'javascript') return '⚡';
  if (language === 'typescript') return '🔷';
  if (language === 'json') return '{}';
  if (language === 'markdown') return '📝';
  return '📄';
}
