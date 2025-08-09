import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Troque pela URL do seu backend .NET
const BACKEND = 'https://localhost:7282' // ou http://localhost:5164

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        secure: false, // para aceitar HTTPS local com certificado self-signed
      },
    },
  },
})
