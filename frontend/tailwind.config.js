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
        uhi: {
          bg: '#07111F',
          surface: '#0D1828',
          surface2: '#111F31',
          surface3: '#17283E',
          border: '#1B2C42',
          borderLight: '#263B55',
          cyan: '#00D2FF',
          blue: '#38BDF8',
          green: '#10B981',
          red: '#EF4444',
          orange: '#F97316',
          yellow: '#F59E0B',
          purple: '#A855F7',
          muted: '#8B9BB0',
          text: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      }
    },
  },
  plugins: [],
}
