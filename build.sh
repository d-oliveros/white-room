#!/bin/sh

# Stop the script if any command fails
set -e

# Starts the build process
# - Compiles the app.
# - Optionally prunes dependencies and exposes assets.
# - Compiles the app.
#
# Features:
# - Runs compilation and asset handling in parallel for speed.
# - Flexible flags for skipping install, pruning, and copying/moving assets.

# Initialize variables with default values
COPY_ASSETS=true
PRUNE_MODULES=false
SKIP_INSTALL=false
CLEANUP_DONE=false

# Function to show usage
usage() {
  echo "Usage: $0 [--copy-assets=<true|false>] [--prune] [--skip-install]"
  exit 1
}

# Function to handle script cleanup on interruption or exit
cleanup() {
  if [ "$CLEANUP_DONE" = false ]; then
    echo "Build process interrupted or script is exiting. Cleaning up..."
    CLEANUP_DONE=true

    # Kill all background processes
    pkill -P $$

    # Wait a moment to ensure processes are terminated
    sleep 1

    # Forcefully kill any lingering processes if pkill didn't catch them
    kill 0 2>/dev/null || true
  fi
}

# Trap all relevant signals
trap cleanup INT TERM QUIT HUP

# Parse command-line arguments
while [ "$#" -gt 0 ]; do
  case "$1" in
    --copy-assets=*)
      COPY_ASSETS="${1#*=}"
      ;;
    --prune)
      PRUNE_MODULES=true
      ;;
    --skip-install)
      SKIP_INSTALL=true
      ;;
    *)
      echo "Unknown option: $1"
      usage
      ;;
  esac
  shift
done

# Set NODE_ENV to the environment variable NODE_ENV, or default to "production" if not set
export NODE_ENV="${NODE_ENV:-production}"

# Display NODE_ENV at the top
echo "NODE_ENV is set to $NODE_ENV"

# Validate the COPY_ASSETS flag
if [ "$COPY_ASSETS" != "true" ] && [ "$COPY_ASSETS" != "false" ]; then
  echo "Invalid value for --copy-assets: $COPY_ASSETS"
  usage
fi

# Check if the build directory exists
if [ -d "./build" ]; then
  echo "Build directory exists. Deleting ./build directory..."
  rm -rf ./build
fi

# Create the build directory
echo "Creating ./build directory..."
mkdir -p ./build

# Install dependencies unless --skip-install is true
if [ "$SKIP_INSTALL" != "true" ]; then
  echo "Installing dependencies..."
  npm install --no-save --include=dev
else
  echo "Skipping npm install as per --skip-install flag."
fi

# Run npm run compile in the background
echo "Compiling the application..."
npm run compile &

# Prune and handle assets in parallel
{
  # Handle the --prune flag
  if [ "$PRUNE_MODULES" = "true" ]; then
    echo "Pruning devDependencies..."
    npm prune --omit=dev
  fi

  # Handle the --copy-assets flag
  if [ "$COPY_ASSETS" = "true" ]; then
    echo "Copying assets..."

    # Copy the public directory
    if [ -d "./public" ]; then
        cp -R ./public ./build/public
    fi

    # Copy node_modules
    echo "Copying node_modules..."
    cp -R ./node_modules ./build/node_modules
  else
    echo "Moving assets..."

    # Move the public directory
    if [ -d "./public" ]; then
        mv ./public ./build/public
    fi

    # Move node_modules
    echo "Moving node_modules/..."
    mv ./node_modules ./build/node_modules
  fi
  rm -rf ./node_modules/.cache

  # Copy package.json
  echo "Copying package.json..."
  cp ./package.json ./build/package.json

  # Copy .env.default
  echo "Copying .env.default..."
  cp ./.env.default ./build/.env.default
} &

# Wait for all background processes to finish
wait

echo "Build process completed."
