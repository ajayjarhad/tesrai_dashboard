import type { User } from '@tensrai/shared';
import { apiClient } from '@/lib/api';

export interface CreateUserRequest {
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  displayName?: string;
}

export interface CreateUserResponse {
  success: boolean;
  data: {
    user: User;
    tempPassword: string;
  };
  error?: string;
}

export const createUser = async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
  const response = await apiClient.post<CreateUserResponse>('users', userData);
  if (response.success) {
    return response;
  } else {
    throw new Error(response.error || 'Failed to create user');
  }
};
