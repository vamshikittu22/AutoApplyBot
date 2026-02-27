import { defineConfig } from 'vite';
import path from 'path';

/**
 * Vite config for the standalone test harness.
 *
 * We bypass @vitejs/plugin-react and rely on Vite's built-in esbuild
 * JSX transform (React 17+ automatic runtime).
 *
 * Tailwind CSS v4 @import syntax is handled by the PostCSS plugin
 * already in the root node_modules.
 */
export default defineConfig({
  root: '.',

  plugins: [],

  esbuild: {
    // Use the React 17 automatic JSX runtime — no import needed in every file
    jsx: 'automatic',
    jsxImportSource: 'react',
  },

  css: {
    postcss: path.resolve(__dirname, '../postcss.config.js'),
  },

  resolve: {
    alias: {
      // Mirror WXT's @/ alias so every src/ import works unchanged
      '@': path.resolve(__dirname, '../src'),
      '@@': path.resolve(__dirname, '..'),
    },
  },

  server: {
    port: 5173,
    open: true,
  },

  build: {
    outDir: 'dist',
  },
});
