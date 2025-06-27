import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000, // Increase the chunk size warning limit (in kB)
    rollupOptions: {
      output: {
        // Use a simpler chunking strategy that's less likely to cause issues
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Put all React and related packages in one chunk
            if (id.includes('react') || id.includes('jsx-runtime')) {
              return 'vendor-react';
            }

            // Put all other dependencies in another chunk
            return 'vendor-deps';
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    historyApiFallback: true, // Enable SPA routing
    proxy: {
      // For local development, proxy API requests to the backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
