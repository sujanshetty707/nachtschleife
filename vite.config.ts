import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@chapters': path.resolve(__dirname, 'src/chapters'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@audio': path.resolve(__dirname, 'src/audio'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types-ns': path.resolve(__dirname, 'src/types'),
    },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          postprocessing: ['postprocessing'],
          'troika-text': ['troika-three-text'],
          lenis: ['lenis'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['three', 'gsap', 'lenis', 'detect-gpu', 'postprocessing'],
  },
  server: {
    port: 3000,
    headers: {
      // Allow SharedArrayBuffer for KTX2 transcoding worker
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
