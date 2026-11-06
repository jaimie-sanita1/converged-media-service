FROM node:24.22.2-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:24.22.2-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000

CMD ["node", "dist/index.js"]
