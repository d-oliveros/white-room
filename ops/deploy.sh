#!/usr/bin/env bash
# Set the script to exit immediately if any command fails (-e), print each command before executing (-x), and treat unset variables as an error (-o pipefail).
set -exo pipefail

# Define a function to print the usage instructions for the script.
function print_usage {
  echo "usage: deploy.sh target_env docker_repo docker_tag [env_file]"
  echo -e "\ttarget_env:\tenvironment to deploy to ('development', 'staging', 'production')"
  echo -e "\tdocker_repo:\tdocker repository to deploy from ('dev-ecr', 'prod-ecr')"
  echo -e "\tcommit_hash:\tcommit hash to deploy (e.g. 'c0b4ef6d4a198132ace4aee158be956e1af1fb02')"
  exit 1
}

# Ensure that exactly three arguments are provided to the script.
if [ "$#" -ne 3 ]
then
  echo "incorrect number of arguments supplied"
  print_usage
fi

# Validate that the provided target environment is supported.
if [ ! "$1" == "development" ] && [ ! "$1" == "staging" ] && [ ! "$1" == "production" ]
then
  echo "invalid target environment provided"
  print_usage
fi

# Validate that the provided Docker repository is supported.
if [ ! "$2" == "dev-ecr" ] && [ ! "$2" == "prod-ecr" ]
then
  echo "invalid docker repo provided"
  print_usage
fi

# Set environment variables for the deployment process.
export TARGET_ENV="$1"
export COMMIT_HASH="$3"
export DOCKER_TAG="$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/$2:commit-$COMMIT_HASH"
SCRIPT_DIR="$(dirname $0)"
TASK_DEF_FILE="$(mktemp)"

# Generate the task definition from a template using a Node.js script.
node $SCRIPT_DIR/render-task-def.js > $TASK_DEF_FILE
echo task definition: $TASK_DEF_FILE

# Register the task definition in ECS and capture the output.
REG_OUTPUT_FILE="$(mktemp)"
aws ecs register-task-definition --cli-input-json file://$TASK_DEF_FILE > $REG_OUTPUT_FILE
TASK_DEF_FAMILY=$(cat $REG_OUTPUT_FILE | jq -r '.taskDefinition.family')
TASK_DEF_REVISION=$(cat $REG_OUTPUT_FILE | jq -r '.taskDefinition.revision')
echo task definition registration output: $REG_OUTPUT_FILE

# Determine the ECS cluster and service to update based on the target environment.
if [ "$1" == "production" ]
then
  ECS_CLUSTER="production"
  ECS_SERVICE="prod-service"
  SLACK_DEPLOYMENTS_CHANNEL="deploys-prod"
else
  if [ "$1" == "staging" ]
  then
    ECS_CLUSTER="staging"
    ECS_SERVICE="staging-service"
    SLACK_DEPLOYMENTS_CHANNEL="deploys-staging"
  else
    ECS_CLUSTER="dev"
    ECS_SERVICE="dev-service"
    SLACK_DEPLOYMENTS_CHANNEL="deploys-dev"
  fi
fi

start_time="$(date -u +%s)"

# Post a Slack notification that the deployment has started.
aws lambda invoke --function-name post-slack-message --payload "{\"channel\": \"$SLACK_DEPLOYMENTS_CHANNEL\", \"attachments\": [{\"fallback\":\"*Deployment Started*\",\"title\":\"*Deployment Started*\",\"color\":\"#9999ff\",\"fields\":[{\"title\":\"ECS Cluster\",\"value\":\"$ECS_CLUSTER\", \"short\": true},{\"title\":\"ECS Service\",\"value\":\"$ECS_SERVICE\", \"short\": true},{\"title\":\"Branch\",\"value\":\"$CIRCLE_BRANCH\", \"short\": true},{\"title\":\"CircleCI Link\",\"value\":\"$CIRCLE_BUILD_URL\"},{\"title\":\"Commit Hash\",\"value\":\"$COMMIT_HASH\"}]}]}" aws-post-slack-message-deployment-started-lambda-invocation.log

# Update the ECS service to use the new task definition.
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --task-definition $TASK_DEF_FAMILY:$TASK_DEF_REVISION

# Wait for the ECS service to become stable.
aws ecs wait services-stable --cluster $ECS_CLUSTER --service $ECS_SERVICE

end_time="$(date -u +%s)"
elapsed="$(($end_time-$start_time))"

# Post a Slack notification that the deployment has finished.
aws lambda invoke --function-name post-slack-message --payload "{\"channel\": \"$SLACK_DEPLOYMENTS_CHANNEL\", \"attachments\": [{\"fallback\":\"*Deployment Finished*\",\"title\":\"*Deployment Finished*\",\"color\":\"#9999ff\",\"fields\":[{\"title\":\"ECS Cluster\",\"value\":\"$ECS_CLUSTER\", \"short\": true},{\"title\":\"ECS Service\",\"value\":\"$ECS_SERVICE\", \"short\": true},{\"title\":\"Branch\",\"value\":\"$CIRCLE_BRANCH\", \"short\": true},{\"title\":\"CircleCI Link\",\"value\":\"$CIRCLE_BUILD_URL\"},{\"title\":\"Commit Hash\",\"value\":\"$COMMIT_HASH\"},{\"title\":\"Time Elapsed\",\"value\":\"${elapsed} seconds.\"}]}]}" aws-post-slack-message-deployment-finished-lambda-invocation.log
