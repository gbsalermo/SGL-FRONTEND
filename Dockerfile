# =============================================================================
# sgl-web — imagem de produção (modelo do kit de produção do TIP:
# tip/infra/producao/modelos/web-vite-nginx).
#
# Build em dois estágios:
#   1. "builder": Node compila o front (vue-tsc + vite build) e gera a pasta dist/;
#   2. imagem final: só o Nginx, servindo os arquivos estáticos de dist/.
# =============================================================================
# O Vite 8 exige Node >= 20.19 (ver "engines" no package.json).
FROM node:22-alpine AS builder
WORKDIR /app
# package*.json antes do código: o "npm ci" fica em cache enquanto as dependências
# não mudarem.
COPY package*.json ./
RUN npm ci
COPY . .
# O front chama a API pelo mesmo endereço do site, em /api; o Nginx encaminha essas
# chamadas para o container do sgl-api (ver nginx.conf.template). Assim não há CORS.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# A imagem oficial do Nginx troca ${API_UPSTREAM} pelo valor do ambiente ao subir
# (arquivos em /etc/nginx/templates/*.template viram /etc/nginx/conf.d/*).
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
