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
import { type ReactNode, createContext, useContext } from 'react';
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
  },
  vsection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 10,
    paddingBottom: 30,
  },
  hsection: {
    display: 'flex',
    flexDirection: 'row',
  },
  text: {
    lineHeight: 1.4,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  paragraph: {
    paddingBottom: 30,
  },
  h1: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    paddingVertical: 20,
  },
  h2: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    paddingVertical: 10,
  },
  h3: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    paddingVertical: 5,
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
    width: '100%',
    gap: 5,
    paddingBottom: 2,
  },
  bullet: {
    marginTop: 6,
  },
});

const DocumentContext = createContext<{
  format: RenderFormat;
  tags: d.Tags;
  cache: Cache;
}>({
  format: 'mjml',
  tags: [],
  cache: {},
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
    <Section key={index} parent="document" node={child} />
  ));
  switch (format) {
    case 'pdf':
      return (
        <DocumentContext.Provider value={{ format, tags, cache }}>
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
        </DocumentContext.Provider>
      );
    case 'mjml':
      return (
        <DocumentContext.Provider value={{ format, tags, cache }}>
          <Mjml lang={language}>
            <MjmlHead>
              <MjmlTitle>{node.title}</MjmlTitle>
            </MjmlHead>
            <MjmlBody width="700px">{children}</MjmlBody>
          </Mjml>
        </DocumentContext.Provider>
      );
  }
}

function Section({
  node,
  parent,
}: {
  node: d.Section;
  parent: 'document' | 'section';
}) {
  const { format } = useContext(DocumentContext);
  const isHorizontal = node.direction == 'horizontal';
  const textAlign = isHorizontal ? undefined : node.align ?? 'left';
  const children = isHorizontal
    ? node.children.map((child, index) => (
        <Section key={index} parent="section" node={child} />
      ))
    : node.children.map((child, index) => (
        <Block key={index} align={textAlign} node={child} />
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

function Block({ node, align }: { node: d.Block; align?: Align }) {
  switch (node.type) {
    case 'paragraph':
      return <Paragraph node={node} align={align} />;
    case 'heading':
      return <Heading node={node} align={align} />;
    case 'numbered-list':
      return <NumberedList node={node} align={align} />;
    case 'bulleted-list':
      return <BulletedList node={node} align={align} />;
    case 'image':
      return <Image node={node} align={align} />;
  }
}

function Inline({ node }: { node: d.Inline }) {
  if ('text' in node) {
    return <Text node={node} />;
  }
  switch (node.type) {
    case 'link':
      return <Link node={node} />;
    case 'tag':
      return <Tag node={node} />;
  }
}

function Heading({ node, align }: { node: d.Heading; align?: Align }) {
  const { format } = useContext(DocumentContext);
  const children = node.children.map((child, index) => (
    <Inline key={index} node={child} />
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

function Paragraph({ node, align }: { node: d.Paragraph; align?: Align }) {
  const { format } = useContext(DocumentContext);
  const children = node.children.map((child, index) => (
    <Inline key={index} node={child} />
  ));
  switch (format) {
    case 'pdf':
      return (
        <ReactPDF.Text style={[styles.text, styles.paragraph]}>
          {children}
        </ReactPDF.Text>
      );
    case 'mjml':
      return (
        <MjmlText align={align} lineHeight="1.2" padding="0">
          <p>{children}</p>
        </MjmlText>
      );
  }
}

function ListItem({ node }: { node: d.ListItem }) {
  const { format } = useContext(DocumentContext);
  const children = node.children.map((child, index) => (
    <Inline key={index} node={child} />
  ));
  switch (format) {
    case 'mjml':
      return <li>{children}</li>;
    case 'pdf':
      return (
        <ReactPDF.View style={[styles.listItem, styles.text]}>
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
  align,
}: {
  node: d.NumberedList;
  align?: Align;
}) {
  const { format } = useContext(DocumentContext);
  const children = node.children.map((child, index) => (
    <ListItem key={index} node={child} />
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
  align,
}: {
  node: d.BulletedList;
  align?: Align;
}) {
  const { format } = useContext(DocumentContext);
  const children = node.children.map((child, index) => (
    <ListItem key={index} node={child} />
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

function Image({ node, align }: { node: d.Image; align?: Align }) {
  const { format, cache } = useContext(DocumentContext);
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

function Text({ node }: { node: d.FormattedText }) {
  const { format } = useContext(DocumentContext);
  const textDecoration = node.underline ? 'underline' : undefined;
  const backgroundColor = node.highlight ? '#ff0' : undefined;
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
        <ReactPDF.Text style={{ fontFamily, textDecoration, backgroundColor }}>
          {node.text}
        </ReactPDF.Text>
      );
    case 'mjml':
      return <TextLines node={node} />;
  }
}

function Link({ node }: { node: d.Link }) {
  const { format } = useContext(DocumentContext);
  const children = node.children.map((child, index) => (
    <Inline key={index} node={child} />
  ));
  switch (format) {
    case 'pdf':
      return <ReactPDF.Link src={node.href}>{children}</ReactPDF.Link>;
    case 'mjml':
      return <a href={node.href}>{children}</a>;
  }
}

function Tag({ node }: { node: d.Tag }) {
  const { tags, format } = useContext(DocumentContext);
  const value = tags.find((tag) => tag.tag == node.tag)?.value ?? '';
  switch (format) {
    case 'pdf':
      return value;
    case 'mjml':
      return value;
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
  if (node.underline) {
    text = <u>{text}</u>;
  }
  if (node.highlight) {
    text = <mark>{text}</mark>;
  }
  return text;
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
  const svg = await fetch(src).then((response) => response.arrayBuffer());
  return sharp(Buffer.from(svg)).png().toBuffer();
}
