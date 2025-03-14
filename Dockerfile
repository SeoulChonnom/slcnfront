FROM node:20.18-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM nginx:latest AS production-stage
RUN mkdir /app
COPY --from=build-stage /app/docs /app
COPY nginx.conf /etc/nginx/nginx.conf