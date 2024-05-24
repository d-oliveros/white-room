FROM node:16.10.0-buster

# Maintainer
# LABEL maintainer="White Room Engineering Squad<engineering@whiteroom.com>"

# Enable build arguments
ARG NODE_ENV="development"
ARG COMMIT_HASH=""
ARG AWS_ACCESS_KEY=""
ARG AWS_SECRET_KEY=""

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY ./package.json /app
COPY ./package-lock.json /app
RUN npm install --dev --no-save

# Bundle app source
COPY . /app

# Build and optimize react app
RUN npm run build

# Upload bundle files to CDN and delete bundles locally
RUN npm run upload-bundles

# Expose Node port
EXPOSE 3000

# Start the app
CMD [ "./ops/docker-init.sh"]