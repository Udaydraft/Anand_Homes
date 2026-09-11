/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-elevated': '#F1F5F9',
        'surface-border': '#E2E8F0',
        brand: {
          dark: '#072417',
          sidebar: '#0A3925',
          sidebarHover: '#104930',
          sidebarActive: '#135337',
          primary: '#0D5C3A',
          light: '#E8F5E9',
          gold: '#C99700',
        },
        primary: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
      },
    },
  },
  plugins: [],
}
