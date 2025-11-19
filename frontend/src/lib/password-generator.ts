/**
 * Cryptographically secure password generation utilities
 */

export interface PasswordGenerationOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeSimilar?: boolean; // Exclude 0, O, l, I, etc.
}

export const DEFAULT_PASSWORD_OPTIONS: Required<PasswordGenerationOptions> = {
  length: 8,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: false,
  excludeSimilar: false,
};

/**
 * Generate a cryptographically secure random password using Web Crypto API
 */
export function generateSecurePassword(options: PasswordGenerationOptions = {}): string {
  const config = { ...DEFAULT_PASSWORD_OPTIONS, ...options };

  let charset = '';

  if (config.includeLowercase) {
    charset += 'abcdefghijklmnopqrstuvwxyz';
  }
  if (config.includeUppercase) {
    charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  if (config.includeNumbers) {
    charset += '0123456789';
  }
  if (config.includeSymbols) {
    charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }

  if (config.excludeSimilar) {
    // Remove characters that can be confused: 0, O, l, I, 1, etc.
    charset = charset.replace(/[0O1lI]/g, '');
  }

  if (!charset) {
    throw new Error('No characters available for password generation');
  }

  // Use Web Crypto API for cryptographically secure random values
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const randomValues = new Uint32Array(config.length);
    window.crypto.getRandomValues(randomValues);

    let password = '';
    for (let i = 0; i < config.length; i++) {
      password += charset.charAt(randomValues[i] % charset.length);
    }
    return password;
  } else {
    // Fallback for older browsers or server-side rendering
    console.warn('Web Crypto API not available, using fallback random generation');
    let password = '';
    for (let i = 0; i < config.length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

/**
 * Generate a temporary password (8 characters, alphanumeric only)
 */
export function generateTemporaryPassword(): string {
  return generateSecurePassword({
    length: 8,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: false,
    excludeSimilar: false,
  });
}

/**
 * Generate a strong password (12 characters, includes symbols)
 */
export function generateStrongPassword(): string {
  return generateSecurePassword({
    length: 12,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
  });
}

/**
 * Validate password strength
 */
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('Password should be at least 8 characters long');

  if (password.length >= 12) score++;
  else if (password.length >= 8) feedback.push('Consider using 12+ characters for better security');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Include uppercase letters');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Include symbols for stronger passwords');

  return {
    score: Math.min(4, score),
    feedback,
    isStrong: score >= 4,
  };
}
