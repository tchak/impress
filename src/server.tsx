import { Elysia, t } from 'elysia';
import { bearer } from '@elysiajs/bearer';
import { staticPlugin } from '@elysiajs/static';
import { renderToStaticMarkup } from 'react-dom/server';
import { z } from 'zod';
import { fromZodError, ValidationError } from 'zod-validation-error';

import { Doc, Tags } from './document';
import { Config } from './config';
import { renderDocument } from './render';

class BadRequestError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

class UnauthorizedError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

const Body = z.object({
  document: Doc,
  tags: Tags.optional().default([]),
  format: z.enum(['pdf', 'html', 'mjml', 'text']).default('html'),
});

const app = new Elysia()
  .use(bearer())
  .use(staticPlugin({ prefix: '' }))
  .error({
    BAD_REQUEST: BadRequestError,
    UNAUTHORIZED_REQUEST: UnauthorizedError,
    VALIDATION_ERROR: ValidationError,
  })
  .onError(({ code, error }) => {
    switch (code) {
      case 'BAD_REQUEST':
      case 'VALIDATION_ERROR':
        return new Response(error.message, { status: 400 });
      case 'UNAUTHORIZED_REQUEST':
        return new Response(error.message, { status: 401 });
    }
  })
  .get('/', async () => {
    const html = renderToStaticMarkup(
      <html lang="en">
        <head>
          <link rel="stylesheet" href="/assets/tailwind.css" />
        </head>
        <body>
          <div id="root"></div>
          <script src="/assets/editor.js" type="module"></script>
        </body>
      </html>
    );
    return new Response(`${html}`, {
      headers: { 'content-type': 'text/html' },
    });
  })
  .post(
    '/v1',
    async ({ headers, body }) => {
      const result = Body.safeParse(body);
      if (result.success == false) {
        const error = fromZodError(result.error);
        throw error;
      }
      const format = acceptToFormat(headers['accept']) ?? result.data.format;
      const contentType = formatToContentType(format);
      const doc = await renderDocument(
        result.data.document,
        result.data.tags,
        format
      );

      return new Response(doc, { headers: { 'content-type': contentType } });
    },
    {
      body: t.Unknown(),
    }
  )
  .listen(Config.PORT);

function formatToContentType(format: string): string {
  switch (format) {
    case 'pdf':
      return 'application/pdf';
    case 'text':
      return 'text/plain';
    case 'mjml':
      return 'text/mjml';
    default:
      return 'text/html';
  }
}

function acceptToFormat(
  accept: string | null
): 'pdf' | 'html' | 'text' | 'mjml' | null {
  switch (accept) {
    case 'application/pdf':
      return 'pdf';
    case 'text/plain':
      return 'text';
    case 'text/mjml':
      return 'mjml';
    case 'text/html':
      return 'html';
    default:
      return null;
  }
}

console.log(
  `🦊 impress is running at ${app.server?.hostname}:${app.server?.port}`
);
