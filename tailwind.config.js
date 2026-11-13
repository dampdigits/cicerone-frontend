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
        // Dark and Light shades of Navy Blue for accent
        navy: {
          950: '#050c18', // Deepest midnight navy
          900: '#0a1628', // Dark navy surface
          850: '#0e1f38', // Dark navy card
          800: '#142a4d', // Dark navy border
          700: '#1d3e6f', // Medium navy
          600: '#1e40af', // Royal navy
          500: '#2563eb', // Pure navy blue
          400: '#3b82f6', // Light navy
          300: '#60a5fa', // Bright light navy
          200: '#93c5fd', // Soft light navy
          100: '#dbeafe',
          50: '#eff6ff',
        },
        // Alias brand to navy for seamless accent alignment
        brand: {
          950: '#050c18',
          900: '#0a1628',
          850: '#0e1f38',
          800: '#142a4d',
          700: '#1d3e6f',
          600: '#1e40af',
          500: '#2563eb',
          400: '#3b82f6',
          300: '#60a5fa',
          200: '#93c5fd',
          100: '#dbeafe',
          50: '#eff6ff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
