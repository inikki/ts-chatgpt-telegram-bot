FROM --platform=linux/amd64 node:21-alpine as builder
# ENV NODE_ENV="production"

COPY . /app
WORKDIR /app

RUN npm install 
RUN npm run build

FROM --platform=linux/amd64 node:21-alpine
ENV NODE_ENV="production"
COPY --from=builder /app /app
WORKDIR /app
ENV PORT 8080
EXPOSE 8080

CMD ["npm", "start"]