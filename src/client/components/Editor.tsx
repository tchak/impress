import { EditorProvider } from '@tiptap/react';

import Document from '@tiptap/extension-document';
import Hystory from '@tiptap/extension-history';
import TextAlign from '@tiptap/extension-text-align';
import Gapcursor from '@tiptap/extension-gapcursor';

import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';

import Text from '@tiptap/extension-text';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import Code from '@tiptap/extension-code';
import Strike from '@tiptap/extension-strike';
import Mention from '@tiptap/extension-mention';
import Typography from '@tiptap/extension-typography';

import { createSuggestion } from './suggestion';
import { getContent, setContent, resetContent } from './content';
import { MenuBar } from './MenuBar';
import { DocPreview, type Tag } from './DocPreview';

export function Editor({ tags }: { tags: Tag[] }) {
  const extensions = [
    Document,
    Paragraph,
    Heading,
    ListItem,
    BulletList,
    OrderedList,
    Mention.configure({
      renderLabel({ options, node }) {
        return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`;
      },
      suggestion: createSuggestion(tags),
    }),
    Typography,
    Text,
    Highlight,
    Underline,
    Bold,
    Italic,
    Code,
    Strike,
    Link.configure({
      protocols: ['https'],
      autolink: true,
      linkOnPaste: true,
      openOnClick: false,
    }),
    Hystory,
    Gapcursor,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
  ];

  return (
    <EditorProvider
      editorProps={{
        attributes: {
          class:
            'prose prose-sm sm:prose-base p-2 m-2 focus:outline-none border-gray-300 border rounded-md min-h-[30rem] w-full',
        },
      }}
      autofocus
      extensions={extensions}
      content={getContent()}
      slotBefore={<MenuBar />}
      slotAfter={<DocPreview tags={tags} resetContent={resetContent} />}
      onUpdate={({ editor }) => {
        const content = editor.getJSON();
        setContent(content);
      }}
    >
      {' '}
    </EditorProvider>
  );
}
