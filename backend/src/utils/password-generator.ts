import crypto from 'node:crypto';

/**
 * Generate a cryptographically secure temporary password
 * 8 characters, alphanumeric only (uppercase, lowercase, numbers)
 */
export function generateTemporaryPassword(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 8;

  const randomBytes = crypto.randomBytes(length);
  let password = '';

  for (let i = 0; i < length; i++) {
    password += charset.charAt(randomBytes[i] % charset.length);
  }

  return password;
}
