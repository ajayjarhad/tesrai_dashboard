import type { User } from '@tensrai/shared';
import { apiClient } from '@/lib/api';

export interface GetUsersResponse {
  success: boolean;
  data: User[];
  message?: string;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<GetUsersResponse>('users');
  if (response.success && Array.isArray(response.data)) {
    return response.data;
  } else {
    throw new Error(response.message || 'Failed to load users');
  }
};
