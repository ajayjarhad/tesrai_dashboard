import type { ProcessedMapData } from '@tensrai/shared';
import type Konva from 'konva';
import { type RefObject, useCallback, useState } from 'react';

interface UseMapInteractionReturn {
  rotation: number;
  zoomBy: (direction: 'in' | 'out') => void;
  rotateStage: (angle: number) => void;
  resetView: () => void;
  stageRef: React.RefObject<Konva.Stage | null>;
}

export function useMapInteraction(
  _mapData: ProcessedMapData | null,
  fitStageToMap: () => void,
  onScaleChange?: (scale: number) => void,
  stageRef?: RefObject<Konva.Stage | null>
): UseMapInteractionReturn {
  const [rotation, setRotation] = useState(0);

  const zoomBy = useCallback(
    (direction: 'in' | 'out') => {
      const stage = stageRef?.current;
      if (!stage) return;

      const oldScale = stage.scaleX();
      const scaleBy = 1.2;
      const newScale = direction === 'in' ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(0.1, Math.min(10, newScale));

      const center = {
        x: stage.width() / 2,
        y: stage.height() / 2,
      };

      const relatedTo = {
        x: (center.x - stage.x()) / oldScale,
        y: (center.y - stage.y()) / oldScale,
      };

      const newPos = {
        x: center.x - relatedTo.x * clampedScale,
        y: center.y - relatedTo.y * clampedScale,
      };

      stage.scale({ x: clampedScale, y: clampedScale });
      stage.position(newPos);
      stage.batchDraw();
      onScaleChange?.(clampedScale);
    },
    [onScaleChange, stageRef]
  );

  const rotateStage = useCallback((angle: number) => {
    setRotation(prev => {
      const newRotation = (prev + angle) % 360;
      return newRotation;
    });
  }, []);

  const resetView = useCallback(() => {
    fitStageToMap();
    setRotation(0);
  }, [fitStageToMap]);

  return {
    rotation,
    zoomBy,
    rotateStage,
    resetView,
    stageRef: stageRef || { current: null },
  };
}
