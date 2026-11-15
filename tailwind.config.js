/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FBFBFA',
        surface: '#FFFFFF',
        'surface-subtle': '#F8F9FA',
        border: {
          DEFAULT: '#E2E8F0',
          subtle: '#EEF2F6',
          strong: '#CBD5E1',
        },
        primary: {
          DEFAULT: '#0F766E', // Deep teal
          hover: '#0D6861',
          light: '#F0FDFA',
          active: '#115E59',
          border: '#CCFBF1',
        },
        slate: {
          850: '#151F30',
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '8px',
        lg: '10px',
      },
      boxShadow: {
        subtle: 'none',
        card: 'none',
        modal: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      }
    },
  },
  plugins: [],
}
