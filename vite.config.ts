import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Ensures relative asset paths work seamlessly on GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
