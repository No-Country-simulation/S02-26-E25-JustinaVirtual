# Estágio 1: Build (Compilação do React/Vite)
FROM node:20-alpine as build
WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package.json package-lock.json* ./
RUN npm install

# Copia o resto do código do frontend
COPY . .

# Roda o build do Vite (gera a pasta /app/dist)
RUN npm run build

# Estágio 2: Servidor Web (Nginx)
FROM nginx:alpine

# Limpa a pasta padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos compilados do Estágio 1 para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração customizada do Nginx para suportar o React Router (SPA)
RUN echo $'server {\n\
    listen 80;\n\
    location / {\n\
    root /usr/share/nginx/html;\n\
    index index.html index.htm;\n\
    try_files $uri $uri/ /index.html;\n\
    }\n\
    }' > /etc/nginx/conf.d/default.conf

# Expõe a porta 80 (que mapeamos no docker-compose para a 3000)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]