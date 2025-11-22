import { MapToolbar } from './MapToolbar';

interface MapOverlayProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onRecenter: () => void;
  onAddLocation: () => void;
  locationMode: 'idle' | 'placing' | 'editing';
  onSelectMap?: ((mapId: 'r1' | 'r2') => void) | undefined;
  selectedMapId?: 'r1' | 'r2' | undefined;
}

export function MapOverlay({
  onZoomIn,
  onZoomOut,
  onRotateLeft,
  onRotateRight,
  onRecenter,
  onAddLocation,
  locationMode,
  onSelectMap,
  selectedMapId,
}: MapOverlayProps) {
  return (
    <>
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <MapToolbar
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onRotateLeft={onRotateLeft}
          onRotateRight={onRotateRight}
          onRecenter={onRecenter}
          onAddLocation={onAddLocation}
          isAddingLocation={locationMode === 'placing'}
          onSelectMap={onSelectMap}
          selectedMapId={selectedMapId}
        />
      </div>

      {locationMode !== 'idle' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-full text-sm font-medium pointer-events-none">
          {locationMode === 'placing'
            ? 'Click on map to place tag'
            : 'Rotate tag, then press Enter to save'}
        </div>
      )}
    </>
  );
}
