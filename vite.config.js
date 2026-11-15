import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // 👇 In dev: use localhost. In prod/preview: use the deployed backend.
  const BACKEND_URL =
    mode === 'production'
      ? (env.VITE_API_URL || "https://feed-vqqt.onrender.com")
      : "http://localhost:3000";

  console.log(`🔌 [vite] proxy backend → ${BACKEND_URL}`);

  return {
    plugins: [react(), tailwindcss()],

    server: {
      port: 5173,
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
    },

    preview: {
      host: '0.0.0.0',
      port: process.env.PORT || 4173,
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
  };
});