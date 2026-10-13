const { defineConfig } = require('vite');
module.exports = defineConfig({
  base: '/',
  build: { outDir: 'dist', assetsDir: 'assets' },
  server: { port: 5173 },
});
