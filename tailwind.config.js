/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#EEF4ED',
        surface: '#FFFFFF',
        'surface-subtle': '#F4F7F4',
        border: {
          DEFAULT: '#D8E2DC',
          subtle: '#EEF4ED',
          strong: '#8DA9C4',
        },
        nordic: {
          50: '#EEF4ED',
          100: '#E1EBE2',
          200: '#C7D9C9',
          300: '#A9C4B2',
          400: '#8DA9C4',
          500: '#6E92B3',
          600: '#4F759A',
          700: '#355B82',
          800: '#22446A',
          900: '#133054',
          950: '#0B1D35',
          mist: '#EEF4ED',
          ice: '#E1EBE2',
          blue: '#8DA9C4',
          glaucous: '#6E92B3',
          steel: '#355B82',
          navy: '#134074',
          midnight: '#0C131F',
          dark: '#0B2545',
        },
        primary: {
          DEFAULT: '#355B82', // Nordic steel
          hover: '#22446A',
          light: '#EEF4ED',
          active: '#133054',
          border: '#8DA9C4',
        },
        teal: {
          50: '#EEF4ED',
          100: '#E1EBE2',
          200: '#C7D9C9',
          300: '#A9C4B2',
          400: '#8DA9C4',
          500: '#6E92B3',
          600: '#4F759A',
          700: '#355B82',
          800: '#22446A',
          900: '#133054',
          950: '#0B1D35',
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
