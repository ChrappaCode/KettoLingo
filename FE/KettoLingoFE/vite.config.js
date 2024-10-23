import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.KETTO_BE || 'http://127.0.0.1:5000',  // Flask backend server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),  // Optional rewrite rule
      },
    },
  },
  plugins: [react()],
})
