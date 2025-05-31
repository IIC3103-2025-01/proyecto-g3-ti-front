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
          // Configuración HMR simplificada para desarrollo local
          hmr: true,
          proxy: {
            "/api": {
              target: "https://starship3.ing.uc.cl",
              changeOrigin: true,
              secure: true,
            },
          },
        }
      : {
          // al hacer `vite build` no habrá dev-server ni HMR
          hmr: false,
        },
}));

// para probar la api a nivel local, usar el siguiente código:
// si es necesario cambiar el puerteo, cambiar el 8000 por el que se va a utilizar:
// vite.config.js

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       // apunta todas las rutas /api al backend FastAPI
//       "/api": {
//         target: "http://localhost:8000",
//         changeOrigin: true,
//         secure: false,
//         // opcional: reescribe la ruta si tu backend no usa el prefijo /api
//         // rewrite: (path) => path.replace(/^\/api/, "")
//       },
//     },
//   },
// });
