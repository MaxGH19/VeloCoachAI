
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // WICHTIG: Erlaubt den Zugriff auf process.env.API_KEY im Browser
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  base: './', 
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})
