import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  server: {
    // Same-origin requests in dev: no CORS, and it works on whatever port Vite picks.
    proxy: { '/api': process.env.VITE_PROXY_TARGET ?? 'http://localhost:3000' },
  },
})
