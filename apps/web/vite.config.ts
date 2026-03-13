import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Aetherium/', // Nome do repositório para GitHub Pages
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/features/criador-de-poder/')) {
            return 'feature-criador-poder';
          }

          if (id.includes('/src/features/criador-de-item/')) {
            return 'feature-criador-item';
          }

          if (id.includes('/src/features/gerenciador-criaturas/')) {
            return 'feature-criaturas';
          }

          if (id.includes('/src/pages/')) {
            const pageMatch = id.match(/\/src\/pages\/([^/]+)\.(t|j)sx?$/);
            if (pageMatch?.[1]) {
              return `page-${pageMatch[1].toLowerCase()}`;
            }

            return 'app-pages';
          }

          if (id.includes('/src/shared/')) {
            return 'app-shared';
          }

          if (id.includes('/src/context/')) {
            return 'app-context';
          }

          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('reactflow')) {
            return 'vendor-reactflow';
          }

          if (id.includes('react-markdown')) {
            return 'vendor-markdown';
          }

          if (id.includes('react-router')) {
            return 'vendor-router';
          }

          if (id.includes('react-dom') || id.includes('/react/')) {
            return 'vendor-react';
          }

          if (id.includes('axios') || id.includes('zod')) {
            return 'vendor-utils';
          }

          return 'vendor';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
