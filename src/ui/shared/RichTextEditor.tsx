import type { JSONContent } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Code2, Italic, Link2, List, ListOrdered, Redo2, Underline as UnderlineIcon, Undo2 } from 'lucide-react';
import { useEffect } from 'react';
import { richTextToPlainText } from '@/core/guides/rich-text';

interface RichTextEditorProps {
  content: JSONContent;
  onChange: (content: JSONContent, plainText: string) => void;
  compact?: boolean;
  autoFocus?: boolean;
}

const extensions = [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    link: {
      openOnClick: false,
      protocols: ['http', 'https', 'mailto'],
      isAllowedUri: (url) => /^(https?:\/\/|mailto:)/i.test(url),
      HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
    },
  }),
];

export function RichTextEditor({ content, onChange, compact = false, autoFocus = false }: RichTextEditorProps) {
  const editor = useEditor({
    extensions,
    content,
    autofocus: autoFocus ? 'end' : false,
    editorProps: {
      attributes: {
        class: `mimik-rich-text ${compact ? 'mimik-rich-text-compact' : ''}`,
        'aria-label': 'Step description',
      },
    },
    onUpdate: ({ editor: current }) => {
      const json = current.getJSON();
      onChange(json, richTextToPlainText(json));
    },
  });

  useEffect(() => {
    if (!editor || editor.isFocused) return;
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) return null;

  const button = (active: boolean) =>
    `p-1 rounded transition-colors ${active ? 'bg-accent text-white' : 'text-muted-foreground hover:bg-secondary hover:text-accent'}`;

  return (
    <div className="group/rich w-full" onDragStart={(event) => event.stopPropagation()}>
      <div className="flex items-center gap-0.5 mb-1 opacity-0 group-focus-within/rich:opacity-100 group-hover/rich:opacity-100 transition-opacity">
        <button
          type="button"
          className={button(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold size={12} />
        </button>
        <button
          type="button"
          className={button(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic size={12} />
        </button>
        <button
          type="button"
          className={button(editor.isActive('underline'))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon size={12} />
        </button>
        <button
          type="button"
          className={button(editor.isActive('code'))}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline code"
        >
          <Code2 size={12} />
        </button>
        <button
          type="button"
          className={button(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bulleted list"
        >
          <List size={12} />
        </button>
        <button
          type="button"
          className={button(editor.isActive('orderedList'))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          <ListOrdered size={12} />
        </button>
        <button
          type="button"
          className={button(editor.isActive('link'))}
          onClick={() => {
            const previous = editor.getAttributes('link').href as string | undefined;
            const href = window.prompt('Link URL', previous || 'https://');
            if (href === null) return;
            if (!href.trim()) editor.chain().focus().unsetLink().run();
            else if (/^(https?:\/\/|mailto:)/i.test(href.trim()))
              editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
          }}
          title="Link"
        >
          <Link2 size={12} />
        </button>
        <span className="mx-0.5 h-3 w-px bg-border" />
        <button
          type="button"
          className={button(false)}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2 size={12} />
        </button>
        <button
          type="button"
          className={button(false)}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2 size={12} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
