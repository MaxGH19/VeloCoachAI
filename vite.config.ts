import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Nutze './' für relative Pfade – das funktioniert auf Netlify UND GitHub Pages
  base: './', 
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  define: {
    // Vite nutzt import.meta.env, aber das hier hilft alten Libs
    'process.env': {} 
  }
})
