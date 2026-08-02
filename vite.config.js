import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use /partracker/ for GitHub Pages, root / for APK and local dev
  base: mode === 'production' ? '/partracker/' : '/',
  build: { outDir: 'dist' }
}))
