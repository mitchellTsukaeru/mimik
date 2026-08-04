import type { JSONContent } from '@tiptap/core';

export function plainTextDocument(text: string): JSONContent {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: text ? [{ type: 'text', text }] : undefined,
      },
    ],
  };
}

function collectText(node: JSONContent, lines: string[]): void {
  if (node.type === 'text' && node.text) {
    lines.push(node.text);
    return;
  }
  const isBlock = node.type === 'paragraph' || node.type === 'heading' || node.type === 'listItem';
  const before = lines.length;
  for (const child of node.content ?? []) collectText(child, lines);
  if (isBlock && lines.length > before) lines.push('\n');
}

export function richTextToPlainText(document: JSONContent | undefined, fallback = ''): string {
  if (!document) return fallback;
  const chunks: string[] = [];
  collectText(document, chunks);
  return chunks
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function stepRichText(description: string, richDescription?: JSONContent): JSONContent {
  return richDescription ?? plainTextDocument(description);
}

export function isSimpleUnformattedDocument(document: JSONContent | undefined): boolean {
  if (!document) return true;
  if (document.type !== 'doc' || document.content?.length !== 1) return false;
  const paragraph = document.content[0];
  if (paragraph.type !== 'paragraph') return false;
  return (paragraph.content ?? []).every((node) => node.type === 'text' && !node.marks?.length);
}
