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
        ntb: {
          dark: '#1e293b',       // slate-800
          sidebar: '#0e1726',    // dark slate navy from screenshots
          sidebarActive: '#1b2e4b', // active item background
          sidebarHover: '#192a45',  // hover item background
          header: '#1a2332',     // header background
          primary: '#1e3a8a',    // deep dark blue for table header
          yellow: '#f5b041',     // yellow action buttons
          yellowHover: '#f39c12',
          border: '#e2e8f0',     // light border
        }
      }
    },
  },
  plugins: [],
}
