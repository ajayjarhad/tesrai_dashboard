import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getMissions } from '../api';

export function useRobotMissionsQuery() {
  return useQuery({
    queryKey: queryKeys.missions.lists,
    queryFn: getMissions,
    staleTime: 30000, // 30 seconds
  });
}
