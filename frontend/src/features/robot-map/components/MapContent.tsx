import type { ProcessedMapData } from '@tensrai/shared';
import type Konva from 'konva';
import type { RefObject } from 'react';
import { Group, Image as KonvaImage, Layer, Stage, Transformer } from 'react-konva';
import type { LocationMode, TempLocation } from '../hooks/useMapLocations';
import { LocationPin } from './LocationPin';

interface MapContentProps {
  stageRef: RefObject<Konva.Stage | null>;
  mapGroupRef: RefObject<Konva.Group | null>;
  pinRef: RefObject<Konva.Group | null>;
  transformerRef: RefObject<Konva.Transformer | null>;
  width: number;
  height: number;
  mapData: ProcessedMapData;
  mapImage: HTMLImageElement | ImageBitmap | HTMLCanvasElement | undefined;
  rotation: number;
  locations: TempLocation[];
  tempLocation: TempLocation | null;
  locationMode: LocationMode;
  enablePanning: boolean;
  handleWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void;
  handleStageClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export function MapContent({
  stageRef,
  mapGroupRef,
  pinRef,
  transformerRef,
  width,
  height,
  mapData,
  mapImage,
  rotation,
  locations,
  tempLocation,
  locationMode,
  enablePanning,
  handleWheel,
  handleStageClick,
}: MapContentProps) {
  const { width: mapWidth, height: mapHeight } = mapData.meta;

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      draggable={enablePanning && locationMode === 'idle'}
      onWheel={handleWheel}
      onClick={handleStageClick}
      onTap={handleStageClick}
    >
      <Layer>
        <Group
          ref={mapGroupRef}
          x={mapWidth / 2}
          y={mapHeight / 2}
          offsetX={mapWidth / 2}
          offsetY={mapHeight / 2}
          rotation={rotation}
        >
          {mapImage && <KonvaImage image={mapImage} width={mapWidth} height={mapHeight} />}

          {locations.map(loc => (
            <LocationPin key={loc.id} x={loc.x} y={loc.y} rotation={loc.rotation} />
          ))}

          {tempLocation && (
            <>
              <LocationPin
                ref={pinRef}
                x={tempLocation.x}
                y={tempLocation.y}
                rotation={tempLocation.rotation}
              />
              {locationMode === 'editing' && (
                <Transformer
                  ref={transformerRef}
                  resizeEnabled={false}
                  rotateEnabled={true}
                  enabledAnchors={[]}
                  rotateAnchorOffset={20}
                />
              )}
            </>
          )}
        </Group>
      </Layer>
    </Stage>
  );
}
