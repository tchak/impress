import { ReactNode } from 'react';
import { type Editor, useCurrentEditor } from '@tiptap/react';
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiUnderline,
  RiCodeView,
  RiFontColor,
  RiListOrdered,
  RiListUnordered,
  RiAlignLeft,
  RiAlignRight,
  RiAlignCenter,
  RiAlignJustify,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
} from 'react-icons/ri';

type Action = {
  icon: ReactNode;
  label: string;
  run(): void;
  isActive(): boolean;
  isDisabled(): boolean;
};

function buildActions(editor: Editor): Action[][] {
  return [
    [
      {
        icon: <RiBold />,
        label: 'bold',
        run: () => editor.chain().focus().toggleBold().run(),
        isActive: () => editor.isActive('bold'),
        isDisabled: () => false,
      },
      {
        icon: <RiItalic />,
        label: 'italic',
        run: () => editor.chain().focus().toggleItalic().run(),
        isActive: () => editor.isActive('italic'),
        isDisabled: () => false,
      },
      {
        icon: <RiCodeView />,
        label: 'code',
        run: () => editor.chain().focus().toggleCode().run(),
        isActive: () => editor.isActive('code'),
        isDisabled: () => false,
      },
      {
        icon: <RiUnderline />,
        label: 'underline',
        run: () => editor.chain().focus().toggleUnderline().run(),
        isActive: () => editor.isActive('underline'),
        isDisabled: () => false,
      },
      {
        icon: <RiStrikethrough />,
        label: 'strike',
        run: () => editor.chain().focus().toggleStrike().run(),
        isActive: () => editor.isActive('strike'),
        isDisabled: () => false,
      },
      {
        icon: <RiFontColor />,
        label: 'highlight',
        run: () => editor.chain().focus().toggleHighlight().run(),
        isActive: () => editor.isActive('highlight'),
        isDisabled: () => false,
      },
    ],
    [
      {
        icon: <RiListUnordered />,
        label: 'bullet list',
        run: () => editor.chain().focus().toggleBulletList().run(),
        isActive: () => editor.isActive('bulletList'),
        isDisabled: () => false,
      },
      {
        icon: <RiListOrdered />,
        label: 'ordered list',
        run: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: () => editor.isActive('orderedList'),
        isDisabled: () => false,
      },
    ],
    [
      {
        icon: <RiAlignLeft />,
        label: 'left',
        run: () => editor.chain().focus().setTextAlign('left').run(),
        isActive: () => editor.isActive({ textAlign: 'left' }),
        isDisabled: () => false,
      },
      {
        icon: <RiAlignCenter />,
        label: 'center',
        run: () => editor.chain().focus().setTextAlign('center').run(),
        isActive: () => editor.isActive({ textAlign: 'center' }),
        isDisabled: () => false,
      },
      {
        icon: <RiAlignRight />,
        label: 'right',
        run: () => editor.chain().focus().setTextAlign('right').run(),
        isActive: () => editor.isActive({ textAlign: 'right' }),
        isDisabled: () => false,
      },
      {
        icon: <RiAlignJustify />,
        label: 'justify',
        run: () => editor.chain().focus().setTextAlign('justify').run(),
        isActive: () => editor.isActive({ textAlign: 'justify' }),
        isDisabled: () => false,
      },
    ],
    [
      {
        icon: <RiArrowGoBackLine />,
        label: 'undo',
        run: () => editor.chain().focus().undo().run(),
        isActive: () => false,
        isDisabled: () => !editor.can().chain().focus().undo().run(),
      },
      {
        icon: <RiArrowGoForwardLine />,
        label: 'redo',
        run: () => editor.chain().focus().redo().run(),
        isActive: () => false,
        isDisabled: () => !editor.can().chain().focus().redo().run(),
      },
    ],
  ];
}

function StartButton({ action }: { action: Action }) {
  return (
    <button
      type="button"
      onClick={() => action.run()}
      disabled={action.isDisabled()}
      className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10 ${dynamicStyles(
        action
      )}`}
      title={action.label}
    >
      {action.icon}
    </button>
  );
}

function EndButton({ action }: { action: Action }) {
  return (
    <button
      type="button"
      onClick={() => action.run()}
      disabled={action.isDisabled()}
      className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10 ${dynamicStyles(
        action
      )}`}
      title={action.label}
    >
      {action.icon}
    </button>
  );
}

function CenterButton({ action }: { action: Action }) {
  return (
    <button
      type="button"
      onClick={() => action.run()}
      disabled={action.isDisabled()}
      className={`relative -ml-px inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10 ${dynamicStyles(
        action
      )}`}
      title={action.label}
    >
      {action.icon}
    </button>
  );
}

function dynamicStyles(action: Action) {
  return `${action.isActive() ? 'bg-blue-200' : 'bg-white'} ${
    action.isDisabled()
      ? 'opacity-50'
      : action.isActive()
      ? 'hover:bg-blue-50'
      : 'hover:bg-gray-50'
  }`;
}

export function MenuBar() {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  const actions = buildActions(editor);

  return (
    <div className="flex gap-2 m-2 mb-0">
      {actions.map((group, index) => {
        return (
          <div key={index} className="isolate inline-flex rounded-md shadow-sm">
            {group.map((action, index) => {
              if (index == 0) {
                return <StartButton key={index} action={action} />;
              } else if (index == group.length - 1) {
                return <EndButton key={index} action={action} />;
              }
              return <CenterButton key={index} action={action} />;
            })}
          </div>
        );
      })}
    </div>
  );
}
