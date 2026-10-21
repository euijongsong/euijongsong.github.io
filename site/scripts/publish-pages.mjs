import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { render } from '../dist/server/entry-server.js';

const source = new URL('../dist/client/', import.meta.url);
const destination = new URL('../../', import.meta.url);
const template = await readFile(new URL('index.html', source), 'utf8');
if (!template.includes('<div id="root"></div>')) {
  throw new Error('Expected one empty root in the generated HTML.');
}
const html = template.replace('<div id="root"></div>', `<div id="root">${render()}</div>`);
for (const directory of ['assets', 'fonts']) {
  await mkdir(new URL(directory, destination), { recursive: true });
  await cp(new URL(directory, source), new URL(directory, destination), { recursive: true });
}
await writeFile(new URL('index.html', destination), html);
console.log(`Generated pre-rendered GitHub Pages site: ${fileURLToPath(destination)}`);
