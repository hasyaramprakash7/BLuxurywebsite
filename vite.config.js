import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The full URL of your backend, used by the proxy.
const BACKEND_URL = "https://bluxurybackend.onrender.com";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  
  // -----------------------------------------------------------------
  // 1. DEVELOPMENT SERVER CONFIG (`npm run dev`)
  // Used for local development (localhost).
  // -----------------------------------------------------------------
  server: {
    // Port 5173 is the default, but explicitly setting it is fine.
    port: 5173, 
    
    // Proxy configuration for local development.
    // Requests to /api are sent to the production backend.
    proxy: {
      "/api": BACKEND_URL,
    },
    
    // IMPORTANT for Render/remote dev environments: 
    // Bind to all interfaces (0.0.0.0) if you ever use a remote development setup.
    // host: '0.0.0.0', 
  },

  // -----------------------------------------------------------------
  // 2. PRODUCTION PREVIEW CONFIG (`npm run start` or `vite preview`)
  // Used for serving the *built* app (the `dist` folder) in production/staging.
  // -----------------------------------------------------------------
  preview: {
    // Bind to 0.0.0.0 to listen on all interfaces, which is required by Render.
    host: '0.0.0.0', 
    
    // Render provides the port via the $PORT environment variable.
    // We use process.env.PORT to read it.
    port: process.env.PORT || 4173, 
    
    // 👇👇👇 SOLUTION: Add the production host to the allowed list 👇👇👇
    allowedHosts: [
      'bluxurywebsite.onrender.com', // The specific production URL
      '*.onrender.com'               // To cover any other Render subdomains/previews
    ],
  },
});