import { describe, test, expect } from 'vitest';

describe('Basic Tests', () => {
  test('test framework works', () => {
    expect(1 + 1).toBe(2);
  });

  test('environment variables', () => {
    // This should pass when DATABASE_URL is set
    expect(typeof process.env.NODE_ENV).toBe('string');
  });
});