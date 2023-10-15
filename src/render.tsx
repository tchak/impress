import * as ReactPDF from '@react-pdf/renderer';
import {
  Mjml,
  MjmlHead,
  MjmlTitle,
  MjmlText,
  MjmlSection,
  MjmlColumn,
  MjmlBody,
  MjmlImage,
} from '@faire/mjml-react';
import { renderToMjml } from '@faire/mjml-react/utils/renderToMjml';
import { htmlToText } from 'html-to-text';
import mjmlToHTML from 'mjml';
import type { ReactNode } from 'react';
import sharp from 'sharp';

import * as d from './document';

type RenderFormat = 'pdf' | 'mjml';
type Format = 'html' | 'pdf' | 'mjml' | 'text';
type Align = 'left' | 'center' | 'right' | 'justify';

const styles = ReactPDF.StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    fontFamily: 'Helvetica',
    display: 'flex',
    gap: 50,
  },
  vsection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 5,
  },
  hsection: {
    display: 'flex',
    flexDirection: 'row',
  },
  paragraph: {
    lineHeight: 1.5,
    marginBottom: 10,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  h1: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
  },
  h2: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
  },
  h3: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
  },
  pageNumbers: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    lineHeight: 1.5,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  bullet: {
    marginTop: 6,
  },
});

export async function renderDocument(
  document: d.Document,
  tags: d.Tags,
  format: Format
): Promise<string | Buffer> {
  const cache = format == 'pdf' ? await prefetchDocumentSVG(document) : {};
  const doc = (
    <Document
      node={document}
      tags={tags}
      cache={cache}
      format={format == 'pdf' ? 'pdf' : 'mjml'}
    />
  );
  if (format == 'pdf') {
    return ReactPDF.renderToBuffer(doc);
  }
  const mjml = renderToMjml(doc);
  switch (format) {
    case 'html':
      return mjmlToHTML(mjml).html;
    case 'text':
      return htmlToText(mjmlToHTML(mjml).html);
    case 'mjml':
      return mjml;
  }
}

export function Document({
  node,
  tags,
  cache,
  format,
}: {
  node: d.Document;
  tags: d.Tags;
  cache: Cache;
  format: RenderFormat;
}) {
  const language = node.language ?? 'en';
  const children = node.children.map((child, index) => (
    <Section
      key={index}
      parent="document"
      node={child}
      tags={tags}
      cache={cache}
      format={format}
    />
  ));
  switch (format) {
    case 'pdf':
      return (
        <ReactPDF.Document language={language} title={node.title}>
          <ReactPDF.Page size="A4" style={styles.page}>
            {children}
            <ReactPDF.Text
              style={styles.pageNumbers}
              render={({ pageNumber, totalPages }) =>
                `${pageNumber} / ${totalPages}`
              }
              fixed
            />
          </ReactPDF.Page>
        </ReactPDF.Document>
      );
    case 'mjml':
      return (
        <Mjml lang={language}>
          <MjmlHead>
            <MjmlTitle>{node.title}</MjmlTitle>
          </MjmlHead>
          <MjmlBody width="700px">{children}</MjmlBody>
        </Mjml>
      );
  }
}

function Section({
  node,
  tags,
  cache,
  parent,
  format,
}: {
  node: d.Section;
  tags: d.Tags;
  cache: Cache;
  format: RenderFormat;
  parent: 'document' | 'section';
}) {
  const isHorizontal = node.direction == 'horizontal';
  const textAlign = isHorizontal ? undefined : node.align ?? 'left';
  const children = isHorizontal
    ? node.children.map((child, index) => (
        <Section
          key={index}
          parent="section"
          node={child}
          tags={tags}
          cache={cache}
          format={format}
        />
      ))
    : node.children.map((child, index) => (
        <Block
          key={index}
          align={textAlign}
          node={child}
          tags={tags}
          cache={cache}
          format={format}
        />
      ));

  switch (format) {
    case 'pdf':
      return (
        <ReactPDF.View
          style={
            isHorizontal
              ? styles.hsection
              : [
                  styles.vsection,
                  { textAlign, flex: parent == 'section' ? 1 : undefined },
                ]
          }
        >
          {children}
        </ReactPDF.View>
      );
    case 'mjml':
      if (isHorizontal) {
        return <MjmlSection padding="10px 0">{children}</MjmlSection>;
      } else if (parent == 'section') {
        return <MjmlColumn>{children}</MjmlColumn>;
      } else {
        return (
          <MjmlSection padding="10px 0">
            <MjmlColumn>{children}</MjmlColumn>
          </MjmlSection>
        );
      }
  }
}

