/**
 * Utilities for downloading user credentials as text files
 */

export interface UserCredentials {
  username: string;
  password: string;
  email: string;
  displayName?: string;
}

/**
 * Generate a formatted text file with user credentials
 */
export function generateCredentialsFile(credentials: UserCredentials): string {
  const lines = [
    'User Credentials',
    '================',
    '',
    `Username: ${credentials.username}`,
    `Email: ${credentials.email}`,
    `Display Name: ${credentials.displayName || 'Not set'}`,
    `Password: ${credentials.password}`,
    '',
    '⚠️  Important Information:',
    '• This password expires in 72 hours',
    '• Please change your password after first login',
    '• Keep this information secure',
    '',
    `Generated on: ${new Date().toLocaleString()}`,
  ];

  return lines.join('\n');
}

/**
 * Download credentials as a text file
 */
export function downloadCredentials(credentials: UserCredentials): void {
  const content = generateCredentialsFile(credentials);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${credentials.username}_credentials.txt`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Copy password to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  }
}
