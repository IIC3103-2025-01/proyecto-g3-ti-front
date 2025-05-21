import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import tailwind from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    // tailwind(),     // inyecta Tailwind y autoprefixer
    react(), // tu plugin de React
  ],
  server: {
    host: true, // allow external access (important for nginx proxying)
    port: 5173,
    allowedHosts: ["starship3.ing.uc.cl"],
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
