import { createRoot } from 'react-dom/client';
import {
  EditorProvider,
  useCurrentEditor,
  type JSONContent,
} from '@tiptap/react';
import Mention from '@tiptap/extension-mention';
import StarterKit from '@tiptap/starter-kit';
import { Document, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';

import { suggestion } from './suggestion';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const extensions = [
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: false,
  }),
  Mention.configure({
    renderLabel({ options, node }) {
      return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`;
    },
    suggestion: suggestion([
      { label: 'Prénom', id: 'firstName' },
      { label: 'Nom', id: 'lastName' },
      { label: 'NUR', id: 'nur' },
    ]),
  }),
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
        Bold
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
        Italic
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

type Section = {
  type: 'section';
  children: Paragraph[];
};

type Paragraph = {
  type: 'paragraph';
  children: Inline[];
};

type Inline =
  | { text: string; italic?: boolean; bold?: boolean }
  | { type: 'tag'; tag: string };

function toImpressJSON(json: JSONContent): Section {
  return {
    type: 'section',
    children: (json.content ?? []).map<Paragraph>((content) => {
      if (content.type == 'paragraph') {
        return {
          type: 'paragraph',
          children: (content.content ?? []).map<Inline>((content) => {
            if (content.type == 'text' && content.text) {
              return {
                text: content.text,
                italic: !!content.marks?.find((mark) => mark.type == 'italic'),
                bold: !!content.marks?.find((mark) => mark.type == 'bold'),
              };
            } else if (content.type == 'mention' && content.attrs?.id) {
              return { type: 'tag', tag: content.attrs.id };
            }
            return { text: '' };
          }),
        };
      }
      return { type: 'paragraph', children: [{ text: '' }] };
    }),
  };
}

const EditorJSONPreview = () => {
  const [file, setFile] = useState<Blob | null>(null);
  const { editor } = useCurrentEditor();

  return (
    <div className="ml-2">
      <button
        type="button"
        className="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={async () => {
          const json = editor?.getJSON();
          if (json) {
            console.log(JSON.stringify(json, null, 2));
            renderPDF(json).then((blob) => setFile(blob));
          }
        }}
      >
        Render
      </button>
      {file ? <PDFViewer file={file} /> : null}
    </div>
  );
};

function PDFViewer({ file }: { file: Blob }) {
  const [, setNumPages] = useState<number>();
  const [pageNumber] = useState<number>(1);

  function onLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <Document file={file} onLoadSuccess={onLoadSuccess}>
      <Page pageNumber={pageNumber} renderTextLayer={false} />
    </Document>
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
          marks: [
            {
              type: 'italic',
            },
          ],
          text: 'situation',
        },
        {
          type: 'text',
          text: ' de ',
        },
        {
          type: 'text',
          marks: [
            {
              type: 'bold',
            },
          ],
          text: 'Monsieur',
        },
        {
          type: 'text',
          text: ' ',
        },
        {
          type: 'mention',
          attrs: {
            id: 'lastName',
            label: 'Nom',
          },
        },
        {
          type: 'text',
          text: ' dont la demande de logement social porte le NUR ',
        },
        {
          type: 'mention',
          attrs: {
            id: 'nur',
            label: 'NUR',
          },
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
          marks: [
            {
              type: 'italic',
            },
          ],
          text: 'Informations :',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'italic',
            },
          ],
          text: 'Cette reconnaissance de priorité rend le dossier du requérant éligible au contingent préfectoral de logements sociaux réservé aux publics prioriatires.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'italic',
            },
          ],
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

function renderPDF(json: JSONContent) {
  const section = toImpressJSON(json);
  const doc = {
    title: 'Attestation',
    children: sections(section),
  };
  const body = JSON.stringify({
    document: doc,
    tags: [
      { tag: 'firstName', value: 'Paul' },
      { tag: 'lastName', value: 'Chavard' },
      { tag: 'nur', value: '12345qwerty' },
    ],
    format: 'pdf',
  });
  return fetch('/v1', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  }).then((res) => res.blob());
}

function sections(section: Section) {
  return [
    {
      type: 'section',
      direction: 'horizontal',
      children: [
        {
          type: 'section',
          children: [
            {
              type: 'image',
              src: 'https://upload.wikimedia.org/wikipedia/fr/5/50/Bloc_Marianne.svg',
              width: 100,
            },
            {
              type: 'paragraph',
              children: [
                {
                  text: 'PRÉFET\nDU VAL-\nDE-MARNE',
                },
              ],
            },
          ],
        },
        {
          type: 'section',
          align: 'right',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Direction Régionale et Interdépartementale\nde l’Hébergement et du Logement\nDRIHL Val-de-Marne',
                  bold: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'section',
      direction: 'horizontal',
      children: [
        {
          type: 'section',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Service Hébergement et Accès au Logement\nBureau de l’Accès au Logement',
                },
              ],
            },
          ],
        },
        {
          type: 'section',
          align: 'right',
          children: [
            {
              type: 'paragraph',
              children: [
                {
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
      align: 'center',
      children: [
        {
          type: 'heading',
          level: 1,
          children: [
            {
              text: 'ATTESTATION',
            },
          ],
        },
      ],
    },
    section,
  ];
}
