// Split Kenshi's UI atlas (data/gui/gfx/Kenshi_UI.png) into one PNG per icon, named after the game's own image sets.
// Usage: node scripts/split-ui-atlas.mjs <Kenshi data/gui folder>
// The icons are Lo-Fi Games' artwork and are written to the gitignored ui-icons/. Copy the ones the site uses into
// public/icons/ and list them in public/notices/artwork.txt.
import * as cheerio from 'cheerio';
import { PNG } from 'pngjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const atlasName = 'Kenshi_UI.png';
const outDir = 'ui-icons';

// Every frame of every image set drawn from the atlas: [file name, x, y, width, height].
function atlasRegions(definitions) {
  const $ = cheerio.load(definitions, { xml: true });
  return $(`Resource[type="ResourceImageSet"] Group[texture="${atlasName}"]`).toArray().flatMap((group) => {
    const set = $(group).closest('Resource').attr('name');
    const [width, height] = $(group).attr('size').split(/\s+/).map(Number);
    return $(group).find('Index').toArray().flatMap((index) => {
      const frames = $(index).find('Frame').toArray();
      return frames.map((frame, number) => {
        const [x, y] = $(frame).attr('point').split(/\s+/).map(Number);
        const name = [set, $(index).attr('name'), frames.length > 1 ? number + 1 : ''].filter(Boolean).join('-');
        return [name.replace(/[^\w.-]+/g, '_'), x, y, width, height];
      });
    });
  });
}

function crop(atlas, x, y, width, height) {
  const icon = new PNG({ width, height });
  PNG.bitblt(atlas, icon, x, y, width, height, 0, 0);
  return PNG.sync.write(icon);
}

async function main() {
  const gui = process.argv[2];
  if (!gui) throw new Error('Pass the path to Kenshi\'s data/gui folder.');

  const atlas = PNG.sync.read(await readFile(join(gui, 'gfx', atlasName)));
  const regions = atlasRegions(await readFile(join(gui, 'images', 'kenshi_images.xml'), 'utf8'));
  await mkdir(outDir, { recursive: true });
  for (const [name, x, y, width, height] of regions) await writeFile(join(outDir, `${name}.png`), crop(atlas, x, y, width, height));
  console.log(`Wrote ${regions.length} icons to ${outDir}/.`);
}

await main();
