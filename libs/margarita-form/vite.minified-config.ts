/// <reference types="vitest" />
import { defineConfig } from 'vite';

const banner = `/* Margarita Form - https://github.com/margarita-form/margarita-form - MIT License - Created by Teemu Lahjalahti */`;

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/margarita-form-minified',
  build: {
    target: 'esnext',
    minify: 'esbuild',
    lib: {
      entry: 'src/index.ts',
      name: 'MargaritaForm',
      formats: ['es', 'iife'],
      fileName: (format) => {
        if (format === 'es') {
          return 'margarita-form.module.js';
        }
        return 'margarita-form.min.js';
      },
    },
    rollupOptions: {
      output: {
        banner,
      },
    },
  },
  esbuild: {
    minifyIdentifiers: false,
    minifySyntax: true,
    minifyWhitespace: true,
  },
});
