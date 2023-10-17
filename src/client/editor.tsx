import { createRoot } from 'react-dom/client';
import {
  EditorProvider,
  useCurrentEditor,
  type JSONContent,
} from '@tiptap/react';

import Document from '@tiptap/extension-document';
import Hystory from '@tiptap/extension-history';

import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';

import Text from '@tiptap/extension-text';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
import Typography from '@tiptap/extension-typography';

import { Document as PDFDocument, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';

import { suggestion } from './suggestion';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const tags = [
  { label: 'Prénom', id: 'firstName', defaultValue: 'Paul' },
  { label: 'Nom', id: 'lastName', defaultValue: 'Chavard' },
  { label: 'NUR', id: 'nur', defaultValue: '12345qwerty' },
];

type Tags = { id: string; value: string }[];

const extensions = [
  Document,
  Paragraph,
  Heading,
  ListItem,
  BulletList,
  Mention.configure({
    renderLabel({ options, node }) {
      return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`;
    },
    suggestion: suggestion(tags),
  }),
  Typography,
  Text,
  Highlight,
  Underline,
  Bold,
  Italic,
  Link.configure({
    protocols: ['https'],
    autolink: true,
    linkOnPaste: true,
    openOnClick: false,
  }),
  Hystory,
];

const MenuBar = () => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <div className="isolate inline-flex rounded-md shadow-sm m-2 mb-0">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10 ${
          editor.isActive('bold')
            ? 'bg-blue-200 hover:bg-blue-50'
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`relative -ml-px inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10 ${
          editor.isActive('italic')
            ? 'bg-blue-200 hover:bg-blue-50'
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`relative -ml-px inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10 ${
          editor.isActive('underline')
            ? 'bg-blue-200 hover:bg-blue-50'
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        underline
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`relative -ml-px inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10 ${
          editor.isActive('highlight')
            ? 'bg-blue-200 hover:bg-blue-50'
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        highlight
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`relative -ml-px inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10 ${
          editor.isActive('bulletList')
            ? 'bg-blue-200 hover:bg-blue-50'
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        list
      </button>
      <button
        type="button"
        className="relative -ml-px inline-flex items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        undo
      </button>
      <button
        type="button"
        className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        redo
      </button>
    </div>
  );
};

const EditorJSONPreview = () => {
  const [file, setFile] = useState<Blob | null>(null);
  const { editor } = useCurrentEditor();

  const [tagValues, setTagValues] = useState<Tags>(
    tags.map(({ id, defaultValue }) => ({ id, value: defaultValue }))
  );

  return (
    <div className="ml-2">
      <div className="flex flex-col gap-2 mb-2">
        {tags.map((tag) => (
          <Input
            key={tag.id}
            label={tag.label}
            name={tag.id}
            value={tagValues.find(({ id }) => id == tag.id)?.value ?? ''}
            onChange={(value) => {
              setTagValues((tagValues) => [
                ...tagValues.filter(({ id }) => id != tag.id),
                { id: tag.id, value },
              ]);
            }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          onClick={async () => {
            const json = editor?.getJSON();
            if (json) {
              renderPDF(json, tagValues).then((blob) => setFile(blob));
            }
          }}
        >
          Render
        </button>
        <button
          type="button"
          className="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          onClick={async () => {
            setContent(defaultContent);
            location.reload();
          }}
        >
          Reset
        </button>
      </div>
      {file ? <PDFViewer file={file} /> : null}
    </div>
  );
};

function Input({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          type="text"
          name={name}
          value={value}
          id={name}
          onChange={({ target }) => onChange(target.value)}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  );
}

function PDFViewer({ file }: { file: Blob }) {
  const [, setNumPages] = useState<number>();
  const [pageNumber] = useState<number>(1);

  function onLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <PDFDocument file={file} onLoadSuccess={onLoadSuccess}>
      <Page pageNumber={pageNumber} renderTextLayer={false} />
    </PDFDocument>
  );
}

const Tiptap = () => {
  return (
    <EditorProvider
      editorProps={{
        attributes: {
          class:
            'prose prose-sm sm:prose-base p-2 m-2 focus:outline-none border-gray-300 border rounded-md min-h-[30rem]',
        },
      }}
      extensions={extensions}
      content={getContent()}
      slotBefore={<MenuBar />}
      slotAfter={<EditorJSONPreview />}
      onUpdate={({ editor }) => {
        const content = editor.getJSON();
        setContent(content);
      }}
    >
      {' '}
    </EditorProvider>
  );
};

const App = () => (
  <div>
    <Tiptap />
  </div>
);
const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<App />);
}

const defaultContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'La ',
        },
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: 'situation',
        },
        {
          type: 'text',
          text: ' de ',
        },
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'Monsieur',
        },
        {
          type: 'text',
          text: ' ',
        },
        {
          type: 'mention',
          attrs: { id: 'lastName', label: 'Nom' },
        },
        {
          type: 'text',
          text: ' dont la demande de logement social porte le NUR ',
        },
        {
          type: 'mention',
          attrs: { id: 'nur', label: 'NUR' },
        },
        {
          type: 'text',
          text: " est reconnue prioritaire au titre du plan départemental d'actions pour le logement et l'hébergement des personnes défavorisées.",
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: 'Informations :',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: 'Cette reconnaissance de priorité rend le dossier du requérant éligible au contingent préfectoral de logements sociaux réservé aux publics prioriatires.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: "Dans ce cadre, une proposition de logement sera faites par les services de la DRIHL dès lors qu'ils disposeront d'un logement vacant correspondant aux besoins et aux capacités de la famille.",
        },
      ],
    },
  ],
};

function getContent(): JSONContent {
  const content = localStorage.getItem('tiptap-content');

  if (content) {
    return JSON.parse(content);
  }

  return defaultContent;
}

function setContent(content: JSONContent) {
  localStorage.setItem('tiptap-content', JSON.stringify(content));
}

function renderPDF(json: JSONContent, tags: Tags) {
  const doc = {
    type: 'doc',
    attrs: {
      title: 'Attestation',
      language: 'fr',
    },
    content: sections({ type: 'section', content: json.content }),
  };
  const body = JSON.stringify({
    document: doc,
    tags,
    format: 'pdf',
  });
  return fetch('/v1', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  }).then((res) => res.blob());
}

function sections(section: JSONContent) {
  return [
    {
      type: 'grid',
      content: [
        {
          type: 'section',
          content: [
            {
              type: 'image',
              attrs: {
                src: 'https://upload.wikimedia.org/wikipedia/fr/5/50/Bloc_Marianne.svg',
                width: 100,
              },
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'PRÉFET\nDU VAL-\nDE-MARNE',
                },
              ],
            },
          ],
        },
        {
          type: 'section',
          attrs: { align: 'right' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Direction Régionale et Interdépartementale\nde l’Hébergement et du Logement\nDRIHL Val-de-Marne',
                  marks: [{ type: 'bold' }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'grid',
      content: [
        {
          type: 'section',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Service Hébergement et Accès au Logement\nBureau de l’Accès au Logement',
                },
              ],
            },
          ],
        },
        {
          type: 'section',
          attrs: { align: 'right' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Créteil, le 20 mars 2023',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'section',
      attrs: { align: 'center' },
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [
            {
              type: 'text',
              text: 'ATTESTATION',
            },
          ],
        },
      ],
    },
    section,
  ];
}
