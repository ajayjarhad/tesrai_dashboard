import { apiClient } from '@/lib/api';

export const logout = async (): Promise<void> => {
  const response = await apiClient.post<Record<string, unknown>>('auth/sign-out');
  if (!response['success']) {
    throw new Error((response['message'] as string) || 'Logout failed');
  }
};
