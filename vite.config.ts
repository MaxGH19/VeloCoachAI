
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Vite ersetzt process.env.API_KEY im Browser-Bundle
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ""),
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
