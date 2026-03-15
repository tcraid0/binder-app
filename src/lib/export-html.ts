const EXPORT_BASE_CSS = `
body {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 17px;
  line-height: 1.7;
  color: var(--text-primary);
  background: var(--bg-primary);
  max-width: 65ch;
  margin: 0 auto;
  padding: 48px 24px 80px;
}
h1, h2, h3, h4, h5, h6 {
  font-family: system-ui, -apple-system, sans-serif;
  color: var(--text-primary);
  margin-top: 2.5em;
  margin-bottom: 0.75em;
}
h1 { font-size: 2.25rem; font-weight: 700; line-height: 1.15; letter-spacing: -0.03em; margin-top: 0; padding-bottom: 0.5em; border-bottom: 1px solid var(--border); }
h2 { font-size: 1.625rem; font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; padding-bottom: 0.3em; border-bottom: 1px solid var(--border); }
h3 { font-size: 1.25rem; font-weight: 600; line-height: 1.3; }
h4 { font-size: 1.125rem; font-weight: 600; }
h5, h6 { font-size: 1rem; font-weight: 600; }
h6 { color: var(--text-secondary); }
p { margin-top: 0; margin-bottom: 1.25em; }
a {
  color: var(--accent);
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--accent) 40%, transparent);
  text-underline-offset: 2px;
}
a:hover {
  color: var(--accent-hover);
  text-decoration-color: var(--accent-hover);
}
strong { font-weight: 700; }
del, s {
  text-decoration: line-through;
  color: var(--text-secondary);
}
img { max-width: 100%; height: auto; border-radius: 8px; margin: 1.5em 0; }
blockquote {
  margin: 1.5em 0;
  padding: 0.5em 1.25em;
  border-left: 3px solid var(--accent);
  background: var(--bg-secondary);
  border-radius: 0 6px 6px 0;
  color: var(--text-secondary);
}
blockquote p:last-child { margin-bottom: 0; }
ul, ol { margin: 1em 0; padding-left: 1.75em; }
li { margin-bottom: 0.35em; }
li > ul, li > ol { margin-top: 0.35em; margin-bottom: 0; }
ul.contains-task-list { list-style: none; padding-left: 0.5em; }
li.task-list-item { display: flex; align-items: baseline; gap: 0.5em; }
li.task-list-item input[type="checkbox"] { accent-color: var(--accent); margin: 0; flex-shrink: 0; }
hr { border: none; height: 1px; background: var(--border); margin: 2.5em 0; }
table { width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.9em; }
th {
  font-family: system-ui, sans-serif;
  font-weight: 600;
  text-align: left;
  padding: 0.75em 1em;
  border-bottom: 2px solid var(--border);
  color: var(--text-primary);
}
td {
  padding: 0.6em 1em;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
}
tbody tr:hover { background: var(--bg-tertiary); }
code:not(pre code) {
  font-family: ui-monospace, monospace;
  font-size: 0.85em;
  padding: 0.15em 0.4em;
  background: var(--code-bg);
  border-radius: 4px;
  color: var(--text-primary);
}
pre {
  position: relative;
  margin: 1.5em 0;
  padding: 20px;
  background: var(--code-bg);
  border-radius: 10px;
  border-left: 3px solid var(--accent);
  overflow-x: auto;
}
pre code {
  font-family: ui-monospace, monospace;
  font-size: 14px;
  line-height: 1.6;
  background: none;
  padding: 0;
  border-radius: 0;
}
.code-block-wrapper { margin: 1.5em 0; }
.code-block-wrapper pre { margin: 0; overflow-x: hidden; }
.code-block-wrapper .code-block-content {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.code-block-wrapper button,
.code-lang-chip { display: none; }
.hljs { background: transparent; color: var(--text-primary); }
.hljs-comment, .hljs-quote { color: #6a737d; }
.hljs-keyword, .hljs-selector-tag, .hljs-type { color: #d73a49; }
.hljs-string, .hljs-addition { color: #032f62; }
.hljs-number, .hljs-literal { color: #005cc5; }
.hljs-built_in, .hljs-title, .hljs-section { color: #6f42c1; }
.hljs-attr, .hljs-attribute { color: #005cc5; }
.hljs-variable, .hljs-template-variable { color: #e36209; }
.hljs-deletion { color: #b31d28; }
[data-theme="dark"] .hljs,
[data-theme="deep-dark"] .hljs { color: #adbac7; background: var(--code-bg); }
[data-theme="dark"] .hljs-comment,
[data-theme="dark"] .hljs-quote,
[data-theme="deep-dark"] .hljs-comment,
[data-theme="deep-dark"] .hljs-quote { color: #768390; }
[data-theme="dark"] .hljs-keyword,
[data-theme="dark"] .hljs-selector-tag,
[data-theme="dark"] .hljs-type,
[data-theme="deep-dark"] .hljs-keyword,
[data-theme="deep-dark"] .hljs-selector-tag,
[data-theme="deep-dark"] .hljs-type { color: #f47067; }
[data-theme="dark"] .hljs-string,
[data-theme="dark"] .hljs-addition,
[data-theme="deep-dark"] .hljs-string,
[data-theme="deep-dark"] .hljs-addition { color: #96d0ff; }
[data-theme="dark"] .hljs-number,
[data-theme="dark"] .hljs-literal,
[data-theme="deep-dark"] .hljs-number,
[data-theme="deep-dark"] .hljs-literal { color: #6cb6ff; }
[data-theme="dark"] .hljs-built_in,
[data-theme="dark"] .hljs-title,
[data-theme="dark"] .hljs-section,
[data-theme="deep-dark"] .hljs-built_in,
[data-theme="deep-dark"] .hljs-title,
[data-theme="deep-dark"] .hljs-section { color: #dcbdfb; }
[data-theme="dark"] .hljs-attr,
[data-theme="dark"] .hljs-attribute,
[data-theme="deep-dark"] .hljs-attr,
[data-theme="deep-dark"] .hljs-attribute { color: #6cb6ff; }
[data-theme="dark"] .hljs-variable,
[data-theme="dark"] .hljs-template-variable,
[data-theme="deep-dark"] .hljs-variable,
[data-theme="deep-dark"] .hljs-template-variable { color: #f69d50; }
[data-theme="dark"] .hljs-deletion,
[data-theme="deep-dark"] .hljs-deletion { color: #f47067; }
.mermaid-diagram {
  margin: 1.5em 0;
  display: flex;
  justify-content: center;
  padding: 1em;
  background: var(--bg-secondary);
  border-radius: 10px;
  overflow-x: auto;
}
.mermaid-diagram svg { flex: 0 0 auto; height: auto; }
.footnotes {
  margin-top: 3em;
  padding-top: 1.5em;
  border-top: 1px solid var(--border);
  font-size: 0.875em;
  color: var(--text-secondary);
}
.footnotes h2.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.footnotes ol { padding-left: 1.5em; }
.footnotes li { margin-bottom: 0.5em; }
sup a[data-footnote-ref] {
  font-family: system-ui, sans-serif;
  font-size: 0.75em;
  font-weight: 600;
  color: var(--accent);
  text-decoration: none;
  padding: 0 0.15em;
}
sup a[data-footnote-ref]:hover { text-decoration: underline; color: var(--accent-hover); }
a[data-footnote-backref] {
  font-family: system-ui, sans-serif;
  font-size: 0.8em;
  text-decoration: none;
  color: var(--accent);
  margin-left: 0.25em;
}
a[data-footnote-backref]:hover { color: var(--accent-hover); }
`;

