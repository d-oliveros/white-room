#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Default values for arguments
CONTAINER_NAME="testing-container"
IMAGE_NAME="testing"
HOST_PORT=3000
CONTAINER_PORT=3000
NODE_ENV="production"
DOCKER_RUN_OPTIONS=""

# Parse command-line arguments (if any)
while getopts c:i:h:p:e:o: flag
do
    case "${flag}" in
        c) CONTAINER_NAME=${OPTARG};;
        i) IMAGE_NAME=${OPTARG};;
        h) HOST_PORT=${OPTARG};;
        p) CONTAINER_PORT=${OPTARG};;
        e) NODE_ENV=${OPTARG};;
        o) DOCKER_RUN_OPTIONS=${OPTARG};;
    esac
done

# Check if the host port is already in use
if lsof -iTCP:$HOST_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "Error: Port $HOST_PORT is already in use."
    exit 1
fi

# Check if the container is already running and stop/remove it if it is
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Stopping and removing existing container: $CONTAINER_NAME"
    docker stop $CONTAINER_NAME
    docker rm -f $CONTAINER_NAME
elif [ "$(docker ps -a -q -f name=$CONTAINER_NAME)" ]; then
    echo "Removing previously stopped container: $CONTAINER_NAME"
    docker rm -f $CONTAINER_NAME
fi

# Run the Docker container
echo "Starting Docker container..."
docker run -d --rm \
    --name $CONTAINER_NAME \
    -p $HOST_PORT:$CONTAINER_PORT \
    -p $HOST_POSTGRES_PORT:5432 \
    -p $HOST_REDIS_PORT:6379 \
    -e NODE_ENV=$NODE_ENV \
    -e REDIS_HOST=host.docker.internal \
    -e POSTGRES_HOST=host.docker.internal \
    -e ENABLE_MIGRATIONS=false \
    $DOCKER_RUN_OPTIONS \
    $IMAGE_NAME

# Check if the container started successfully
if [ $? -eq 0 ]; then
    echo "Docker container $CONTAINER_NAME is running."
    echo "Access it via http://localhost:$HOST_PORT"
else
    echo "Failed to start Docker container."
    exit 1
fi
