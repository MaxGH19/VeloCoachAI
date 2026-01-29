
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Stellt sicher, dass process.env.API_KEY im Browser-Code verfügbar ist
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  server: {
    port: 3000,
  },
  base: './',
  build: {
    outDir: 'dist',
  }
})
