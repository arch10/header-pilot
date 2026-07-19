import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const svgPath = resolve(root, 'public/icon.svg');
const outDir = resolve(root, 'public/icons');

const svg = await readFile(svgPath);
await mkdir(outDir, { recursive: true });

for (const size of [16, 32, 48, 128]) {
  const colored = resolve(outDir, `icon-${size}.png`);
  await sharp(svg).resize(size, size).png().toFile(colored);
  console.log(`wrote ${colored}`);

  const disabled = resolve(outDir, `icon-${size}-disabled.png`);
  await sharp(svg).resize(size, size).grayscale().png().toFile(disabled);
  console.log(`wrote ${disabled}`);
}
