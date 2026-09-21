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
        eraser: {
          bg: '#0F1117',
          panel: '#181B23',
          border: '#282D3D',
          hover: '#2A3042',
          text: '#ECEFF4',
          muted: '#8F9BB3',
          accent: '#6366F1',
          accentHover: '#4F46E5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        hand: ['Caveat', 'Comic Sans MS', 'cursive'],
      }
    },
  },
  plugins: [],
}
