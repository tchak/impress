import sharp from 'sharp';
import type * as d from './document';

export type Cache = Record<string, Buffer>;

export async function prefetchImages(
  content: (d.Block | d.Column | d.Grid | d.ListItem | d.Inline)[],
  cache: Cache = {}
) {
  for (const node of content) {
    if (node.type == 'image') {
      await prefetchImage(node, cache);
    } else if ('content' in node && node.content.length > 0) {
      await prefetchImages(node.content, cache);
    }
  }
  return cache;
}

async function prefetchImage(node: d.Image, cache: Cache) {
  if (!cache[node.attrs.src]) {
    cache[node.attrs.src] = await fetchImage(node.attrs.src);
  }
}

async function fetchImage(src: string) {
  const buffer = await fetch(src)
    .then((response) => response.arrayBuffer())
    .then((array) => Buffer.from(array));

  if (src.endsWith('.svg')) {
    return sharp(buffer).png().toBuffer();
  }

  return buffer;
}
