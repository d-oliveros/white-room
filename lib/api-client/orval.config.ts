import { defineConfig } from 'orval';

export default defineConfig({
  store: {
    input: {
      target: '../../dist/core/api-swagger/swagger.json',
    },
    output: {
      target: 'src/orval/api.client.ts',
      schemas: 'src/orval/model',
      client: 'react-query',
      // WARN(@d-oliveros): For some reason the fetch httpClient is not working properly when using a custom fetch client for setting the base URL. Axios doesn't seem to have this issue.
      httpClient: 'axios',
      prettier: true,
      mock: false,
      indexFiles: true,
    },
  },
});
