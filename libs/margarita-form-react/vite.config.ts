/// <reference types="vitest" />
import { defineConfig } from 'vite';
// import viteTsConfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';
import { join } from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/margarita-form-react',

  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: join(__dirname, 'tsconfig.lib.json'),
      pathsToAliases: false,
    }),
    /*
    viteTsConfigPaths({
      root: '../../',
    }),
    */
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: '../../dist/libs/margarita-form-react',
    reportCompressedSize: true,
    commonjsOptions: { transformMixedEsModules: true },
    lib: {
      name: 'margarita-form-react',
      entry: {
        index: 'src/index.ts',
        'light/index': 'src/light.ts',
      },
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'js' : format;
        const parts = entryName.split('/');
        if (parts.length > 1) {
          const name = parts.at(-1);
          const path = parts.slice(0, -1).join('/');
          return `${path}/${name}.${ext}`;
        }

        return `${entryName}.${ext}`;
      },
      // Change this to the formats you want to support.
      // Don't forgot to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [
        //
        'react',
        /react\/jsx.*/,
        /react-dom\/.*/,
        'rxjs',
        'nanoid',
        /@margarita-form\/.+/,
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
  },
  esbuild: {
    minifyIdentifiers: false,
    minifySyntax: true,
    minifyWhitespace: true,
  },
  test: {
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/margarita-form-react',
      provider: 'v8',
    },
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
