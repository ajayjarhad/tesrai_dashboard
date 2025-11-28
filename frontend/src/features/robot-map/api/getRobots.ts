import { apiClient } from '@/lib/api';
import type { Robot } from '../../../types/robot';

interface RobotsResponse {
  success: boolean;
  data: Robot[];
}

export const getRobots = async (): Promise<Robot[]> => {
  const result = await apiClient.get<RobotsResponse>('robots');
  return result.data;
};
