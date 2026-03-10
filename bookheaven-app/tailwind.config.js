/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cream: '#F5F0E8',
          gold: '#C49A6C',
          'gold-dark': '#A67C52',
          dark: '#1C1C1C',
          charcoal: '#2D2A26',
          text: '#333333',
          'text-light': '#6B6B6B',
          border: '#E5DED3',
          bg: '#FDFBF7',
          'bg-alt': '#F8F4EE',
          success: '#4A7C59',
          error: '#C25450',
          'error-light': '#FEF2F2',
          'success-light': '#F0FDF4',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
