import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@fullcalendar')) {
            return 'fullcalendar';
          }

          if (id.includes('node_modules')) {
            return 'vendor';
          }

          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    mockReset: true,
    exclude: ['**/node_modules/**', '**/e2e/**', '**/.worktrees/**'],
  },
  server: {
    proxy: {
      /* The one place the local backend's address is written down. `pnpm dev`
         serves VITE_API_URL=/api (.env.development), so the browser calls the
         dev server same-origin and this forwards it on. The backend mounts its
         own API under /api, so the prefix is passed through rather than
         rewritten away. Port 9090 is where the local container listens; the
         8080 in docs/api_spec.json and docs/*.md describes a different
         environment and is not what dev runs against. */
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
