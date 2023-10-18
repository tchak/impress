import { useCurrentEditor, type JSONContent } from '@tiptap/react';

import { useState } from 'react';

import { PDFViewer } from './PDFViewer';
import { HTMLViewer } from './HTMLViewer';
import { withLayout } from './content';

export type Tag = { label: string; id: string; defaultValue: string };
type TagValue = { id: string; value: string };

export function DocPreview({
  tags,
  resetContent,
}: {
  tags: Tag[];
  resetContent: () => void;
}) {
  const [file, setFile] = useState<Blob | null>(null);
  const [html, setHTML] = useState<string | null>(null);
  const { editor } = useCurrentEditor();

  const [tagValues, setTagValues] = useState<TagValue[]>(
    tags.map(({ id, defaultValue }) => ({ id, value: defaultValue }))
  );

  return (
    <div className="ml-2">
      <div className="flex flex-col gap-2 mb-2 max-w-[20rem]">
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
              renderDoc(json, tagValues, 'pdf').then((blob) => {
                setFile(blob);
                setHTML(null);
              });
            }
          }}
        >
          Render (PDF)
        </button>
        <button
          type="button"
          className="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          onClick={async () => {
            const json = editor?.getJSON();
            if (json) {
              renderDoc(json, tagValues, 'html').then((html) => {
                setHTML(html);
                setFile(null);
              });
            }
          }}
        >
          Render (HTML)
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
      {html ? <HTMLViewer html={html} /> : null}
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

function renderDoc(
  json: JSONContent,
  tags: TagValue[],
  format: 'pdf'
): Promise<Blob>;
function renderDoc(
  json: JSONContent,
  tags: TagValue[],
  format: 'html'
): Promise<string>;
function renderDoc(
  json: JSONContent,
  tags: TagValue[],
  format: 'pdf' | 'html'
) {
  const doc = {
    type: 'doc',
    attrs: {
      title: 'Attestation',
      language: 'fr',
    },
    content: withLayout(json),
  };
  const body = JSON.stringify({
    document: doc,
    tags,
    format,
  });
  return fetch('/v1', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  }).then<Blob | string>((res) => (format == 'pdf' ? res.blob() : res.text()));
}
