import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { createServer as createApiServer, initializeServer } from './server/index'

export default defineConfig({
  // Support deployment to a subpath (e.g., /fge-qr-logo/)
  // Set VITE_BASE_URL environment variable to configure (e.g., VITE_BASE_URL=/fge-qr-logo/)
  base: process.env.VITE_BASE_URL || '/',
  plugins: [
    react(),
    {
      name: 'api-server',
      configureServer(server) {
        // Initialize logging and cache
        initializeServer()

        // Create Express app with API routes
        const apiApp = createApiServer()

        // Mount Express app as Vite middleware
        server.middlewares.use(apiApp)
      },
    },
  ],
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
