import type { ResetPasswordInput } from '@tensrai/shared';
import { apiClient } from '@/lib/api';

export const firstTimeSetup = async (data: ResetPasswordInput): Promise<void> => {
  const response = await apiClient.post<Record<string, unknown>>('auth/first-time-setup', {
    tempPassword: data.tempPassword,
    newPassword: data.newPassword,
    confirmPassword: data.confirmPassword,
    displayName: data.displayName,
  });

  if (!response['success']) {
    throw new Error((response['message'] as string) || 'Password setup failed');
  }
};
