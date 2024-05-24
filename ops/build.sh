#!/usr/bin/env bash
# Set the script to exit immediately if any command fails (-e), print each command before executing (-x), and treat unset variables as an error (-o pipefail).
set -exo pipefail

# Define a function to print the usage instructions for the script.
function print_usage {
  echo "usage: build.sh development|production"
  exit 1
}

# Ensure that exactly one argument is provided to the script.
if [ "$#" -ne 1 ]
then
  echo "incorrect number of arguments supplied"
  print_usage
fi

# Validate that the provided argument is either 'development' or 'production'.
if [ ! "$1" == "development" ] && [ ! "$1" == "production" ]
then
  echo "invalid environment provided"
  print_usage
fi

# Check if the git repository is clean. If not, exit the script.
if [ -n "$(git status --porcelain)" ]
then
  echo "unclean git repository. check in or stash changes to build"
  exit 1
fi

# Get the commit hash. If running on CircleCI, use the provided environment variable. Otherwise, use the latest commit hash from the local git repository.
if [ -n "$CIRCLECI" ]
then
  COMMIT="$CIRCLE_SHA1"
else
  COMMIT=`git rev-list HEAD -1`
fi

# Set environment-specific variables based on the provided argument.
if [ "$1" == "development" ]
then
  DOCKER_TAG="$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/dev-ecr:commit-$COMMIT"
  NODE_ENV="development"
else
  DOCKER_TAG="$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/prod-ecr:commit-$COMMIT"
  NODE_ENV="production"
fi

# Log in to AWS Elastic Container Registry (ECR).
`aws ecr get-login --no-include-email`

# Build the Docker image with the appropriate tags and arguments.
docker build -t $DOCKER_TAG --build-arg NODE_ENV="$NODE_ENV" --build-arg COMMIT_HASH="$COMMIT" --build-arg AWS_ACCESS_KEY="$AWS_ACCESS_KEY" --build-arg AWS_SECRET_KEY="$AWS_SECRET_KEY" .

# Push the built Docker image to the specified ECR repository.
docker push $DOCKER_TAG