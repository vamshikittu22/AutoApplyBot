import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{ts,tsx,html}',
    './src/entrypoints/**/*.{ts,tsx,html}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
