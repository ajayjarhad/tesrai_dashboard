import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LoginCredentials, ResetPasswordInput } from '@tensrai/shared';
import { queryKeys } from '@/lib/query-keys';
import { useAuthStore } from '@/stores/auth';
import {
  checkSession as checkSessionApi,
  firstTimeSetup as firstTimeSetupApi,
  login as loginApi,
  logout as logoutApi,
} from '../api';

export function useLogin() {
  const queryClient = useQueryClient();
  const { login: storeLogin } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginApi(credentials),
    onSuccess: async (_data, credentials) => {
      // Update Zustand store after successful login
      // We need to call the store's login method which will update the state
      await storeLogin(credentials);
      // Invalidate any related queries
      await queryClient.invalidateQueries({ queryKey: queryKeys.session.all });
    },
  });
}

export function useLogout() {
  const { logout: storeLogout } = useAuthStore();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: async () => {
      await storeLogout();
    },
  });
}

export function useSession() {
  const { checkAuth } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.session.all,
    queryFn: async () => {
      // First try the API call
      const sessionData = await checkSessionApi();
      // Then update the store to sync state
      await checkAuth();
      return sessionData;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFirstTimeSetup() {
  return useMutation({
    mutationFn: (data: ResetPasswordInput) => firstTimeSetupApi(data),
  });
}
