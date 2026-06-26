import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// On GitHub Pages the app is served from /<repo>/, so production needs that base path.
// Local dev stays at / so `npm run dev` works normally.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/squad-builder/' : '/',
  plugins: [react(), tailwindcss()],
}))
