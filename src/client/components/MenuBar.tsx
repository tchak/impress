import { useCurrentEditor } from '@tiptap/react';

export function MenuBar() {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <div className="flex gap-2 m-2 mb-0">
      <div className="isolate inline-flex rounded-md shadow-sm">
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
          className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10 ${
            editor.isActive('highlight')
              ? 'bg-blue-200 hover:bg-blue-50'
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          highlight
        </button>
      </div>

      <div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10 ${
            editor.isActive('bulletList')
              ? 'bg-blue-200 hover:bg-blue-50'
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          bullet list
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10 ${
            editor.isActive('orderedList')
              ? 'bg-blue-200 hover:bg-blue-50'
              : 'bg-white hover:bg-gray-50'
          }`}
        >
          ordered list
        </button>
      </div>

      <div>
        <button
          type="button"
          className="relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10 bg-white hover:bg-gray-50"
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
    </div>
  );
}
