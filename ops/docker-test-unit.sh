#!/bin/bash

set -exo pipefail

# Migrate local database to the latest
npm run knex-migrate-latest

# Load seeds
npm run knex-load-seeds

# Lint, test, run Cypress tests
npm run lint-strict
npm run test
