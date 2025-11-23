import { useOccupancyMap } from '../hooks/useOccupancyMap';
import { MapStage } from './MapStage';

interface OccupancyMapProps {
  mapId: string;
  onMapChange?: (mapId: string) => void;
  enablePanning?: boolean;
  enableZooming?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function OccupancyMap({
  mapId,
  enablePanning = true,
  enableZooming = true,
  width = '100%',
  height = '100%',
  className,
}: OccupancyMapProps) {
  const mapState = useOccupancyMap({
    mapId,
    autoLoad: true,
    useOptimizedParser: true,
  });

  if (mapState.loading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className || ''}`}
        style={{ width, height }}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  if (mapState.error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className || ''}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-red-500 mb-2">Failed to load map</div>
          <div className="text-sm text-gray-400">{mapState.error}</div>
        </div>
      </div>
    );
  }

  return (
    <MapStage
      mapData={mapState.data}
      width={width}
      height={height}
      className={className || ''}
      enablePanning={enablePanning}
      enableZooming={enableZooming}
    />
  );
}
