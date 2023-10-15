import { Elysia, t } from 'elysia';
import { bearer } from '@elysiajs/bearer';
import { swagger } from '@elysiajs/swagger';

import { Document, Tags } from './document';
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

const app = new Elysia()
  .use(bearer())
  .use(swagger())
  .error({
    BAD_REQUEST: BadRequestError,
    UNAUTHORIZED_REQUEST: UnauthorizedError,
  })
  .onError(({ code, error }) => {
    switch (code) {
      case 'BAD_REQUEST':
        return new Response(error.message, { status: 400 });
      case 'UNAUTHORIZED_REQUEST':
        return new Response(error.message, { status: 401 });
    }
  })
  .post(
    '/v1',
    async ({ headers, body: { document, tags, ...options } }) => {
      const format =
        acceptToFormat(headers['accept']) ?? options?.format ?? 'html';
      const contentType = formatToContentType(format);
      const doc = await renderDocument(document, tags ?? [], format);

      return new Response(doc, { headers: { 'content-type': contentType } });
    },
    {
      beforeHandle({ bearer }) {
        if (bearer !== Config.SECRET_TOKEN) {
          throw new UnauthorizedError('Invalid token');
        }
      },
      body: t.Object({
        document: Document,
        tags: t.ReadonlyOptional(Tags),
        format: t.ReadonlyOptional(
          t.Union(
            [
              t.Literal('html'),
              t.Literal('text'),
              t.Literal('pdf'),
              t.Literal('mjml'),
            ],
            { default: 'html' }
          )
        ),
      }),
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
