import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export type Tag = { label: string; id: string };
export type Ref = { onKeyDown: (_: { event: KeyboardEvent }) => void };
export type Props = {
  items: Tag[];
  command: (tag: Tag) => void;
};

export const MentionList = forwardRef<Ref, Props>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="bg-white p-2 border border-gray-300 rounded-sm shadow-sm flex flex-col">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`text-left ${
              index === selectedIndex ? 'bg-blue-200' : ''
            }`}
            key={item.id}
            onClick={() => selectItem(index)}
          >
            {item.label}
          </button>
        ))
      ) : (
        <div className="item">No result</div>
      )}
    </div>
  );
});
