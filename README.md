# White Room

Starter boilerplate for an isomorphic single-page React/Express application.

## Features

* Promise-based codebase
* Babel ES6+ - async/await, decorators
* Front-end React app with React Router, Baobab (Single-State tree Flux variant)
* Hot Reloading for react components and stylesheets with Webpack Dev Server
* Websockets with Socket.io
* Webpack, Webpack Dev Server
* Auth layer, JSON Web Tokens & OAuth2
* Route-less API with Isomorphine
* Express server, server-side rendering
* Mongoose models
* Basic User model with auth
* Cron-like Periodic Tasks
* Worker Queues powered by Kue
* Image & File uploads, S3 integration
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

* Graphicsmagick (For image processing)
* Elasticsearch (For search capabilities)
* Pygmy (For short URL generation)
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
npm run dev
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

Cheers.
