# White Room

Minimal starter kit for an React/Express full-stack isomorphic application. Designed for simplicity.


## Features

* React + [Baobab](http://christianalfoni.github.io/javascript/2015/02/06/plant-a-baobab-tree-in-your-flux-application.html) frontend. A minimal, zero-boilerplate flux variant. [Read more here.](http://christianalfoni.github.io/javascript/2015/02/06/plant-a-baobab-tree-in-your-flux-application.html)
* Isomorphic, route-less API server with [Isomorphine](https://github.com/d-oliveros/isomorphine).
* ES6, Express server, Server-Side Rendering.
* Promise-based, Async/Await codebase.
* Webpack Dev Server. Hot Reloading for react components and stylesheets.
* Websockets with Socket.io.
* Auth layer. JSON Web Tokens & OAuth2.
* Mongo backend with [Mongoose](http://mongoosejs.com/).
* User Model with auth included.
* Server-side, cron-like periodic tasks.
* A priority job Worker Queue, powered by [Kue](https://github.com/Automattic/kue) + [Redis](http://redis.io/).
* Image & File uploads with [gm](https://www.npmjs.com/package/gm).
* AWS S3 integration for uploads.
* Tests with Chai & Mocha
* Integrations
  * Segment
  * Slack
  * Intercom
  * Loggly
  * Verifalia
  * Mailchimp
  * Mandrill


## Dependencies

* Node.js
* MongoDB
* Redis


#### Optional dependencies

* [Graphicsmagick](https://www.npmjs.com/package/gm) (For image processing)
* [Elasticsearch](https://www.elastic.co/) (For search capabilities)
* Neo4j
* AWS


## Setup

#### Install Dependencies

Install MongoDB and Redis.


#### Install the application's modules

`npm install`


#### Configure the application's environment

Copy the `.env.default` file located in the application's root to a file called `.env`, and modify the values according to the instance's purpose.

This step is optional. If you don't do this, the defaults in `.env.default` will be used.

This will let you configure your databases, and start app instances with a single purpose, for example if you need to increase the number of client renderer servers while keeping a minimum amount of API servers, or if you need to scale the application but just want a single instance running periodic tasks (cron), or if you want to add queue workers, etc.


## Commands

#### Starts the development server

```
npm start
// Now visit http://localhost:3000
```


#### Runs a script


```bash
npm run script               # Lists all available scripts
npm run script [script-name] # Runs the script with name [script-name]

# This will create dummy posts and initial admin user.
npm run script data-generator

# This will create an admin user
npm run script create-admin

# Scripts are located in `[project root]/util`
```


## Docs

#### Server-side Rendering

Server-side rendering can get quite CPU-intensive sometimes, affecting the performance of the API server. That's why you should separate the main API server from the Renderer server.

To separate the renderer server from the main API server, start two instances of your app, and modify your `.env` files accordingly.

To start a Renderer server instance, change your .env to:
```
ENABLE_API = "false"
ENABLE_RENDERER = "true"
```

To start an API server instance, change your .env to:
```
ENABLE_API = "true"
ENABLE_RENDERER = "false"
```

Remember to change these lines as well

```
RENDERER_PORT = "3001" # Port to listen in
RENDERER_ENDPOINT = "http://localhost:3001" # Renderer microservice endpoint
```

Please see `.env.default` in the project's root for more info.


Cheers.
