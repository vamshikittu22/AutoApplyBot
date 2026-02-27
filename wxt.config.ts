import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  outDir: '.output',
  publicDir: 'public',
  manifest: {
    name: 'AutoApply Copilot',
    description: 'AI-powered job application assistant for ATS platforms',
    version: '0.1.0',
    permissions: ['activeTab', 'storage', 'declarativeContent'],
  },
  vite: () => ({
    resolve: {
      alias: {
        '@': '/src',
        '@@': '/',
      },
    },
  }),
});
