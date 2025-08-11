import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'https://localhost:7282' 

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})