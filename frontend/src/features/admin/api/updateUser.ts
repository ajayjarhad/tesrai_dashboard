import { apiClient } from '@/lib/api';

export interface UpdateUserRequest {
  isActive: boolean;
}

export const updateUser = async (userId: string, updateData: UpdateUserRequest): Promise<void> => {
  const response = await apiClient.put<Record<string, unknown>>(`users/${userId}`, updateData);
  if (!response['success']) {
    throw new Error((response['message'] as string) || 'Failed to update user');
  }
};
