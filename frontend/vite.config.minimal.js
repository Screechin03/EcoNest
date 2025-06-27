import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Minimal Vite configuration with no manual chunking
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        sourcemap: false,
        chunkSizeWarningLimit: 1500
    },
    server: {
        port: 5173,
        historyApiFallback: true, // Add history API fallback for SPA routing
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true
            }
        }
    },
    preview: {
        port: 5173,
        historyApiFallback: true // Also add for preview server
    }
})
