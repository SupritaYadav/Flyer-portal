import { describe, expect, it } from 'vitest';
import { sanitize, validate, tierFor } from './input';

describe('sanitize', () => {
  it('removes script tags and angle brackets', () => {
    const out = sanitize('<script>alert(1)</script>Bob');
    expect(out).not.toMatch(/[<>]/);
    expect(out).toBe('alert(1)Bob');
  });
  it('removes nested and unclosed tags', () => {
    expect(sanitize('<<b>img src=x onerror=1>hi')).not.toMatch(/[<>]/);
    expect(sanitize('<img src=x onerror=alert(1)')).toBe('');
  });
  it('trims and handles null', () => {
    expect(sanitize('  hi  ')).toBe('hi');
    expect(sanitize(null)).toBe('');
  });
});

describe('validate', () => {
  it('accepts valid data', () => {
    expect(validate({ name: 'Ann Lee', email: 'ann@x.com', miles: '100' })).toEqual({});
  });
  it('flags every bad field', () => {
    const e = validate({ name: 'A', email: 'nope', miles: '-5' });
    expect(Object.keys(e)).toEqual(['name', 'email', 'miles']);
  });
});

describe('tierFor', () => {
  it('maps miles to tiers', () => {
    expect([0, 10000, 25000, 50000].map(tierFor)).toEqual(['Blue', 'Silver', 'Gold', 'Platinum']);
  });
});
