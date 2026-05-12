import type { ProjectFile } from '../types/project';
import type { ProjectType } from '../types/ai';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function injectBeforeClosingTag(html: string, tag: 'head' | 'body', content: string) {
  const closingTag = new RegExp(`</${tag}>`, 'i');
  return closingTag.test(html) ? html.replace(closingTag, `${content}</${tag}>`) : `${html}${content}`;
}

export function detectProjectType(files: ProjectFile[]): ProjectType {
  const paths = new Set(files.map((file) => file.path));
  const hasServer = files.some((file) => file.path.startsWith('server/') || file.path.startsWith('backend/') || file.path.includes('/routes/'));
  const hasClientReact = paths.has('client/src/App.tsx') || paths.has('client/src/main.tsx');
  if (hasServer || hasClientReact) return 'fullstack';
  if (paths.has('src/App.tsx') || paths.has('src/main.tsx') || paths.has('src/App.jsx') || paths.has('package.json')) return 'react';
  return 'static';
}

function unsupportedPreview(projectType: ProjectType) {
  const label = projectType === 'fullstack' ? 'Full-stack' : 'React';
  return `<!doctype html><html><body style="font-family:Inter,system-ui,sans-serif;margin:0;background:#f8fafc;color:#111827"><main style="min-height:100vh;display:grid;place-items:center;padding:32px"><section style="max-width:680px;background:white;border:1px solid #dcfce7;border-radius:24px;padding:32px;box-shadow:0 20px 60px rgba(22,163,74,.10)"><p style="margin:0 0 12px;color:#16a34a;font-weight:800;text-transform:uppercase;letter-spacing:.12em">Preview</p><h1 style="margin:0 0 12px;font-size:32px">React/full-stack preview runner is not implemented yet.</h1><p style="margin:0;color:#475569;line-height:1.6">${label} project generation works as files in the explorer and editor. A real sandbox runner is required before this project type can be executed safely in live preview.</p></section></main></body></html>`;
}

export function buildPreview(files: ProjectFile[], explicitProjectType?: ProjectType) {
  const inferredProjectType = detectProjectType(files);
  const projectType = inferredProjectType !== 'static' ? inferredProjectType : explicitProjectType ?? inferredProjectType;
  if (projectType !== 'static') return unsupportedPreview(projectType);

  const htmlFile = files.find((file) => file.path === 'index.html') || files.find((file) => file.path.endsWith('/index.html')) || files.find((file) => file.language === 'html');
  if (!htmlFile) {
    return '<!doctype html><html><body style="font-family:system-ui;padding:24px"><h2>No previewable HTML file</h2><p>Create or generate an index.html file to preview this project.</p></body></html>';
  }

  let html = htmlFile.content;
  const cssFiles = files.filter((file) => file.language === 'css' || file.path.endsWith('.css'));
  const scriptFiles = files.filter((file) => (file.language === 'javascript' || file.path.endsWith('.js')) && !file.path.endsWith('.test.js'));

  for (const file of cssFiles) {
    const basename = file.path.split('/').pop() || file.path;
    const hrefPattern = new RegExp(`<link[^>]+href=["'](?:\\./)?${escapeRegExp(basename)}["'][^>]*>`, 'i');
    const styleTag = `<style data-preview-path="${file.path}">\n${file.content}\n</style>`;
    html = hrefPattern.test(html) ? html.replace(hrefPattern, styleTag) : injectBeforeClosingTag(html, 'head', styleTag);
  }

  for (const file of scriptFiles) {
    const basename = file.path.split('/').pop() || file.path;
    const srcPattern = new RegExp(`<script[^>]+src=["'](?:\\./)?${escapeRegExp(basename)}["'][^>]*>\\s*</script>`, 'i');
    const scriptTag = `<script data-preview-path="${file.path}">\nwindow.addEventListener('error', function(event) { parent.postMessage({ type: 'preview-error', message: event.message }, '*'); });\ntry {\n${file.content}\n} catch (error) { parent.postMessage({ type: 'preview-error', message: String(error && error.message || error) }, '*'); }\n</script>`;
    html = srcPattern.test(html) ? html.replace(srcPattern, scriptTag) : injectBeforeClosingTag(html, 'body', scriptTag);
  }

  return html;
}

export const buildPreviewHtml = buildPreview;
