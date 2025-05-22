// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      protocol: "wss",
      host: "starship3.ing.uc.cl",
      port: 443,
      clientPort: 443,
    },
  proxy: {
      // Cualquier llamada a /api/* se redirige a tu backend
      '/api': {
        target: 'http://localhost:8000',  // ajusta al host/puerto de tu API
        changeOrigin: true,
        secure: false,
        // si tus endpoints usan WebSockets, descomenta:
        // ws: true,
        // (opcional) reescribe la ruta si tu backend no usa el prefijo
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
  }
}
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
