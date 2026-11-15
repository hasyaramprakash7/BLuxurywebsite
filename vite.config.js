import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const BACKEND_URL = process.env.VITE_API_URL || "https://feed-vqqt.onrender.com";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // -----------------------------------------------------------------
  // 1. DEVELOPMENT SERVER CONFIG (`npm run dev`)
  // -----------------------------------------------------------------
  server: {
    port: 5173,

    proxy: {
      // REST API
      "/api": {
        target: BACKEND_URL,
        changeOrigin: true,
      },

      // Uploaded files served by the backend
      "/uploads": {
        target: BACKEND_URL,
        changeOrigin: true,
      },

      // ✅ Socket.IO — ws:true is REQUIRED for the WebSocket upgrade
      "/socket.io": {
        target: BACKEND_URL,
        ws: true,
        changeOrigin: true,
      },
    },
  },

  // -----------------------------------------------------------------
  // 2. PRODUCTION PREVIEW CONFIG (`npm run start` or `vite preview`)
  // -----------------------------------------------------------------
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 4173,

    // Same proxy rules for preview so the built app can reach the backend
    proxy: {
      "/api": {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      "/uploads": {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      "/socket.io": {
        target: BACKEND_URL,
        ws: true,
        changeOrigin: true,
      },
    },

    allowedHosts: [
      'bluxurywebsite.onrender.com',
      '*.onrender.com',
    ],
  },
});