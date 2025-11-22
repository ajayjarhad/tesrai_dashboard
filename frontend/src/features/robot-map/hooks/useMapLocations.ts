import type { ProcessedMapData } from '@tensrai/shared';
import Konva from 'konva';
import { nanoid } from 'nanoid';
import { type RefObject, useCallback, useEffect, useState } from 'react';

export type LocationMode = 'idle' | 'placing' | 'editing';

export interface TempLocation {
  id: string;
  x: number;
  y: number;
  rotation: number;
}

interface UseMapLocationsProps {
  mapData: ProcessedMapData | null;
  mapGroupRef: RefObject<Konva.Group | null>;
  pinRef: RefObject<Konva.Group | null>;
  transformerRef: RefObject<Konva.Transformer | null>;
}

export function useMapLocations({
  mapData,
  mapGroupRef,
  pinRef,
  transformerRef,
}: UseMapLocationsProps) {
  const [locations, setLocations] = useState<TempLocation[]>([]);
  const [locationMode, setLocationMode] = useState<LocationMode>('placing');
  const [tempLocation, setTempLocation] = useState<TempLocation | null>(null);

  const handleAddLocation = useCallback(() => {
    setLocationMode('placing');
    setTempLocation(null);
  }, []);

  const saveAndExitLocationMode = useCallback(() => {
    if (!tempLocation || !mapData) {
      setLocationMode('idle');
      setTempLocation(null);
      return;
    }

    // Get final rotation from ref if available (since transformer updates node directly)
    let finalRotation = tempLocation.rotation;
    if (pinRef.current) {
      finalRotation = pinRef.current.rotation();
    }

    setLocations(prev => [...prev, { ...tempLocation, rotation: finalRotation }]);

    setLocationMode('idle');
    setTempLocation(null);
  }, [tempLocation, mapData, pinRef]);

  const handlePlacingClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      const group = mapGroupRef.current;
      if (!stage || !group) return;

      const pointerPos = group.getRelativePointerPosition();
      if (pointerPos) {
        setTempLocation({
          id: nanoid(),
          x: pointerPos.x,
          y: pointerPos.y,
          rotation: 0,
        });
        setLocationMode('editing');
      }
    },
    [mapGroupRef]
  );

  const handleEditingClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const clickedOnPin = e.target.getParent() === pinRef.current || e.target === pinRef.current;
      const clickedOnTransformer = e.target.getParent() instanceof Konva.Transformer;

      if (!clickedOnPin && !clickedOnTransformer) {
        saveAndExitLocationMode();
      }
    },
    [pinRef, saveAndExitLocationMode]
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (locationMode === 'placing') {
        handlePlacingClick(e);
      } else if (locationMode === 'editing') {
        handleEditingClick(e);
      }
    },
    [locationMode, handlePlacingClick, handleEditingClick]
  );

  useEffect(() => {
    const handleEditingKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        saveAndExitLocationMode();
      } else if (e.key === 'Escape') {
        setLocationMode('idle');
        setTempLocation(null);
      }
    };

    const handlePlacingKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLocationMode('idle');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (locationMode === 'editing') {
        handleEditingKeyDown(e);
      } else if (locationMode === 'placing') {
        handlePlacingKeyDown(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [locationMode, saveAndExitLocationMode]);

  useEffect(() => {
    if (locationMode === 'editing' && transformerRef.current && pinRef.current) {
      transformerRef.current.nodes([pinRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [locationMode, transformerRef, pinRef]);

  return {
    locations,
    locationMode,
    tempLocation,
    handleAddLocation,
    handleStageClick,
  };
}
