import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// API target can be configured via environment variable
// Default: http://localhost:4010 (Prism proxy for dev)
// For E2E: http://localhost:3001 (direct to backend)
const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:4010'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true
      }
    }
  }
})
