import { describe, expect, it } from 'vitest';
import { richTextToHtml, richTextToMarkdown, richTextToPdfLines } from '../rich-text';

const document = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Open ', marks: [] },
        { type: 'text', text: 'settings', marks: [{ type: 'bold' }] },
      ],
    },
    {
      type: 'bulletList',
      content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Enable access' }] }] },
      ],
    },
  ],
};

describe('rich-text export', () => {
  it('preserves supported emphasis and lists across export formats', () => {
    expect(richTextToHtml(document, '')).toContain('<strong>settings</strong>');
    expect(richTextToHtml(document, '')).toContain('<ul><li>');
    expect(richTextToMarkdown(document, '')).toContain('Open **settings**\n- Enable access');
    expect(richTextToPdfLines(document, '')).toEqual([
      {
        runs: [
          { text: 'Open ', bold: false, italic: false, code: false },
          { text: 'settings', bold: true, italic: false, code: false },
        ],
      },
      { runs: [{ text: '• ' }, { text: 'Enable access', bold: false, italic: false, code: false }] },
    ]);
  });

  it('drops unsafe link destinations while retaining their text', () => {
    const unsafe = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'click me', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] },
          ],
        },
      ],
    };
    expect(richTextToHtml(unsafe, '')).toBe('<p>click me</p>');
    expect(richTextToMarkdown(unsafe, '')).toBe('click me');
  });
});
