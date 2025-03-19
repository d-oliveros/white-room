# White Room Monorepo

## Requirements

- Node 22.9.0
- Postgres 16

## Install

Make sure you are using the correct Node version

```
nvm use
```

Install the dependencies

```
npm i
```

Install the Nx CLI globally

```
npm i -g nx
```

Configure your environment by creating `.env` file in the monorepo root. Start by copying the `.env.default` file, which contains default variables. You can then customize these files by adding or modifying variables as needed. The final configuration will be a combination of the default variables from `.env.default` and any additional variables you define in `.env`.

Refrain from using custom `.env` files in project directories, unless there is a good reason to do so.

## Start the API, Web Server, and the Lambda Development Server

```
npm start
```

## Start the API only

```
nx serve api
```

## Start the Web Server only

```
nx serve web
```

## Deploy to dev/staging/prod

Push to the `dev`/`staging`/`prod` branches.

CI will build the app and deploy it to the corresponding environment. It will also synthesize the CloudFormation stack defined in `/infra/cdk/bin` using CDK, and run the commands to deploy the stack on the corresponding environments.

## Infrastructure

The infrastructure for our project is defined using AWS Cloud Development Kit (CDK), which generates CloudFormation templates. The CDK code can be found in the `/infra/cdk` directory and defines all infrastructure components including:

1. Server infrastructure: This includes the ECS cluster resources that the core API needs, such as Route53 DNS records, ECR repositories, ECS task definitions, Application Load Balancers, Fargate services, target groups and other supporting resources.

2. Serverless infrastructure: This includes Lambda functions, API Gateway endpoints, SQS queues, and other serverless components.

The infrastructure is deployed to the corresponding environments (dev/staging/prod) using Github Actions, which is defined in the `.github/workflows` folder. Lambda functions are automatically deployed and can be consumed via HTTP or SQS using the `/lib/lambda` package.

## Test/Lint/Build

To test/lint/build a single package:

```
nx lint [packageName]
nx test [packageName]
nx build [packageName]
```

To test/lint all the packages:

```
npm run test
npm run lint
npm run build

// The command that gets run is:
nx run-many --target=test --all
nx run-many --target=lint --all
nx run-many --target=build --all
```

## Dependency graph

Run `nx graph` to show the graph of the workspace.
It will show tasks that you can run with Nx, and the modules with their dependencies in a nice graph.

## Code structure

The packages are divided into the following folders:

- `/core`: This includes the fastify API, the TypeORM domain models/services, and (eventually) the web app and other core packages.
- `/libs`: Contains shared libraries that can be used across multiple packages.
- `/infra`: Contains the infrastructure as code for the project, including the CDK code, and some development tools like the lambda dev server.
- `/lambdas`: These are deployed to AWS Lambda and provide isolated functionalities.
- `/lambdas/scrapers`: Contains Playwright scrapers that are deployed to AWS Lambda.

## Bundling

When building the packages, the compiled output will contain a generated `package.json` and `package-lock.json` containing only the modules that are needed for each package. We do not have to add manual `package.json` files or manually set the required `node_modules`, this is handled by NX automatically.

When importing local libraries, the lib codes are included in the final bundle, so we don't need to publish each package individually to get the codes contained into production builds.

## Create new library:

```
nx generate @nx/node:library lib/my-new-lib
```

## Create new module:

```
nx generate @nx/node:app (folder)/my-new-module

# e.g. create a new lambda
nx generate @nx/node:app lambdas/my-lambda-function
```

## Library packages

`/lib` packages can be required from other packages in the monorepo. You can import them using path aliases, for example:

```
import { myFunction } from '@whiteroom/util';
import { normalizeAddress } from '@whiteroom/address-helpers';
```

When generating libs, a path alias is created automatically in `tsconfig.base.json`.

## Configurations

Please do not define custom TypeScript/Jest/Eslint configurations in the package's config files, unless there is a good reason to do so, and let's try to always use the `esbuild` transpiler/bundler.

Valid reasons to use a different bundler:

- If you need decorator support (esbuild does not support decorators)

If you really want to change eslint/jest/typescript configurations, try to do it from the root config files. Keep in mind this will affect the whole monorepo, so try to discuss the changes with the team first.

## Running tasks

To execute tasks with Nx use the following syntax:

```
nx <target> <project> <...options>
```

You can also run multiple targets:

```
nx run-many -t <target1> <target2>
```

..or add `-p` to filter specific projects

```
nx run-many -t <target1> <target2> -p <proj1> <proj2>
```

Targets can be defined in the `package.json` or `projects.json`. Learn more [in the docs](https://nx.dev/features/run-tasks).
