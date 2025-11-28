import { MapToolbar } from './MapToolbar';

interface MapOverlayProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onRecenter?: () => void;
}

export function MapOverlay({
  onZoomIn,
  onZoomOut,
  onRotateLeft,
  onRotateRight,
  onRecenter,
}: MapOverlayProps) {
  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2">
      <MapToolbar
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onRotateLeft={onRotateLeft}
        onRotateRight={onRotateRight}
        onRecenter={onRecenter}
      />
    </div>
  );
}
