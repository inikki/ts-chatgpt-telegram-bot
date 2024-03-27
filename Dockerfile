# First Stage
FROM --platform=linux/amd64 node:21-alpine as builder
# ENV NODE_ENV="production"

COPY package.json package-lock.json /app/
WORKDIR /app

# Install dependencies
RUN npm install 

# Copy the rest of the application code
COPY . .

# Build application
RUN npm run build

# Second Stage
FROM --platform=linux/amd64 node:21-alpine
ENV NODE_ENV="production"

# Copy the built application from the previous stage
COPY --from=builder /app /app
WORKDIR /app

ENV PORT 8080
EXPOSE 8080

CMD ["npm", "start"]
