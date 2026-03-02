# Estágio de Build
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio de Produção (Nginx)
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Nota: Se o seu comando de build gera a pasta 'build' em vez de 'dist', troque acima
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]