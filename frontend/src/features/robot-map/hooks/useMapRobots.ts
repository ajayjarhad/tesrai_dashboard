import { useMemo } from 'react';
import type { Robot } from '@/types/robot';

export function useMapRobots(robots: Robot[], activeMapId: string | null) {
  return useMemo(
    () => robots.filter(r => !activeMapId || r.mapId === activeMapId),
    [robots, activeMapId]
  );
}
