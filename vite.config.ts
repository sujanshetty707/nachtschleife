import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@core': `${import.meta.dirname}/src/core`,
      '@chapters': `${import.meta.dirname}/src/chapters`,
      '@routes': `${import.meta.dirname}/src/routes`,
      '@audio': `${import.meta.dirname}/src/audio`,
      '@ui': `${import.meta.dirname}/src/ui`,
      '@utils': `${import.meta.dirname}/src/utils`,
      '@types-ns': `${import.meta.dirname}/src/types`,
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
