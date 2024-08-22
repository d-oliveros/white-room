# White Room

SSR-first, full-stack Application starter kit.


## Features

* React + [Baobab](http://christianalfoni.github.io/javascript/2015/02/06/plant-a-baobab-tree-in-your-flux-application.html) frontend. A minimal, zero-boilerplate flux variant. [Read more here.](http://christianalfoni.github.io/javascript/2015/02/06/plant-a-baobab-tree-in-your-flux-application.html)
* API server.
* ESM-first, async/await native, SSR/HMR native.
* Websockets with Socket.io.
* Role-Based Auth Layer
* Postgres backend with [TypeORM](https://typeorm.io/) for schema management and [Knex](https://knexjs.org/) for querying the DB.
* User Model
* Signup/Login flows
* Cron/Periodic functions.
* Priority job Worker Queue, powered by [Bull](https://github.com/taskforcesh/bullmq) + [Redis](http://redis.io/).
* AWS S3 integration for uploads.
* Unit Tests with Jest
* E2E Tests with Playwright


## Dependencies

* Node.js v22.6.0
* Docker


## Setup

#### Install Dependencies

##### Install Node v22.6.0
```
> curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
> nvm install 22.6.0
> nvm alias default 22.6.0
```

##### Start PostgreSQL and Redis with Docker Compose:
```bash
$ docker compose up -d
```

##### You can stop/restart the services using docker-compose as well

```bash
$ docker compose stop
$ docker compose restart
```

#### Install the application's modules
```bash
$ npm install
```


#### Create the development WhiteRoom database

If Postgres is installed locally and is accessible via the command line:
```
> psql --username=postgres --password -c "CREATE DATABASE whiteroom_dev;"
```

If you're running postgres locally in a docker container:
```
> docker exec -ti postgres psql --username=postgres --password -c "CREATE DATABASE whiteroom_dev;"
```


#### Evolve your development WhiteRoom database with the latest schema
```
npm run knex-migrate-latest  # Evolves your local database to the latest schema
npm run knex-load-seeds      # Creates initial development data in your database
```


#### Configure your environment
A predefined set of default environmental variables is located in `/.env.default`. This environment file does not have any public-facing keys. You will need to configure your environment with development keys in order to enable all application features.

Copy the file `/environments/.env.local` from the engineering Google Drive folder into a file called `.env` in your web repository's root. This should be enough to enable all features when running the application locally. Do *NOT* update the `.env.default`. This file will be committed to Git, if updated.


#### Run tests
`npm run test`


#### Run E2E tests
If you haven't installed cypress yet, you can install it via `npm run cypress:install`.

Run `npm run cypress:open` to open the E2E test runner. Make sure you are running the app in another terminal with `npm run dev`. All E2E tests should pass.


#### Start the app
`npm run dev`

Then go to `http://localhost:3000`. These users are created initially on `npm run knex-load-seeds`.


## Configuration

Copy the `.env.default` file located in the application's root to a file called `.env`, and modify the values according to the instance's purpose.

This will let you configure the instance's database connections, and start app instances with a single purpose, for example if you need to increase the number of client renderer servers while keeping a minimum amount of API servers, or if you need to scale the application but just want a single instance running periodic tasks (cron), or if you want to add queue workers, etc.


## Commands

#### Starts the development server
```
npm run dev
// Now visit http://localhost:3000
```

#### Evolve the DB schema to the latest evolution file
`npm run knex-migrate-latest`


#### Roll the DB schema back to the previous evolution file
`npm run knex-migrate-rollback`


#### Run a cron task
`npm run cron-task [cronTaskName]`


#### Run the tests
`npm run test`


#### Run the tests and restart the tests live when changing files in the codebase
`npm run test-watch`


#### Lint the codebase
`npm run lint`


#### Analyze the webpack bundle
`npm run webpack-analyze-bundle script`


#### Runs any script file located at `/util/[scriptName]`
```
npm run script               # To list all available scripts
npm run script [scriptName]  # To run the script [scriptName]
```

### Docker

Build the image
```
docker build -t app-dev .
```

Run the image in interactive mode
```
docker run -i --net="host" --name="app" --env-file=.env -e USE_BUILD=true app-dev
```


## Docs

#### Server-side Rendering

Server-side rendering can get quite CPU-intensive sometimes, affecting the performance of the API server. That's why you should separate the main API server from the Renderer server.

To separate the renderer server from the main API server, start two instances of your app, and modify your `.env` files accordingly.

To start a Renderer server instance, change your .env to:
```
ENABLE_SERVER = "false"
ENABLE_RENDERER = "true"
```

To start an API server instance, change your .env to:
```
ENABLE_SERVER = "true"
ENABLE_RENDERER = "false"
```

Remember to change these lines as well

```
RENDERER_PORT = "3001"                      # Port to listen in.
RENDERER_ENDPOINT = "http://localhost:3001" # Renderer microservice endpoint.
```

Please see `.env.default` in the project's root for more info.


Cheers.
