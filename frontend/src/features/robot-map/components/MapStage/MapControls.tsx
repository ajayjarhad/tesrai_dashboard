import { Maximize, Minus, Plus, RotateCcw, RotateCw } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onRecenter: () => void;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onRotateLeft,
  onRotateRight,
  onRecenter,
}: MapControlsProps) {
  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20">
      <div className="flex flex-col gap-3 bg-card/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-border">
        <div className="flex flex-col gap-2 border-b border-border/60 pb-3 mb-1">
          <button
            type="button"
            onClick={onZoomIn}
            className="p-2 hover:bg-muted rounded-md transition-colors text-foreground/80"
            aria-label="Zoom in"
            title="Zoom In"
          >
            <Plus size={20} />
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            className="p-2 hover:bg-muted rounded-md transition-colors text-foreground/80"
            aria-label="Zoom out"
            title="Zoom Out"
          >
            <Minus size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-2 border-b border-border/60 pb-3 mb-1">
          <button
            type="button"
            onClick={onRotateLeft}
            className="p-2 hover:bg-muted rounded-md transition-colors text-foreground/80"
            aria-label="Rotate left"
            title="Rotate Left"
          >
            <RotateCcw size={20} />
          </button>
          <button
            type="button"
            onClick={onRotateRight}
            className="p-2 hover:bg-muted rounded-md transition-colors text-foreground/80"
            aria-label="Rotate right"
            title="Rotate Right"
          >
            <RotateCw size={20} />
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={onRecenter}
            className="p-2 hover:bg-muted rounded-md transition-colors text-foreground/80"
            aria-label="Recenter"
            title="Recenter Map"
          >
            <Maximize size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
