import type { User } from '@tensrai/shared';
import { apiClient } from '@/lib/api';

export interface SessionResponse {
  user: User;
  session: {
    sessionId: string;
    expiresAt: string;
  };
  message?: string;
}

export const checkSession = async (): Promise<SessionResponse | null> => {
  const response = await apiClient.get<SessionResponse>('auth/session');

  if (response?.user && response?.session) {
    return response;
  } else {
    return null;
  }
};
