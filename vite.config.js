// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,

    // 1) DESACTIVA HMR para que no intente abrir ningún websocket
    hmr: false,

    // 2) Proxy para tus endpoints /api en desarrollo
    proxy: {
      "/api": {
        target: "http://localhost:8000", // ajusta al host/puerto de tu backend
        changeOrigin: true,
        secure: false,
        // si tu backend no usa el prefijo /api, podrías descomentar:
        // rewrite: (path) => path.replace(/^\/api/, "")
      },
    },
  },
});


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
