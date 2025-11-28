import { useMemo } from 'react';
import type { Robot } from '@/types/robot';
import { sortMissions } from '../utils/missionSort';
import { useRobotMissionsQuery } from './useRobotMissionsQuery';

export function useRobotMissions(robots: Robot[], activeMapId: string | null) {
  const { data: allMissions = [], isLoading, error } = useRobotMissionsQuery();

  const missionsWithRobots = useMemo(
    () =>
      allMissions.map(mission => ({
        ...mission,
        availableRobots: robots.filter(r => r.mapId === mission.mapId),
      })),
    [allMissions, robots]
  );

  const prioritizedMissions = useMemo(() => {
    return sortMissions(missionsWithRobots, activeMapId);
  }, [activeMapId, missionsWithRobots]);

  return {
    missions: prioritizedMissions,
    loading: isLoading,
    error,
  };
}