const EXPORT_FOUNTAIN_CSS = `
.fountain-body { font-family: "Courier New", Courier, monospace; font-size: 12pt; line-height: 1.5; color: var(--text-primary); }
.fountain-title-page { text-align: center; padding: 4em 0 3em; margin-bottom: 2em; border-bottom: 1px solid var(--border); }
.fountain-title { font-size: 2rem; font-weight: 700; text-transform: uppercase; margin: 0 0 1em; color: var(--text-primary); }
.fountain-credit { font-size: 1rem; margin: 0 0 0.25em; color: var(--text-secondary); }
.fountain-author { font-size: 1rem; font-weight: 700; margin: 0 0 1em; color: var(--text-primary); }
.fountain-draft-date, .fountain-title-entry { font-size: 0.9rem; margin: 0 0 0.25em; color: var(--text-secondary); }
.fountain-scene-heading { font-weight: 700; text-transform: uppercase; margin-top: 2em; margin-bottom: 1em; font-size: 1em; color: var(--text-primary); }
.fountain-scene-number { float: right; font-weight: 400; }
.fountain-action { margin: 1em 0; }
.fountain-character { text-align: center; text-transform: uppercase; margin-top: 1em; margin-bottom: 0; font-weight: 700; }
.fountain-dialogue { max-width: 35ch; margin: 0 auto; }
.fountain-parenthetical { max-width: 25ch; margin: 0 auto; font-style: italic; }
.fountain-transition { text-align: right; text-transform: uppercase; margin: 1em 0; }
.fountain-centered { text-align: center; margin: 1em 0; }
.fountain-section { font-weight: 700; margin-top: 2em; margin-bottom: 1em; color: var(--text-secondary); }
.fountain-synopsis { font-style: italic; color: var(--text-muted); margin: 0.5em 0; }
.fountain-note { font-style: italic; color: var(--text-muted); padding: 0.5em 1em; background: var(--bg-secondary); border-radius: 6px; margin: 0.5em 0; }
.fountain-lyrics { font-style: italic; margin: 1em 0; }
.fountain-page-break { border: none; border-top: 1px solid var(--border); margin: 2em 0; }
.fountain-dual-dialogue { display: flex; gap: 2em; margin-top: 1em; }
.fountain-dual-column { flex: 1; min-width: 0; }
.fountain-dual-column .fountain-character { text-align: center; }
.fountain-dual-column .fountain-dialogue { max-width: none; margin: 0; }
`;

const EXPORT_KATEX_OVERRIDES = `
.katex-display {
  margin: 1.5em 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.5em 0;
}
.katex { font-size: 1.1em; }
`;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => (
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char
  ));
}

function sanitizeCssVars(value: string) {
  return value.replace(/<\/style/gi, "<\\/style");
}

interface BuildExportHtmlOptions {
  title: string;
  themeAttr: string;
  cssVars: string;
  bodyHtml: string;
  katexCss?: string | null;
}

export function buildExportHtml({
  title,
  themeAttr,
  cssVars,
  bodyHtml,
  katexCss = null,
}: BuildExportHtmlOptions): string {
  const embeddedKatexCss = katexCss ? `\n${katexCss}\n${EXPORT_KATEX_OVERRIDES}` : "";
  const safeCssVars = sanitizeCssVars(cssVars);

  return `<!DOCTYPE html>
<html lang="en" data-theme="${escapeHtml(themeAttr)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      ${safeCssVars}
    }
    ${EXPORT_BASE_CSS}
    ${EXPORT_FOUNTAIN_CSS}
    ${embeddedKatexCss}
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}
