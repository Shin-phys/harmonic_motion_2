import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: https://shin-phys.github.io/harmonic_motion/
export default defineConfig({
  plugins: [react()],
  base: '/harmonic_motion/',
})
