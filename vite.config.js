// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import tailwind from "@tailwindcss/vite";

// para probar la api a nivel en el servidor, debe cambiar de target a la url del backend en el servidor

// export default defineConfig({
//   plugins: [
//     // tailwind(),     // inyecta Tailwind y autoprefixer
//     react(), // tu plugin de React
//   ],
//   server: {
//     proxy: {
//       "/api": {
//         target: "https://proyecto-g3-ti-1.onrender.com",
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// });

// para probar la api a nivel local, usar el siguiente código:
// si es necesario cambiar el puerteo, cambiar el 8000 por el que se va a utilizar:
// vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // apunta todas las rutas /api al backend FastAPI
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        // opcional: reescribe la ruta si tu backend no usa el prefijo /api
        // rewrite: (path) => path.replace(/^\/api/, "")
      },
    },
  },
});
