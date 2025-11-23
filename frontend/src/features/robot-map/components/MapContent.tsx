import type { ProcessedMapData } from '@tensrai/shared';
import type Konva from 'konva';
import type { RefObject } from 'react';
import { Group, Image as KonvaImage, Layer, Stage } from 'react-konva';
import type { TempLocation } from '../hooks/useMapLocations';
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
  enablePanning: boolean;
  handleWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void;
}

export function MapContent({
  stageRef,
  mapGroupRef,
  width,
  height,
  mapData,
  mapImage,
  rotation,
  locations,
  enablePanning,
  handleWheel,
}: MapContentProps) {
  const { width: mapWidth, height: mapHeight } = mapData.meta;

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      draggable={enablePanning}
      onWheel={handleWheel}
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
        </Group>
      </Layer>
    </Stage>
  );
}
