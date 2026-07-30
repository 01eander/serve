/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          900: '#4c1d95',
        },
        surface: {
          light: '#f8fafc',
          dark: '#0f172a',
          glass: 'rgba(15, 23, 42, 0.7)',
          'glass-light': 'rgba(255, 255, 255, 0.05)',
          gray: '#e2e8f0'
        },
        accent: {
          DEFAULT: '#10b981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
