import { apiClient } from '@/lib/api';

export const deleteUser = async (userId: string): Promise<void> => {
  const response = await apiClient.delete<Record<string, unknown>>(`users/${userId}`);
  if (!response['success']) {
    throw new Error((response['message'] as string) || 'Failed to delete user');
  }
};
