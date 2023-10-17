import sharp from 'sharp';
import type * as d from './document';

export type Cache = Record<string, Buffer>;

export async function prefetchImages(
  content: (d.Block | d.Section | d.Grid | d.ListItem | d.Inline)[],
  cache: Cache = {}
) {
  for (const node of content) {
    if (node.type == 'image') {
      await prefetchSVG(node, cache);
    } else if ('content' in node && node.content.length > 0) {
      await prefetchImages(node.content, cache);
    }
  }
  return cache;
}

async function prefetchSVG(node: d.Image, cache: Cache) {
  if (node.attrs.src.endsWith('.svg') && !cache[node.attrs.src]) {
    cache[node.attrs.src] = await svgToPng(node.attrs.src);
  }
}

async function svgToPng(src: string) {
  const svg = await fetch(src).then((response) => response.arrayBuffer());
  return sharp(Buffer.from(svg)).png().toBuffer();
}