function Block({
  node,
  tags,
  cache,
  align,
  format,
}: {
  node: d.Block;
  tags: d.Tags;
  cache: Cache;
  align?: Align;
  format: RenderFormat;
}) {
  switch (node.type) {
    case 'paragraph':
      return (
        <Paragraph node={node} tags={tags} align={align} format={format} />
      );
    case 'heading':
      return <Heading node={node} tags={tags} align={align} format={format} />;
    case 'numbered-list':
      return (
        <NumberedList node={node} tags={tags} align={align} format={format} />
      );
    case 'bulleted-list':
      return (
        <BulletedList node={node} tags={tags} align={align} format={format} />
      );
    case 'image':
      return <Image node={node} cache={cache} align={align} format={format} />;
  }
}

function Heading({
  node,
  tags,
  align,
  format,
}: {
  node: d.Heading;
  tags: d.Tags;
  align?: Align;
  format: RenderFormat;
}) {
  const children = node.children.map((child, index) => (
    <Inline key={index} node={child} tags={tags} format={format} />
  ));
  switch (format) {
    case 'pdf':
      return (
        <ReactPDF.Text style={headingStyle(node.level)}>
          {children}
        </ReactPDF.Text>
      );
    case 'mjml':
      return (
        <MjmlText align={align}>
          <HTMLHeading level={node.level}>{children}</HTMLHeading>
        </MjmlText>
      );
  }
}

function headingStyle(level: number) {
  switch (level) {
    case 1:
      return styles.h1;
    case 2:
      return styles.h2;
    case 3:
      return styles.h3;
  }
}

function HTMLHeading({
  level,
  children,
}: {
  level: number;
  children: ReactNode;
}) {
  switch (level) {
    case 1:
      return <h1>{children}</h1>;
    case 2:
      return <h2>{children}</h2>;
    case 3:
      return <h3>{children}</h3>;
  }
}

function Paragraph({
  node,
  tags,
  align,
  format,
}: {
  node: d.Paragraph;
  tags: d.Tags;
  align?: Align;
  format: RenderFormat;
}) {
  const children = node.children.map((child, index) => (
    <Inline key={index} node={child} tags={tags} format={format} />
  ));
  switch (format) {
    case 'pdf':
      return <ReactPDF.Text style={styles.paragraph}>{children}</ReactPDF.Text>;
    case 'mjml':
      return (
        <MjmlText align={align} lineHeight="1.2" padding="0">
          <p>{children}</p>
        </MjmlText>
      );
  }
}

function ListItem({
  node,
  tags,
  format,
}: {
  node: d.ListItem;
  tags: d.Tags;
  format: RenderFormat;
}) {
  const children = node.children.map((child, index) => (
    <Inline key={index} node={child} tags={tags} format={format} />
  ));
  switch (format) {
    case 'mjml':
      return <li>{children}</li>;
    case 'pdf':
      return (
        <ReactPDF.View style={styles.listItem}>
          <ReactPDF.View style={styles.bullet}>
            <ReactPDF.Svg width={2} height={2}>
              <ReactPDF.Circle cx="1" cy="1" r="2" fill="#ccc" />
            </ReactPDF.Svg>
          </ReactPDF.View>
          {children}
        </ReactPDF.View>
      );
  }
}

function NumberedList({
  node,
  tags,
  align,
  format,
}: {
  node: d.NumberedList;
  tags: d.Tags;
  align?: Align;
  format: RenderFormat;
}) {
  const children = node.children.map((child, index) => (
    <ListItem key={index} node={child} tags={tags} format={format} />
  ));
  switch (format) {
    case 'pdf':
      return <ReactPDF.View style={styles.list}>{children}</ReactPDF.View>;
    case 'mjml':
      return (
        <MjmlText align={align} padding="0">
          <ol>{children}</ol>
        </MjmlText>
      );
  }
}

