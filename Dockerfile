# 1. Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# 1.1 Copia solo package*.json y lockfile, cachea dependencias
COPY package*.json ./
RUN npm ci

# 1.2 Copia el resto del código y build de Vite
COPY . .
COPY .env .env 
RUN npm run build

# 2. Production stage: servir con nginx
FROM nginx:stable-alpine

# 2.1 Copia tu configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 2.2 Copia el build de Vite al directorio que nginx sirve
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
