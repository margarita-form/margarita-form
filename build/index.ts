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
    await build({
      ...commonOptions,
      external: ['rxjs', 'nanoid'],
    });
  }
});

await Promise.all(promises);
