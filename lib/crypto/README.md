# @namespace/crypto

A cryptographic utility library providing secure hashing and comparison functions.

## Features

- `hashString()` - Securely hash strings using scrypt algorithm with salt
- `compareHashedString()` - Safely compare plain text against hashed strings
- `getObjectId()` - Generate deterministic hash identifiers for objects

## Usage

### Hashing Strings

```typescript
import { hashString } from '@namespace/crypto';
// Hash a password or sensitive string
const hashedValue = await hashString('mySecurePassword');
// Returns: { hash: string, salt: string }
```

### Comparing Hashed Strings

```typescript
import { compareHashedString } from '@namespace/crypto';
// Compare a plain text password against a stored hash
const isMatch = await compareHashedString('mySecurePassword', storedHash, storedSalt);
// Returns: boolean
```

### Generating Object IDs

```typescript
import { getObjectId } from '@namespace/crypto';
const object = {
  name: 'Example',
  timestamp: 1234567890,
};
// Generate a deterministic ID for an object
const objectId = getObjectId(object);
// Returns: string (hex hash)
```

## Security Considerations

- The library uses the scrypt algorithm for password hashing, providing strong protection against brute-force attacks
- All cryptographic operations are performed using Node.js's native `crypto` module
- Salt values are automatically generated and required for both hashing and comparison
- Timing attacks are mitigated through constant-time comparison functions

## API Reference

### `hashString(input: string): Promise<{ hash: string, salt: string }>`

Generates a secure hash of the input string using a random salt.

### `compareHashedString(input: string, hash: string, salt: string): Promise<boolean>`

Securely compares a plain text input against a previously hashed value.

### `getObjectId(obj: Record<string, unknown>): string`

Generates a deterministic hash identifier for an object.
