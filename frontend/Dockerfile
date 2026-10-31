# ==========================================
# Zerp Pixels CRM - Frontend Dockerfile (Angular 18+)
# Multi-stage build with Nginx reverse proxy
# ==========================================

# Stage 1: Build Angular App
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency specifications
COPY package*.json ./
RUN npm ci || npm install

# Copy application code and build for production
COPY . .
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine AS final

# Install curl for container healthchecks
RUN apk add --no-cache curl

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx html directory
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

