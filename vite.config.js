// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server:
    command === "serve"
      ? {
          host: "0.0.0.0",
          port: 5173,
          hmr: {
            protocol: "wss",
            host: "starship3.ing.uc.cl",
            port: 443,
            clientPort: 443,
          },
          proxy: {
            "/api": {
              target: "http://localhost:8000/",
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : {
          // al hacer vite build no habrá dev-server ni HMR
          hmr: false,
        },
}));
