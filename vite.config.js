import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import tailwind from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    // tailwind(),     // inyecta Tailwind y autoprefixer
    react(), // tu plugin de React
  ],
  server: {
    host: true,  // allow external access (important for nginx proxying)
    port: 5173,
  },
});