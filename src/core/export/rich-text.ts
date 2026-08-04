import type { JSONContent } from '@tiptap/core';
import { escapeHtml } from './utils';

function safeHref(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return /^(https?:\/\/|mailto:)/i.test(value) ? value : null;
}

function renderMarks(html: string, node: JSONContent): string {
  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') html = `<strong>${html}</strong>`;
    else if (mark.type === 'italic') html = `<em>${html}</em>`;
    else if (mark.type === 'underline') html = `<u>${html}</u>`;
    else if (mark.type === 'code') html = `<code>${html}</code>`;
    else if (mark.type === 'link') {
      const href = safeHref(mark.attrs?.href);
      if (href) html = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer nofollow">${html}</a>`;
    }
  }
  return html;
}

export function richTextToHtml(document: JSONContent | undefined, fallback: string): string {
  if (!document) return `<p>${escapeHtml(fallback)}</p>`;
  const render = (node: JSONContent): string => {
    if (node.type === 'text') return renderMarks(escapeHtml(node.text ?? ''), node);
    const children = (node.content ?? []).map(render).join('');
    if (node.type === 'doc') return children;
    if (node.type === 'paragraph') return `<p>${children || '<br>'}</p>`;
    if (node.type === 'bulletList') return `<ul>${children}</ul>`;
    if (node.type === 'orderedList') return `<ol>${children}</ol>`;
    if (node.type === 'listItem') return `<li>${children}</li>`;
    if (node.type === 'hardBreak') return '<br>';
    return children;
  };
  try {
    return render(document);
  } catch {
    return `<p>${escapeHtml(fallback)}</p>`;
  }
}

function markedText(node: JSONContent): string {
  let text = node.text ?? '';
  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') text = `**${text}**`;
    else if (mark.type === 'italic') text = `*${text}*`;
    else if (mark.type === 'underline') text = `<u>${text}</u>`;
    else if (mark.type === 'code') text = `\`${text}\``;
    else if (mark.type === 'link') {
      const href = safeHref(mark.attrs?.href);
      if (href) text = `[${text}](${href})`;
    }
  }
  return text;
}

export function richTextToMarkdown(document: JSONContent | undefined, fallback: string): string {
  if (!document) return fallback;
  const renderInline = (node: JSONContent): string => {
    if (node.type === 'text') return markedText(node);
    if (node.type === 'hardBreak') return '  \n';
    return (node.content ?? []).map(renderInline).join('');
  };
  const renderBlocks = (nodes: JSONContent[], depth = 0): string[] => {
    const lines: string[] = [];
    for (const node of nodes) {
      if (node.type === 'paragraph') lines.push(renderInline(node));
      else if (node.type === 'bulletList' || node.type === 'orderedList') {
        for (let index = 0; index < (node.content ?? []).length; index++) {
          const item = node.content![index];
          const prefix = node.type === 'orderedList' ? `${index + 1}. ` : '- ';
          const itemLines = renderBlocks(item.content ?? [], depth + 1);
          lines.push(`${'  '.repeat(depth)}${prefix}${itemLines.shift() ?? ''}`, ...itemLines);
        }
      }
    }
    return lines;
  };
  try {
    return (
      renderBlocks(document.content ?? [])
        .join('\n')
        .trim() || fallback
    );
  } catch {
    return fallback;
  }
}

export interface PdfTextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

export interface PdfTextLine {
  runs: PdfTextRun[];
}

function pdfInlineRuns(node: JSONContent): PdfTextRun[] {
  if (node.type === 'text') {
    const marks = new Set((node.marks ?? []).map((mark) => mark.type));
    return [
      {
        text: node.text ?? '',
        bold: marks.has('bold'),
        italic: marks.has('italic'),
        code: marks.has('code'),
      },
    ];
  }
  if (node.type === 'hardBreak') return [{ text: '\n' }];
  return (node.content ?? []).flatMap(pdfInlineRuns);
}

export function richTextToPdfLines(document: JSONContent | undefined, fallback: string): PdfTextLine[] {
  if (!document) return [{ runs: [{ text: fallback }] }];
  const lines: PdfTextLine[] = [];
  const renderBlocks = (nodes: JSONContent[], depth = 0) => {
    for (const node of nodes) {
      if (node.type === 'paragraph') {
        lines.push({ runs: pdfInlineRuns(node) });
      } else if (node.type === 'bulletList' || node.type === 'orderedList') {
        for (let index = 0; index < (node.content ?? []).length; index++) {
          const item = node.content![index];
          const children = item.content ?? [];
          const paragraph = children.find((child) => child.type === 'paragraph');
          const prefix = node.type === 'orderedList' ? `${index + 1}. ` : '• ';
          lines.push({
            runs: [{ text: `${'  '.repeat(depth)}${prefix}` }, ...(paragraph ? pdfInlineRuns(paragraph) : [])],
          });
          renderBlocks(
            children.filter((child) => child.type !== 'paragraph'),
            depth + 1,
          );
        }
      }
    }
  };
  try {
    renderBlocks(document.content ?? []);
    return lines.length ? lines : [{ runs: [{ text: fallback }] }];
  } catch {
    return [{ runs: [{ text: fallback }] }];
  }
}
