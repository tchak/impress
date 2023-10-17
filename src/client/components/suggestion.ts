import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance } from 'tippy.js';
import { SuggestionOptions } from '@tiptap/suggestion';

import { MentionList, type Ref, type Tag, type Props } from './MentionList';

export function createSuggestion(
  items: Tag[]
): Omit<SuggestionOptions<Tag>, 'editor'> {
  return {
    char: '#',
    items: ({ query }) => {
      return items
        .filter((item) =>
          item.label.toLowerCase().startsWith(query.toLowerCase())
        )
        .slice(0, 5);
    },
    render: () => {
      let reactRenderer: ReactRenderer<Ref, Props>;
      let popup: Instance[];

      return {
        onStart: (props) => {
          if (!props.clientRect) {
            return;
          }

          reactRenderer = new ReactRenderer<Ref, Props>(MentionList, {
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

          return reactRenderer.ref?.onKeyDown(props) ?? false;
        },

        onExit() {
          popup[0].destroy();
          reactRenderer.destroy();
        },
      };
    },
  };
}
