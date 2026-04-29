# --- build stage ---
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund --no-progress

COPY . .
RUN npm run build:docker

# --- runtime stage ---
FROM nginx:alpine AS runtime

# Angular SPA + reverse-proxy config for /catalog-service, /basket-service, /ordering-service
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Angular's @angular/build:application emits a `browser` subfolder when SSR isn't configured.
# Copy whichever is present.
COPY --from=build /app/dist/angular-shop/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
