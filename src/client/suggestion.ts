import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance } from 'tippy.js';
import { SuggestionOptions } from '@tiptap/suggestion';

import { MentionList, type Ref, type Tag } from './components/MentionList';

export function suggestion(items: Tag[]): SuggestionOptions {
  return {
    items: ({ query }) => {
      return items
        .filter((item) =>
          item.label.toLowerCase().startsWith(query.toLowerCase())
        )
        .slice(0, 5);
    },

    char: '#',

    // @ts-expect-error
    render: () => {
      let reactRenderer: ReactRenderer<Ref>;
      let popup: Instance[];

      return {
        onStart: (props) => {
          if (!props.clientRect) {
            return;
          }

          // @ts-expect-error
          reactRenderer = new ReactRenderer<Ref>(MentionList, {
            props,
            editor: props.editor,
          });

          // @ts-expect-error
          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: reactRenderer.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },

        onUpdate(props) {
          reactRenderer.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup[0].setProps({
            // @ts-expect-error
            getReferenceClientRect: props.clientRect,
          });
        },

        onKeyDown(props) {
          if (props.event.key == 'Escape') {
            popup[0].hide();

            return true;
          }

          return reactRenderer.ref?.onKeyDown(props);
        },

        onExit() {
          popup[0].destroy();
          reactRenderer.destroy();
        },
      };
    },
  };
}
