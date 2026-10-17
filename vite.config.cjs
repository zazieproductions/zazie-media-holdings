const { defineConfig } = require('vite');
const fs = require('node:fs');
const path = require('node:path');
const { resolve } = path;

// The prototype uses a classic global script for its many inline event handlers.
// Vite intentionally does not bundle that script; emit it at the same URL used by index.html.
const emitClassicAppScript = {
  name: 'emit-classic-app-script',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'src/app.js',
      source: fs.readFileSync(path.join(__dirname, 'src', 'app.js'), 'utf8'),
    });
  },
};

module.exports = defineConfig({
  base: '/',
  plugins: [emitClassicAppScript],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        repo: resolve(__dirname, 'repo.html'),
        prototypes: resolve(__dirname, 'prototypes.html'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.e2b.app'],
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: ['.e2b.app'],
  },
});
