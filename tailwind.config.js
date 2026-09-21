/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        'pixel-alt': ['"VT323"', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        cozy: {
          dark: '#1e1b2e',
          night: '#151320',
          card: '#28243d',
          accent: '#ff80bf',
          yellow: '#fcd34d',
          cream: '#fffdfa',
          lavender: '#e0e7ff',
          matcha: '#bbf7d0',
          peach: '#fed7aa',
          mint: '#99f6e4',
          sky: '#bae6fd',
        }
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0,0,0,0.85)',
        'pixel-sm': '2px 2px 0px 0px rgba(0,0,0,0.85)',
        'pixel-lg': '6px 6px 0px 0px rgba(0,0,0,0.85)',
        'pixel-white': '4px 4px 0px 0px rgba(255,255,255,0.85)',
        'pixel-purple': '4px 4px 0px 0px #7c3aed',
        'pixel-pink': '4px 4px 0px 0px #ec4899',
      }
    },
  },
  plugins: [],
}
