import { compareHashedString, hashString, getObjectId } from './crypto';

describe('crypto', () => {
  describe('hashString', () => {
    it('should hash a plain string', async () => {
      const plainString = 'test123';
      const hashedString = await hashString(plainString);

      expect(hashedString).toBeDefined();
      expect(hashedString.split('$')).toHaveLength(2);
      expect(hashedString).not.toEqual(plainString);
    });

    it('should generate different hashes for same input', async () => {
      const plainString = 'test123';
      const hash1 = await hashString(plainString);
      const hash2 = await hashString(plainString);

      expect(hash1).not.toEqual(hash2);
    });

    it('should throw on invalid input', async () => {
      await expect(hashString('')).rejects.toThrow();
    });
  });

  describe('compareHashedString', () => {
    it('should return true for matching strings', async () => {
      const plainString = 'test123';
      const hashedString = await hashString(plainString);

      const result = await compareHashedString(plainString, hashedString);
      expect(result).toBe(true);
    });

    it('should return false for non-matching strings', async () => {
      const plainString = 'test123';
      const wrongString = 'test456';
      const hashedString = await hashString(plainString);

      const result = await compareHashedString(wrongString, hashedString);
      expect(result).toBe(false);
    });

    it('should throw on invalid hash format', async () => {
      await expect(compareHashedString('test', 'invalid')).rejects.toThrow();
    });
  });

  describe('getObjectId', () => {
    it('should generate consistent hash for same object', () => {
      const obj = { a: 1, b: 2 };
      const hash1 = getObjectId(obj);
      const hash2 = getObjectId(obj);

      expect(hash1).toBeDefined();
      expect(hash1).toEqual(hash2);
    });

    it('should generate same hash regardless of property order', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 2, a: 1 };

      const hash1 = getObjectId(obj1);
      const hash2 = getObjectId(obj2);

      expect(hash1).toEqual(hash2);
    });

    it('should handle nested objects', () => {
      const obj = {
        a: 1,
        b: { c: 2, d: [3, 4] },
      };

      const hash = getObjectId(obj);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should return null for null/undefined input', () => {
      expect(getObjectId(null)).toBeNull();
      expect(getObjectId(undefined)).toBeNull();
    });
  });
});
