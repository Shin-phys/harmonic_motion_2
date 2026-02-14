/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'primary-dark': '#2563EB',
        'primary-light': '#60A5FA',
        accent: '#F59E0B',
        'accent-red': '#EF4444',
        'accent-green': '#10B981',
        surface: '#1E293B',
        'surface-light': '#334155',
        'surface-dark': '#0F172A',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
