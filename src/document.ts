import { t, Static } from 'elysia';

const FormattedText = t.Object({
  text: t.Readonly(t.String()),
  bold: t.ReadonlyOptional(t.Boolean()),
  italic: t.ReadonlyOptional(t.Boolean()),
  underline: t.ReadonlyOptional(t.Boolean()),
  highlight: t.ReadonlyOptional(t.Boolean()),
});

const Tag = t.Object({
  type: t.Readonly(t.Literal('tag')),
  tag: t.Readonly(t.String()),
});

const Link = t.Object({
  type: t.Readonly(t.Literal('link')),
  href: t.Readonly(t.String()),
  children: t.Readonly(t.Array(t.Union([FormattedText, Tag]))),
});

const Inline = t.Union([FormattedText, Link, Tag]);

const Heading = t.Object({
  type: t.Readonly(t.Literal('heading')),
  level: t.Readonly(t.Number({ int: true, minimum: 1, maximum: 3 })),
  children: t.Readonly(t.Array(Inline)),
});

const ListItem = t.Object({
  type: t.Readonly(t.Literal('list-item')),
  children: t.Readonly(t.Array(Inline)),
});

const Paragraph = t.Object({
  type: t.Readonly(t.Literal('paragraph')),
  children: t.Readonly(t.Array(Inline)),
});

const NumberedList = t.Object({
  type: t.Readonly(t.Literal('numbered-list')),
  children: t.Readonly(t.Array(ListItem)),
});

const BulletedList = t.Object({
  type: t.Readonly(t.Literal('bulleted-list')),
  children: t.Readonly(t.Array(ListItem)),
});

const Image = t.Object({
  type: t.Readonly(t.Literal('image')),
  src: t.Readonly(t.String()),
  alt: t.ReadonlyOptional(t.String()),
  width: t.ReadonlyOptional(t.Number({ int: true, minimum: 1 })),
  height: t.ReadonlyOptional(t.Number({ int: true, minimum: 1 })),
});

const Block = t.Union([Heading, Paragraph, NumberedList, BulletedList, Image]);

const Align = t.Union([
  t.Literal('left'),
  t.Literal('center'),
  t.Literal('right'),
  t.Literal('justify'),
]);

const VerticalSection = t.Object({
  type: t.Readonly(t.Literal('section')),
  direction: t.ReadonlyOptional(t.Literal('vertical')),
  align: t.ReadonlyOptional(Align),
  children: t.Readonly(t.Array(Block)),
});
const HorizontalSection = t.Object({
  type: t.Readonly(t.Literal('section')),
  direction: t.Readonly(t.Literal('horizontal')),
  children: t.Readonly(t.Array(VerticalSection)),
});
const Section = t.Union([VerticalSection, HorizontalSection]);

export const Document = t.Object({
  language: t.ReadonlyOptional(t.String()),
  title: t.Readonly(t.String()),
  children: t.Readonly(t.Array(Section)),
});

export const Tags = t.Array(t.Object({ tag: t.String(), value: t.String() }));
export type Tags = Static<typeof Tags>;

export type FormattedText = Static<typeof FormattedText>;
export type Tag = Static<typeof Tag>;
export type Link = Static<typeof Link>;
export type Image = Static<typeof Image>;
export type Inline = Static<typeof Inline>;
export type Heading = Static<typeof Heading>;
export type Paragraph = Static<typeof Paragraph>;
export type ListItem = Static<typeof ListItem>;
export type BulletedList = Static<typeof BulletedList>;
export type NumberedList = Static<typeof NumberedList>;
export type Block = Static<typeof Block>;
export type Section = Static<typeof Section>;
export type Document = Static<typeof Document>;
