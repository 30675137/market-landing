# syntax=docker/dockerfile:1

# ---------- build stage: 构建两个 Vite 应用 ----------
FROM node:20-alpine AS build
# 国内构建可传 --build-arg NPM_REGISTRY=https://registry.npmmirror.com 加速
ARG NPM_REGISTRY=https://registry.npmjs.org
WORKDIR /app
COPY . .
RUN npm config set registry "$NPM_REGISTRY" \
 && (cd pages/ecommerce-ai && npm install --no-audit --no-fund && npm run build) \
 && (cd pages/ai-consultant && npm install --no-audit --no-fund && npm run build) \
 && mkdir -p /site/ecommerce-ai /site/ai-consultant \
 && cp -r pages/ecommerce-ai/dist/* /site/ecommerce-ai/ \
 && cp -r pages/ai-consultant/dist/* /site/ai-consultant/ \
 && cp deploy/index.html /site/index.html

# ---------- serve stage: nginx 托管静态产物 ----------
FROM nginx:alpine
COPY --from=build /site /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
