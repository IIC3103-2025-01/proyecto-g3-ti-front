import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwind(),     // inyecta Tailwind y autoprefixer
    react(),        // tu plugin de React
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://proyecto-g3-ti-1.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
