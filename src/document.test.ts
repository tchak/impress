import { describe, it, expect } from 'bun:test';
import { Doc } from './document';

describe('Document', () => {
  it('should validate a document', () => {
    const doc: Doc = {
      type: 'doc',
      attrs: { title: 'Title' },
      content: [
        {
          type: 'section',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Hello, world!',
                },
                {
                  type: 'text',
                  text: 'Example',
                  marks: [
                    {
                      type: 'link',
                      attrs: { href: 'https://example.com' },
                    },
                  ],
                },
              ],
            },
            {
              type: 'image',
              attrs: { src: 'https://example.com/picture.jpg' },
            },
          ],
        },
      ],
    };

    const result = Doc.safeParse(doc);
    expect(result.success).toBe(true);
  });
});
