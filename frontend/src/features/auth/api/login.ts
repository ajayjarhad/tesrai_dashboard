import type { LoginCredentials, User } from '@tensrai/shared';
import { apiClient } from '@/lib/api';

export interface LoginResponse {
  success: boolean;
  user: User;
  session: {
    sessionId: string;
    expiresAt: string;
  };
  error?: string;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('auth/sign-in', {
    username: credentials.username,
    password: credentials.password,
  });

  if (response.success === true) {
    return response;
  } else {
    throw new Error(response.error || 'Login failed');
  }
};
