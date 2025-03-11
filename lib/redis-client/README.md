# Redis Client

A TypeScript Redis client wrapper with connection management and error handling.

## Features

- Singleton Redis client instance
- Automatic connection management
- TypeScript type definitions
- Error handling and logging
- Environment-based configuration

## Setup

1. Set the required environment variables:

```bash
REDIS_HOST=localhost # Redis server hostname
REDIS_PORT=6379 # Redis server port (optional, defaults to 6379)
```

## Usage

```typescript
import { getRedisClient, disconnectRedisClient } from '@namespace/redis-client';

// Get Redis client instance. This will automatically connect to the Redis server.
const redis = getRedisClient();

// Example usage
async function example(): Promise<void> {
  // Set a value
  await redis.set('key', 'value');

  // Get a value
  const value = await redis.get('key');

  // Clean up when done
  await disconnectRedisClient();
}
```

## API Reference

### `getRedisClient()`

Returns a singleton Redis client instance. Creates a new connection if one doesn't exist.

- Returns: `RedisClientType`
- Throws: `Error` if Redis is not configured (missing environment variables)

### `disconnectRedisClient()`

Safely disconnects the Redis client and cleans up the instance.

- Returns: `Promise<void>`

### `isRedisEnabled`

Boolean flag indicating if Redis is properly configured.

## Error Handling

The client automatically handles connection errors and logs them using the `@namespace/logger`. Error events are logged with full stack traces for debugging.

## Best Practices

1. Always check `isRedisEnabled` before attempting to use Redis in optional features
2. Use `disconnectRedisClient()` during application shutdown
3. Handle potential Redis errors in your application code
4. Avoid creating multiple client instances - use the singleton pattern provided
