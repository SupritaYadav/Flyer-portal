const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Strips HTML tags, stray angle brackets and control characters (XSS defence). */
export function sanitize(value) {
  let out = String(value ?? '');
  let previous;
  do {
    previous = out;
    out = out.replace(/<[^>]*>?/g, '');
  } while (out !== previous);
  return out
    .replace(/[<>]/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();
}

/** Returns an object of { field: message } for every invalid field. */
export function validate({ name, email, miles }) {
  const errors = {};
  if (name.length < 2) errors.name = 'Enter the full name (at least 2 characters).';
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email, e.g. name@example.com.';
  if (!/^\d+$/.test(miles) || Number(miles) > 10000000) {
    errors.miles = 'Enter miles as a whole number between 0 and 10,000,000.';
  }
  return errors;
}

export function tierFor(miles) {
  if (miles >= 50000) return 'Platinum';
  if (miles >= 25000) return 'Gold';
  if (miles >= 10000) return 'Silver';
  return 'Blue';
}
