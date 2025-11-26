import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { createServer as createApiServer, initializeServer } from './server/index'

export default defineConfig({
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
