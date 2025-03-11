# Infrastructure CDK App

This application contains the AWS CDK (Cloud Development Kit) code for deploying and managing the infrastructure of the Namespace project.

## Overview

The Infrastructure CDK App is responsible for defining and provisioning the AWS resources required for the Namespace application. It uses the AWS CDK framework, which allows us to define cloud infrastructure using familiar programming languages.

## Key Components

- **Stacks**: The app is organized into multiple stacks, each representing a logical grouping of related resources. These stacks are defined in the `infra/cdk/stacks` directory of the monorepo.

- **Resources**: Various AWS resources can be defined and configured within these stacks, such as:
  - EC2 instances
  - VPCs and Networking components
  - S3 buckets
  - RDS databases
  - Lambda functions
  - API Gateway
  - CloudFront distributions
  - IAM roles and policies

## Getting Started

1. Ensure you have the AWS CDK CLI installed:

```
npm install -g aws-cdk
```

2. Configure your AWS credentials:

```
aws configure
```

3. Install dependencies:

```
npm install
```

4. Synthesize the CloudFormation template:

```
cdk synth
```

5. Deploy the stacks:

```
cdk deploy --all
```

## Useful commands

- `cdk synth` - If you want to preview the CloudFormation template: Run cdk synth, inspect the output, and then run cdk deploy.
- `cdk diff` - If you want to see what will change: Run cdk diff to compare, then run cdk deploy to apply changes.
- `cdk deploy` - If you just want to deploy changes: You can directly run cdk deploy.

## Continuous Deployment

Whenever code is pushed to the `dev`, `staging`, or `prod` branches, our CI/CD pipeline automatically triggers the deployment process for the corresponding environment. Here's an overview of the process:

1. **Code Push**: A developer pushes code to one of the designated branches (`dev`, `staging`, or `prod`).

2. **CI/CD Trigger**: The push event triggers our CI/CD pipeline (e.g., GitHub Actions, GitLab CI, or AWS CodePipeline).

3. **Build**: The pipeline tests, lints and builds packages affected by the latest code push. It will only process affected packages listed by the `nx affected` command. This command tells NX which packages have been updated in this branch.

4. **CDK Deployment**: If the build and tests pass, the pipeline executes the CDK deployment:

   ```
   cdk deploy --all --require-approval never
   ```

   This command deploys all stacks defined in the CDK app without requiring manual approval.

5. **Notifications**: TODO: The pipeline sends notifications (e.g., Slack messages, emails) to inform the team about the deployment status.

This automated process ensures that our infrastructure is consistently updated with each code push, maintaining alignment between our codebase and deployed resources across all environments.

## Documentation

For more detailed information about the AWS CDK, refer to the [official AWS CDK documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html).
