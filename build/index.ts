import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { buildEntries } from './entries.js';
import { build, BuildOptions } from 'esbuild';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const root = resolve(__dirname, '../..', 'libs', 'margarita-form', 'src');
const dist = resolve(__dirname, '..', 'libs', 'margarita-form');

const promises = buildEntries.map(async ({ main, globalName, src, outfile }) => {
  const entryPoint = resolve(root, src + '.ts');
  const outDir = resolve(dist, outfile || src + '.min.js');

  const commonOptions: BuildOptions = {
    entryPoints: [entryPoint],
    outfile: outDir,
    bundle: true,
    platform: 'browser',
    format: 'iife',
    minify: true,
    globalName,
  };

  if (main) {
    await build({
      ...commonOptions,
      external: [],
    });
  } else {
    const _globalName = `_${globalName}`;
    const footer = `var ${globalName} = ${_globalName}.${globalName};`;

    await build({
      ...commonOptions,
      globalName: _globalName,
      external: ['rxjs', 'nanoid'],
      footer: {
        js: footer || '',
      },
    });
  }
});

await Promise.all(promises);
