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
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        tech: {
          bg: '#0a0d14',
          card: 'rgba(22, 30, 49, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(30, 41, 67, 0.85)',
          cyan: '#06b6d4',
          blue: '#3b82f6',
          purple: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 25px rgba(6, 182, 212, 0.25)',
        'glow-lg': '0 0 35px rgba(6, 182, 212, 0.4)',
      },
      backgroundImage: {
        'tech-gradient': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
      }
    },
  },
  plugins: [],
}
