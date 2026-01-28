import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/VeloCoachAI/', // WICHTIG: Muss exakt deinem GitHub-Repo-Namen entsprechen
})
