/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#f9fafb',
        'muted-foreground': '#6b7280',
        input: '#d1d5db',
        card: '#ffffff',
        'card-foreground': '#111827',
        primary: '#3b82f6',
        'primary-foreground': '#ffffff',
        destructive: '#ef4444'
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
