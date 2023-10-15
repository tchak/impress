import { describe, it, expect } from 'bun:test';
import { Value } from '@sinclair/typebox/value';
import { Document } from './document';

describe('Document', () => {
  it('should validate a document', () => {
    const doc: Document = {
      title: 'Title',
      children: [
        {
          type: 'section',
          direction: 'vertical',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Hello, world!',
                },
                {
                  type: 'link',
                  href: 'https://example.com',
                  children: [
                    {
                      text: 'Example',
                    },
                  ],
                },
              ],
            },
            {
              type: 'image',
              src: 'https://example.com/picture.jpg',
            },
          ],
        },
      ],
    };

    const result = Value.Check(Document, doc);
    expect(result).toBe(true);
  });
});
