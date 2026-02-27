import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{ts,tsx,html}',
    './src/entrypoints/**/*.{ts,tsx,html}',
    './test-web/src/**/*.{ts,tsx,html}',
  ],
  theme: {
    extend: {
      // ── UI/UX Pro Max Design System — AutoApply Copilot ────────
      // Minimalism & Swiss Style | Primary: #0369A1
      colors: {
        brand: {
          DEFAULT: '#0369A1',  // primary
          light:   '#0EA5E9',  // secondary / hover
          dark:    '#075985',  // pressed state
          cta:     '#22C55E',  // success / CTA green
          bg:      '#F0F9FF',  // page background
          surface: '#FFFFFF',  // card background
          border:  '#BAE6FD',  // border colour
          text:    '#0C4A6E',  // heading / body text
          muted:   '#475569',  // secondary text
          subtle:  '#94A3B8',  // placeholder / disabled
        },
        // Status colours
        status: {
          applied:   '#1E40AF',
          interview: '#854D0E',
          offer:     '#166534',
          rejected:  '#991B1B',
          withdrawn: '#475569',
        },
      },
      // Background colours for status badges
      backgroundColor: {
        'status-applied':   '#DBEAFE',
        'status-interview': '#FEF9C3',
        'status-offer':     '#DCFCE7',
        'status-rejected':  '#FEE2E2',
        'status-withdrawn': '#F1F5F9',
        'platform-workday':    '#EDE9FE',
        'platform-greenhouse': '#DCFCE7',
        'platform-lever':      '#DBEAFE',
        'platform-unknown':    '#F1F5F9',
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont',
          'Segoe UI', 'sans-serif',
        ],
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '16px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
} satisfies Config;
