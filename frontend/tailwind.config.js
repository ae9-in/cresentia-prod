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
        brand: '#6366f1',
        surface: '#ffffff',
        bg: '#f8f9fa',
        text: '#1a1a1a',
        muted: '#6b7280',
        border: '#e5e7eb',
      },
    },
  },
  plugins: [],
}
