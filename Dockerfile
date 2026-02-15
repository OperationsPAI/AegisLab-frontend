FROM node:20-alpine AS builder

RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g pnpm@9.15.3

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./

RUN --mount=type=secret,id=NPM_TOKEN \
    export NPM_TOKEN=$(cat /run/secrets/NPM_TOKEN) && \
    pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm run build

FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80