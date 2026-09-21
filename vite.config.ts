import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  base: isGitHubPages ? '/studyflow/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
});
