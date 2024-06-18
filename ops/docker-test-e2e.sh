#!/bin/bash

set -exo pipefail

echo Running tests: $(circleci tests glob "./cypress/integration/**/*.spec.js" | circleci tests split --split-by=timings --time-default=40s | paste -sd "," -)

# Install cypress helpers locally
npm install @cypress/webpack-preprocessor cypress-circleci-reporter --no-save

# Migrate local database to the latest
npm run knex-migrate-latest

# Load seeds
npm run knex-load-seeds

# Generate prod build
NODE_ENV=production npm run build-e2e

# https://docs.cypress.io/guides/guides/continuous-integration.html#Boot-your-server
NODE_ENV=production USE_BUILD=true node init & $WAITON_BIN_PATH http://localhost:3000

# Run tests
circleci tests glob "cypress/e2e/**/*.cy.js" | circleci tests run --command="xargs $CYPRESS_BIN_PATH run --reporter cypress-circleci-reporter --spec" --verbose --split-by=timings --time-default=40s
