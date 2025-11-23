import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Robot } from '../../../types/robot';

interface RobotsResponse {
  success: boolean;
  data: Robot[];
}

const fetchRobots = async (): Promise<Robot[]> => {
  const result = await apiClient.get<RobotsResponse>('robots');
  return result.data;
};

export function useRobots() {
  return useQuery({
    queryKey: ['robots'],
    queryFn: fetchRobots,
    refetchInterval: 1000, // Poll every second for real-time updates
  });
}
