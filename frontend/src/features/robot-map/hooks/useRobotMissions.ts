import type { ProcessedMapData } from '@tensrai/shared';
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { Robot } from '@/types/robot';
import type { MissionWithContext } from '../components/MissionDialog';
import { sortMissions } from '../utils/missionSort';

export function useRobotMissions(robots: Robot[], activeMapId: string | null) {
  const [allMissions, setAllMissions] = useState<MissionWithContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMissions() {
      try {
        setLoading(true);
        const mapsRes = await apiClient.get<{ data: { id: string; name: string }[] }>('maps');
        const maps = mapsRes?.data ?? [];

        const missionEntries: MissionWithContext[] = [];

        for (const map of maps) {
          try {
            const mapDetail = await apiClient.get<{
              data?: { features?: ProcessedMapData['features'] };
            }>(`maps/${map.id}`);

            const features = mapDetail?.data?.features;
            if (features?.missions?.length) {
              const locationTags = features.locationTags ?? [];
              features.missions.forEach(mission => {
                missionEntries.push({
                  id: mission.id,
                  name: mission.name,
                  steps: Array.isArray(mission.steps) ? mission.steps : [],
                  mapId: map.id,
                  mapName: map.name,
                  locationTags,
                  availableRobots: [], // Will be populated in useMemo
                });
              });
            }
          } catch (err) {
            console.error('Failed to load map missions', map.id, err);
          }
        }

        if (!cancelled) {
          setAllMissions(missionEntries);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load missions', err);
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load missions'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMissions();

    return () => {
      cancelled = true;
    };
  }, []);

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
    loading,
    error,
  };
}
