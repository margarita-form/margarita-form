/// <reference types="vitest" />
import { defineConfig } from 'vite';

const banner = `/*!
* Margarita Form - https://github.com/margarita-form/margarita-form - MIT License - Created by Teemu Lahjalahti
*/`;

const footer = `window.createMargaritaForm = createMargaritaForm;`;

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/margarita-form-minified',
  build: {
    target: 'esnext',
    minify: 'esbuild',
    lib: {
      entry: 'src/index.ts',
      name: 'MargaritaForm',
      formats: ['es', 'umd', 'iife', 'cjs'],
      fileName: (format) => `margarita-form.${format}.js`,
    },
    rollupOptions: {
      output: {
        banner,
        footer,
      },
    },
  },
  esbuild: {
    minifyIdentifiers: false,
    minifySyntax: true,
    minifyWhitespace: true,
  },
});
