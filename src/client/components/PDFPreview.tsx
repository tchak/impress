import { useCurrentEditor, type JSONContent } from '@tiptap/react';

import { useState } from 'react';

import { PDFViewer } from './PDFViewer';
import { withLayout } from './content';

export type Tag = { label: string; id: string; defaultValue: string };
type TagValue = { id: string; value: string };

export function PDFPreview({
  tags,
  resetContent,
}: {
  tags: Tag[];
  resetContent: () => void;
}) {
  const [file, setFile] = useState<Blob | null>(null);
  const { editor } = useCurrentEditor();

  const [tagValues, setTagValues] = useState<TagValue[]>(
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
            resetContent();
            location.reload();
          }}
        >
          Reset
        </button>
      </div>
      {file ? <PDFViewer file={file} /> : null}
    </div>
  );
}

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

function renderPDF(json: JSONContent, tags: TagValue[]) {
  const doc = {
    type: 'doc',
    attrs: {
      title: 'Attestation',
      language: 'fr',
    },
    content: withLayout({ type: 'section', content: json.content }),
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
