import type { ProjectFile } from '../types/project';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function injectBeforeClosingTag(html: string, tag: 'head' | 'body', content: string) {
  const closingTag = new RegExp(`</${tag}>`, 'i');
  return closingTag.test(html) ? html.replace(closingTag, `${content}</${tag}>`) : `${html}${content}`;
}

export function buildPreview(files: ProjectFile[]) {
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
