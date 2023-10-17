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
  MjmlAttributes,
} from '@faire/mjml-react';
import { renderToMjml } from '@faire/mjml-react/utils/renderToMjml';
import { htmlToText } from 'html-to-text';
import mjmlToHTML from 'mjml';
import { type ReactNode, createContext, useContext } from 'react';

import { memoize } from '@formatjs/fast-memoize';

import type * as d from './document';
import { prefetchImages, type Cache } from './prefetch-images';
import { styles } from './pdf-styles';

type RenderFormat = 'pdf' | 'mjml';
type Format = 'html' | 'pdf' | 'mjml' | 'text';

const formatters = {
  getListFormat: memoize(
    (locale: string | string[], opts?: Intl.ListFormatOptions) =>
      new Intl.ListFormat(locale, opts)
  ),
  getNumberFormat: memoize(
    (locale: string | string[], opts?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(locale, opts)
  ),
  getDateTimeFormat: memoize(
    (locale: string | string[], opts?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, opts)
  ),
};

const RenderContext = createContext<{
  language: string;
  format: RenderFormat;
  tags: d.Tags;
  cache: Cache;
}>({
  language: 'en-uk',
  format: 'mjml',
  tags: [],
  cache: {},
});

export async function renderDocument(
  doc: d.Doc,
  tags: d.Tags,
  format: Format
): Promise<string | Buffer> {
  const cache = format == 'pdf' ? await prefetchImages(doc.content) : {};
  const element = (
    <Doc
      node={doc}
      tags={tags}
      cache={cache}
      format={format == 'pdf' ? 'pdf' : 'mjml'}
    />
  );
  if (format == 'pdf') {
    return ReactPDF.renderToBuffer(element);
  }
  const mjml = renderToMjml(element);
  switch (format) {
    case 'html':
      return mjmlToHTML(mjml).html;
    case 'text':
      return htmlToText(mjmlToHTML(mjml).html);
    case 'mjml':
      return mjml;
  }
}

export function Doc({
  node,
  tags,
  cache,
  format,
}: {
  node: d.Doc;
  tags: d.Tags;
  cache: Cache;
  format: RenderFormat;
}) {
  const children = node.content.map((child, index) =>
    child.type == 'section' ? (
      <Section key={index} depth={0} node={child} />
    ) : (
      <Grid key={index} node={child} />
    )
  );
  switch (format) {
    case 'pdf':
      return (
        <RenderContext.Provider
          value={{ format, tags, cache, language: node.attrs.language }}
        >
          <ReactPDF.Document
            language={node.attrs.language}
            title={node.attrs.title}
          >
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
        </RenderContext.Provider>
      );
    case 'mjml':
      return (
        <RenderContext.Provider
          value={{ format, tags, cache, language: node.attrs.language }}
        >
          <Mjml lang={node.attrs.language}>
            <MjmlHead>
              <MjmlTitle>{node.attrs.title}</MjmlTitle>
              <MjmlAttributes>
                <MjmlText lineHeight="1.2" padding="0" />
                <MjmlSection padding="10px 0" />
                <MjmlImage padding="0" />
              </MjmlAttributes>
            </MjmlHead>
            <MjmlBody width="700px">{children}</MjmlBody>
          </Mjml>
        </RenderContext.Provider>
      );
  }
}

function Grid({ node }: { node: d.Grid }) {
  const { format } = useContext(RenderContext);
  const children = node.content.map((child, index) => (
    <Section key={index} depth={1} node={child} />
  ));

  switch (format) {
    case 'pdf':
      return <ReactPDF.View style={styles.grid}>{children}</ReactPDF.View>;
    case 'mjml':
      return <MjmlSection>{children}</MjmlSection>;
  }
}

function Section({ node, depth }: { node: d.Section; depth: number }) {
  const { format } = useContext(RenderContext);
  const textAlign = node.attrs?.align ?? 'left';
  const children = node.content.map((child, index) => (
    <Block key={index} depth={0} align={textAlign} node={child} />
  ));

  switch (format) {
    case 'pdf':
      return (
        <ReactPDF.View
          style={[
            styles.section,
            { textAlign, flex: depth == 1 ? 1 : undefined },
          ]}
        >
          {children}
        </ReactPDF.View>
      );
    case 'mjml':
      if (depth == 1) {
        return <MjmlColumn>{children}</MjmlColumn>;
      } else {
        return (
          <MjmlSection>
            <MjmlColumn>{children}</MjmlColumn>
          </MjmlSection>
        );
      }
  }
}

function Block({
  node,
  depth,
  align,
}: {
  node: d.Block;
  depth: number;
  align?: d.Align;
}) {
  switch (node.type) {
    case 'paragraph':
      return <Paragraph node={node} depth={depth} align={align} />;
    case 'heading':
      return <Heading node={node} depth={depth} align={align} />;
    case 'orderedList':
      return <OrderedList node={node} depth={depth} align={align} />;
    case 'bulletList':
      return <BulletList node={node} depth={depth} align={align} />;
    case 'image':
      return <Image node={node} depth={depth} align={align} />;
  }
}

function Inline({ node }: { node: d.Inline }) {
  const { format } = useContext(RenderContext);
  switch (node.type) {
    case 'text':
      return <Text node={node} />;
    case 'tag':
    case 'mention':
      return <Tag node={node} />;
    case 'hardBreak':
      return format == 'mjml' ? <br /> : '';
    case 'image':
      return <Image node={node} depth={1} />;
  }
}

function Heading({
  node,
  depth,
  align,
}: {
  node: d.Heading;
  depth: number;
  align?: d.Align;
}) {
  const { format } = useContext(RenderContext);
  const children = node.content.map((child, index) => (
    <Inline key={index} node={child} />
  ));
  switch (format) {
    case 'pdf':
      return (
        <ReactPDF.Text style={headingStyle(node.attrs.level)}>
          {children}
        </ReactPDF.Text>
      );
    case 'mjml':
      if (depth > 0) {
        return <HTMLHeading level={node.attrs.level}>{children}</HTMLHeading>;
      }
      return (
        <MjmlText align={align}>
          <HTMLHeading level={node.attrs.level}>{children}</HTMLHeading>
        </MjmlText>
      );
  }
}

function Paragraph({
  node,
  depth,
  align,
}: {
  node: d.Paragraph;
  depth: number;
  align?: d.Align;
}) {
  const { format } = useContext(RenderContext);
  const children = node.content.map((child, index) => (
    <Inline key={index} node={child} />
  ));
  switch (format) {
    case 'pdf':
      return (
        <ReactPDF.Text
          style={[
            styles.text,
            depth > 0 ? { paddingBottom: 5 } : { paddingBottom: 30 },
          ]}
        >
          {children}
        </ReactPDF.Text>
      );
    case 'mjml':
      if (depth > 0) {
        return <p>{children}</p>;
      }
      return (
        <MjmlText align={align}>
          <p>{children}</p>
        </MjmlText>
      );
  }
}

function ListItem({ node, depth }: { node: d.ListItem; depth: number }) {
  const { format } = useContext(RenderContext);
  const children = node.content.map((child, index) => (
    <Block key={index} depth={depth + 1} node={child} />
  ));
  switch (format) {
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
    case 'mjml':
      return <li>{children}</li>;
  }
}

function OrderedList({
  node,
  depth,
  align,
}: {
  node: d.OrderedList;
  depth: number;
  align?: d.Align;
}) {
  const { format } = useContext(RenderContext);
  const children = node.content.map((child, index) => (
    <ListItem key={index} depth={depth} node={child} />
  ));
  switch (format) {
    case 'pdf':
      return <ReactPDF.View style={styles.list}>{children}</ReactPDF.View>;
    case 'mjml':
      if (depth > 0) {
        return <ol>{children}</ol>;
      }
      return (
        <MjmlText align={align}>
          <ol>{children}</ol>
        </MjmlText>
      );
  }
}

function BulletList({
  node,
  depth,
  align,
}: {
  node: d.BulletList;
  depth: number;
  align?: d.Align;
}) {
  const { format } = useContext(RenderContext);
  const children = node.content.map((child, index) => (
    <ListItem key={index} depth={depth} node={child} />
  ));
  switch (format) {
    case 'pdf':
      return <ReactPDF.View style={styles.list}>{children}</ReactPDF.View>;
    case 'mjml':
      if (depth > 0) {
        return <ul>{children}</ul>;
      }
      return (
        <MjmlText align={align}>
          <ul>{children}</ul>
        </MjmlText>
      );
  }
}

function Image({
  node,
  depth,
  align,
}: {
  node: d.Image;
  depth: number;
  align?: d.Align;
}) {
  const { format, cache } = useContext(RenderContext);
  switch (format) {
    case 'pdf':
      return (
        <ReactPDF.Image
          src={cache[node.attrs.src] ?? node.attrs.src}
          style={{ width: node.attrs.width }}
        />
      );
    case 'mjml':
      return depth > 0 ? (
        <img
          src={node.attrs.src}
          alt={node.attrs.alt}
          width={node.attrs.width}
          height={node.attrs.height}
        />
      ) : (
        <MjmlImage
          src={node.attrs.src}
          width={node.attrs.width}
          height={node.attrs.height}
          align={align == 'justify' ? 'center' : align}
          alt={node.attrs.alt ?? ''}
        />
      );
  }
}

function Text({ node }: { node: d.Text }) {
  const { format } = useContext(RenderContext);
  const mark = getMark(node.marks);

  switch (format) {
    case 'pdf':
      if (mark.link) {
        return (
          <ReactPDF.Link src={mark.link.href} style={textMarkStyle(mark)}>
            {node.text}
          </ReactPDF.Link>
        );
      }
      return (
        <ReactPDF.Text style={textMarkStyle(mark)}>{node.text}</ReactPDF.Text>
      );
    case 'mjml':
      return <FormattedText text={node.text} mark={mark} />;
  }
}

function Tag({ node }: { node: d.Tag }) {
  const { tags, format, language } = useContext(RenderContext);
  const mark = getMark(node.marks);
  const tag = tags.find((tag) => tag.id == node.attrs.id);
  const value = formatTagValue(language, tag);

  switch (format) {
    case 'pdf':
      return <ReactPDF.Text style={textMarkStyle(mark)}>{value}</ReactPDF.Text>;
    case 'mjml':
      return <FormattedText text={value} mark={mark} />;
  }
}

function formatTagValue(language: string, tag?: d.TagValue) {
  if (tag?.value == null) {
    return '';
  }
  if (Array.isArray(tag.value)) {
    return formatters.getListFormat(language).format(tag.value);
  }
  switch (typeof tag.value) {
    case 'number':
      return formatters.getNumberFormat(language).format(tag.value);
  }
  return tag.value;
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

type Mark = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  highlight?: boolean;
  link?: d.Link['attrs'];
};

function getMark(marks?: d.Mark[]): Mark {
  return Object.fromEntries(
    (marks ?? []).map((mark) =>
      mark.type == 'link' ? [mark.type, mark.attrs] : [mark.type, true]
    )
  );
}

function textMarkStyle(mark: Mark) {
  const textDecoration =
    mark.underline || mark.link ? ('underline' as const) : undefined;
  const backgroundColor = mark.highlight ? '#ff0' : undefined;
  const fontFamily =
    mark.bold && mark.italic
      ? 'Helvetica-BoldOblique'
      : mark.bold
      ? 'Helvetica-Bold'
      : mark.italic
      ? 'Helvetica-Oblique'
      : 'Helvetica';

  return { fontFamily, textDecoration, backgroundColor };
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

function FormattedText({ text, mark }: { text: string; mark: Mark }) {
  const lines = text.split('\n');
  const lastIndex = lines.length - 1;
  let formattedText = (
    <>
      {lines.map((line, index) => (
        <TextLine key={index} text={line} last={index == lastIndex} />
      ))}
    </>
  );

  if (mark.bold) {
    formattedText = <strong>{formattedText}</strong>;
  }
  if (mark.italic) {
    formattedText = <em>{formattedText}</em>;
  }
  if (mark.underline) {
    formattedText = <u>{formattedText}</u>;
  }
  if (mark.highlight) {
    formattedText = <mark>{formattedText}</mark>;
  }
  if (mark.link) {
    formattedText = (
      <a href={mark.link.href} rel={mark.link.rel} target={mark.link.target}>
        {formattedText}
      </a>
    );
  }

  return formattedText;
}
