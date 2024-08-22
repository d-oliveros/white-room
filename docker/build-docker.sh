#!/bin/bash

# Set default values for arguments
NODE_ENV="production"
IMAGE_NAME="testing"
DOCKERFILE_PATH="./docker/Dockerfile"

# Parse command-line arguments (if any)
while getopts e:i:d: flag
do
    case "${flag}" in
        e) NODE_ENV=${OPTARG};;
        i) IMAGE_NAME=${OPTARG};;
        d) DOCKERFILE_PATH=${OPTARG};;
    esac
done

# Print the build configuration
echo "Building Docker image..."
echo "Environment: $NODE_ENV"
echo "Image Name: $IMAGE_NAME"
echo "Dockerfile Path: $DOCKERFILE_PATH"

# Run the Docker build command
docker build -f $DOCKERFILE_PATH -t $IMAGE_NAME --build-arg NODE_ENV=$NODE_ENV .

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "Docker image $IMAGE_NAME built successfully."
else
    echo "Docker build failed."
    exit 1
fi
