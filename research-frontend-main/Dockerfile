# Stage 1: Build Angular frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY research-frontend-main/package*.json ./
RUN npm install
COPY research-frontend-main/ .
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/research-frontend/browser /usr/share/nginx/html
COPY research-frontend-main/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
