FROM node:16-alpine as build
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm ci --ignore-scripts
ENV NODE_ENV production
COPY ./tsconfig.json .
COPY ./src ./src
RUN npm run build

FROM node:18.8.0-alpine
WORKDIR /app
COPY ./package.json ./package-lock.json ./
ENV NODE_ENV production
RUN npm ci --production --ignore-scripts
COPY --from=build /app/build ./build
CMD [ "node", "./build/index.js" ]
