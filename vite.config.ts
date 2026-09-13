import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      // python-service/venv alone has 37k+ files (not node_modules, so
      // chokidar doesn't ignore it by default) — without excluding it, the
      // dev server binds its port but never becomes responsive.
      watch: process.env.DISABLE_HMR === 'true' ? null : { ignored: ['**/python-service/**', '**/supabase/**'] },
      proxy: {
        '/api': 'http://localhost:8787',
      },
    },
  };
});
