import { TestingHelloResponseSchema } from './testing.schemas';

describe('TestingHelloResponseSchema', () => {
  describe('valid inputs', () => {
    it('accepts { ok: true }', () => {
      const result = TestingHelloResponseSchema.safeParse({ ok: true });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('rejects { ok: false }', () => {
      const result = TestingHelloResponseSchema.safeParse({ ok: false });
      expect(result.success).toBe(false);
    });

    it('rejects empty object', () => {
      const result = TestingHelloResponseSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('rejects null value for ok', () => {
      const result = TestingHelloResponseSchema.safeParse({ ok: null });
      expect(result.success).toBe(false);
    });
  });
});
