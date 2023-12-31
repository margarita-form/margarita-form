/// <reference types="vitest" />
import { defineConfig } from 'vite';
// import viteTsConfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';
import { join } from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/margarita-form',

  plugins: [
    dts({
      entryRoot: 'src',
      tsConfigFilePath: join(__dirname, 'tsconfig.lib.json'),
      skipDiagnostics: true,
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
    outDir: '../../dist/libs/margarita-form',
    reportCompressedSize: true,
    commonjsOptions: { transformMixedEsModules: true },
    lib: {
      name: 'margarita-form',
      entry: {
        index: 'src/index.ts',
        'light/index': 'src/light.ts',
        /* Validators */
        'validators/index': 'src/validators/index.ts',
        'validators/add-default-validators': 'src/validators/add-default-validators',
        'validators/add-all-validators': 'src/validators/add-all-validators',
        /* Resolvers */
        'resolvers/and-or': 'src/resolvers/and-or/index.ts',
        /* Managers */
        'managers/config-manager': 'src/managers/config-manager.ts',
        'managers/controls-manager': 'src/managers/controls-manager.ts',
        'managers/events-manager': 'src/managers/events-manager.ts',
        'managers/field-manager': 'src/managers/field-manager.ts',
        'managers/params-manager': 'src/managers/params-manager.ts',
        'managers/ref-manager': 'src/managers/ref-manager.ts',
        'managers/state-manager': 'src/managers/state-manager.ts',
        'managers/value-manager': 'src/managers/value-manager.ts',
        /* Extensions */
        'extensions/i18n/i18n-extension': 'src/extensions/i18n/i18n-extension.ts',
        'extensions/storage/storage-extension-base': 'src/extensions/storage/storage-extension-base.ts',
        'extensions/storage/browser-local-storage': 'src/extensions/storage/browser-local-storage.ts',
        'extensions/storage/browser-search-params-storage': 'src/extensions/storage/browser-search-params-storage.ts',
        'extensions/storage/browser-session-storage': 'src/extensions/storage/browser-session-storage.ts',
        'extensions/syncronization/syncronization-extension-base': 'src/extensions/syncronization/syncronization-extension-base.ts',
        'extensions/syncronization/browser-syncronization': 'src/extensions/syncronization/browser-syncronization.ts',
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
      external: ['rxjs', 'nanoid'],
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
      reportsDirectory: '../../coverage/libs/margarita-form',
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
