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
        workbench: {
          canvas: 'var(--bg-canvas)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          border: 'var(--border-subtle)',
          borderStrong: 'var(--border-strong)',
          text: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          accent: 'var(--accent-primary)',
          accentSubtle: 'var(--accent-subtle)',
          heating: '#D94E34',
          cooling: '#0D9488',
        },
        // Mapped to semantic Dual-Theme variables so legacy components transition seamlessly
        uhi: {
          bg: 'var(--bg-canvas)',
          surface: 'var(--bg-surface)',
          surface2: 'var(--bg-elevated)',
          surface3: 'var(--bg-elevated)',
          border: 'var(--border-subtle)',
          borderLight: 'var(--border-strong)',
          cyan: 'var(--accent-primary)',
          blue: '#0D9488',
          green: '#0D9488',
          red: '#D94E34',
          orange: '#E06D3B',
          yellow: '#D97706',
          purple: '#8C4A32',
          muted: 'var(--text-secondary)',
          text: 'var(--text-primary)',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Menlo', 'Consolas', 'monospace'],
        serif: ['"IBM Plex Serif"', 'Georgia', ' Cambria', 'serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        floating: 'var(--shadow-floating)',
      },
    },
  },
  plugins: [],
}
