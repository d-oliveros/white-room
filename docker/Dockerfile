FROM node:22.6.0-alpine3.19 AS base

ARG NODE_ENV="production"
ARG COMMIT_HASH=""
ARG AWS_ACCESS_KEY=""
ARG AWS_SECRET_KEY=""

ENV NODE_ENV=production

# Install dependencies stage
FROM base AS deps

RUN mkdir -p /app-build
WORKDIR /app-build

COPY ./package.json ./package-lock.json /app-build/
RUN npm install --no-save --include=dev

# Builder stage for compiling the application
FROM base AS builder

RUN mkdir -p /app-build
WORKDIR /app-build

# Copy dependencies from deps stage
COPY --from=deps /app-build/node_modules /app-build/node_modules

# Bundle app source
COPY . /app-build

# Build app
RUN ./build.sh --copy-assets=false --prune --skip-install

# Runner stage for serving the application
FROM node:22.6.0-alpine3.19 AS runner

COPY --from=builder /app-build/build /app
WORKDIR /app

# Expose Node port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "serve"]
