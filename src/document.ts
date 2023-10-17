import { z } from 'zod';

const Link = z.object({
  type: z.literal('link'),
  attrs: z.object({
    href: z.string(),
    rel: z.string().optional(),
    target: z.string().optional(),
  }),
});

const Mark = z.discriminatedUnion('type', [
  z.object({ type: z.literal('bold') }),
  z.object({ type: z.literal('italic') }),
  z.object({ type: z.literal('underline') }),
  z.object({ type: z.literal('highlight') }),
  Link,
]);

const Text = z.object({
  type: z.literal('text'),
  text: z.string(),
  marks: Mark.array().optional(),
});

const Tag = z.object({
  type: z.enum(['tag', 'mention']),
  attrs: z.object({ id: z.string(), label: z.string().optional() }),
  marks: Mark.array().optional(),
});

const HardBreak = z.object({ type: z.literal('hardBreak') });

const Image = z.object({
  type: z.literal('image'),
  attrs: z.object({
    src: z.string(),
    alt: z.string().optional(),
    width: z.number().int().min(1).optional(),
    height: z.number().int().min(1).optional(),
  }),
});

const Inline = z.discriminatedUnion('type', [Text, Image, Tag, HardBreak]);

const Heading = z.object({
  type: z.literal('heading'),
  attrs: z.object({ level: z.number().int().min(1).max(3) }),
  content: Inline.array(),
});

const Paragraph = z.object({
  type: z.literal('paragraph'),
  content: Inline.array(),
});

export type ListItem = {
  type: 'listItem';
  content: (Heading | Paragraph | Image | OrderedList | BulletList)[];
};
export type OrderedList = { type: 'orderedList'; content: ListItem[] };
export type BulletList = { type: 'bulletList'; content: ListItem[] };

const ListItem: z.ZodType<ListItem> = z.object({
  type: z.literal('listItem'),
  content: z.lazy(() => Block).array(),
});

const OrderedList: z.ZodType<OrderedList> = z.object({
  type: z.literal('orderedList'),
  content: ListItem.array(),
});

const BulletList: z.ZodType<BulletList> = z.object({
  type: z.literal('bulletList'),
  content: ListItem.array(),
});

const Block = z.union([Heading, Paragraph, OrderedList, BulletList, Image]);

const Align = z.enum(['left', 'center', 'right', 'justify']);

const Section = z.object({
  type: z.literal('section'),
  attrs: z.object({ align: Align.optional() }).optional(),
  content: Block.array(),
});

const Grid = z.object({
  type: z.literal('grid'),
  content: Section.array(),
});

export const Doc = z.object({
  type: z.literal('doc'),
  attrs: z.object({
    language: z.string().default('en'),
    title: z.string(),
  }),
  content: z.discriminatedUnion('type', [Section, Grid]).array(),
});

export const TagValue = z.object({
  id: z.string(),
  value: z.union([z.string(), z.number(), z.string().array()]),
});
export type TagValue = z.infer<typeof TagValue>;
export const Tags = TagValue.array();
export type Tags = z.infer<typeof Tags>;

export type Text = z.infer<typeof Text>;
export type Tag = z.infer<typeof Tag>;
export type Image = z.infer<typeof Image>;
export type Link = z.infer<typeof Link>;
export type Inline = z.infer<typeof Inline>;
export type Heading = z.infer<typeof Heading>;
export type Paragraph = z.infer<typeof Paragraph>;
export type Block = z.infer<typeof Block>;
export type Section = z.infer<typeof Section>;
export type Align = z.infer<typeof Align>;
export type Mark = z.infer<typeof Mark>;
export type Grid = z.infer<typeof Grid>;
export type Doc = z.infer<typeof Doc>;
