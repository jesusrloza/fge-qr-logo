import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  // server is used if you ever run vite dev locally
  server: {
    host: '0.0.0.0',
    port: 4173,
    // Optional, only needed if you run `vite dev` through Cloudflare
    allowedHosts: ['qr.dgtipeautomations.work'],
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['qr.dgtipeautomations.work'],
  },
})
