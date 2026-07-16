/** @type {import('tailwindcss').Config} */
module.exports = {
  // Ativa o suporte para dark mode baseado em classe CSS no elemento <html>
  darkMode: 'class',
  // Indica ao Tailwind onde procurar classes para otimizar o tamanho final do CSS
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        // Cores personalizadas da marca
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        }
      }
    }
  },
  plugins: [],
}