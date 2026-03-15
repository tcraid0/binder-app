import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const { remarkPlugins, rehypePlugins } = require("../.tmp/workspace-tests/src/lib/markdown-plugins.js");
const markdownRendererSource = fs.readFileSync(
  path.join(__dirname, "../src/components/MarkdownRenderer.tsx"),
  "utf8",
);

function renderMarkdown(markdown) {
  return renderToStaticMarkup(
    React.createElement(Markdown, { remarkPlugins, rehypePlugins }, markdown),
  );
}

test("GFM render includes tables, task lists, strikethrough, footnotes, and autolinks", () => {
  const html = renderMarkdown(
    [
      "| Name | Value |",
      "| --- | --- |",
      "| Alpha | 1 |",
      "",
      "- [x] done",
      "- [ ] todo",
      "",
      "~~deleted~~",
      "",
      "Footnote[^1]",
      "",
      "[^1]: note",
      "",
      "https://example.com",
    ].join("\n"),
  );

  assert.match(html, /<table>/);
  assert.match(html, /<thead>/);
  assert.match(html, /<tbody>/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /checked=""/);
  assert.match(html, /<del>deleted<\/del>/);
  assert.match(html, /data-footnote-ref/);
  assert.match(html, /href="https:\/\/example\.com"/);
});

test("syntax highlighting emits highlight.js classes for fenced code", () => {
  const html = renderMarkdown("```js\nconst answer = 42;\n```");

  assert.match(html, /class="hljs language-js"/);
  assert.match(html, /hljs-keyword/);
  assert.match(html, /hljs-number/);
});

test("KaTeX renders inline math", () => {
  const html = renderMarkdown("Inline $E = mc^2$");

  assert.match(html, /class="katex"/);
  assert.doesNotMatch(html, /class="katex-display"/);
});

test("KaTeX renders display math", () => {
  const html = renderMarkdown(["$$", "\\int_0^1 x^2 \\, dx", "$$"].join("\n"));

  assert.match(html, /class="katex-display"/);
});

test("invalid KaTeX input renders without throwing", () => {
  assert.doesNotThrow(() => renderMarkdown("Bad $\\notacommand$"));

  const html = renderMarkdown("Bad $\\notacommand$");
  assert.match(html, /class="katex"/);
  assert.match(html, /\\notacommand/);
});

test("MarkdownRenderer routes mermaid fenced blocks to MermaidBlock", () => {
  assert.match(markdownRendererSource, /if \(language === "mermaid"\)/);
  assert.match(markdownRendererSource, /return <MermaidBlock chart=\{rawCode\} \/>;/);
});