function BulletedList({
  node,
  tags,
  align,
  format,
}: {
  node: d.BulletedList;
  tags: d.Tags;
  align?: Align;
  format: RenderFormat;
}) {
  const children = node.children.map((child, index) => (
    <ListItem key={index} node={child} tags={tags} format={format} />
  ));
  switch (format) {
    case 'pdf':
      return <ReactPDF.View style={styles.list}>{children}</ReactPDF.View>;
    case 'mjml':
      return (
        <MjmlText align={align} padding="0">
          <ul>{children}</ul>
        </MjmlText>
      );
  }
}

function Inline({
  node,
  tags,
  format,
}: {
  node: d.Inline;
  tags: d.Tags;
  format: RenderFormat;
}) {
  if ('text' in node) {
    return <Text node={node} format={format} />;
  }
  switch (node.type) {
    case 'link':
      return <Link node={node} tags={tags} format={format} />;
    case 'tag':
      return <Tag node={node} tags={tags} format={format} />;
  }
}

function TextLine({ text, last }: { text: string; last: boolean }) {
  if (last) {
    return text;
  }
  return (
    <>
      {text}
      <br />
    </>
  );
}

function TextLines({ node }: { node: d.FormattedText }) {
  const lines = node.text.split('\n');
  const lastIndex = lines.length - 1;
  let text = (
    <>
      {lines.map((text, index) => (
        <TextLine key={index} text={text} last={index == lastIndex} />
      ))}
    </>
  );
  if (node.bold) {
    text = <strong>{text}</strong>;
  }
  if (node.italic) {
    text = <em>{text}</em>;
  }
  return text;
}

function Text({
  node,
  format,
}: {
  node: d.FormattedText;
  format: RenderFormat;
}) {
  const textDecoration = node.underline ? 'underline' : undefined;
  const fontFamily =
    node.bold && node.italic
      ? 'Helvetica-BoldOblique'
      : node.bold
      ? 'Helvetica-Bold'
      : node.italic
      ? 'Helvetica-Oblique'
      : 'Helvetica';

  switch (format) {
    case 'pdf':
      return (
        <ReactPDF.Text style={{ fontFamily, textDecoration }}>
          {node.text}
        </ReactPDF.Text>
      );
    case 'mjml':
      return <TextLines node={node} />;
  }
}

function Link({
  node,
  tags,
  format,
}: {
  node: d.Link;
  tags: d.Tags;
  format: RenderFormat;
}) {
  const children = node.children.map((child, index) => (
    <Inline key={index} node={child} tags={tags} format={format} />
  ));
  switch (format) {
    case 'pdf':
      return <ReactPDF.Link src={node.href}>{children}</ReactPDF.Link>;
    case 'mjml':
      return <a href={node.href}>{children}</a>;
  }
}

function Tag({
  node,
  tags,
  format,
}: {
  node: d.Tag;
  tags: d.Tags;
  format: RenderFormat;
}) {
  const value = tags.find((tag) => tag.tag == node.tag)?.value ?? '';
  switch (format) {
    case 'pdf':
      return value;
    case 'mjml':
      return value;
  }
}

function Image({
  node,
  cache,
  align,
  format,
}: {
  node: d.Image;
  cache: Cache;
  align?: Align;
  format: RenderFormat;
}) {
  switch (format) {
    case 'pdf':
      return (
        <ReactPDF.Image
          src={cache[node.src] ?? node.src}
          style={{ width: node.width }}
        />
      );
    case 'mjml':
      return (
        <MjmlImage
          src={node.src}
          padding="0"
          width={node.width}
          height={node.height}
          align={align == 'justify' ? 'center' : align}
          alt={node.alt ?? ''}
        />
      );
  }
}

type Cache = Record<string, Buffer>;

async function prefetchDocumentSVG(doc: d.Document) {
  const cache: Cache = {};
  for (const section of doc.children) {
    for (const blockOrSection of section.children) {
      if (blockOrSection.type == 'section') {
        for (const block of blockOrSection.children) {
          await prefetchSVG(block, cache);
        }
      } else {
        await prefetchSVG(blockOrSection, cache);
      }
    }
  }
  return cache;
}

async function prefetchSVG(node: d.Block, cache: Cache) {
  if (node.type == 'image' && node.src.endsWith('.svg') && !cache[node.src]) {
    cache[node.src] = await svgToPng(node.src);
  }
}

async function svgToPng(src: string) {
  const svg = await fetch(src).then((response) => response.text());
  return sharp(Buffer.from(svg)).png().toBuffer();
}
