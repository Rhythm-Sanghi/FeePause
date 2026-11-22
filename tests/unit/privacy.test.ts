import { describe, it, expect } from 'vitest';
import { verifyNoStorageLeak, sanitizeInertText } from '../../src/privacy/privacyGuard';

describe('Privacy and Client-Side Isolation Invariants', () => {
  it('returns true for verifyNoStorageLeak when no feepause items exist in storage', () => {
    expect(verifyNoStorageLeak()).toBe(true);
  });

  it('preserves text inertly without transforming it into HTML elements', () => {
    const rawMaliciousInput = '<script>alert("xss")</script> https://phish.net/pay';
    const sanitized = sanitizeInertText(rawMaliciousInput);
    expect(sanitized).toBe(rawMaliciousInput);
  });
});
