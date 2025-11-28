import { useEffect, useRef } from 'react';
import type { TeleopCommand } from '@/types/telemetry';

interface KeyboardControlsProps {
  sendTeleop: (command: TeleopCommand) => void; // Callback to update parent state
}

const MAX_LINEAR = 0.333333; // fixed linear m/s
const MAX_ANGULAR = 0.333333; // fixed angular rad/s

export function KeyboardControls({ sendTeleop }: KeyboardControlsProps) {
  const keysRef = useRef<Set<string>>(new Set());
  const zeroCommand: TeleopCommand = {
    linear: { x: 0, y: 0, z: 0 },
    angular: { x: 0, y: 0, z: 0 },
  };

  useEffect(() => {
    const updateVectorFromKeys = () => {
      const keys = keysRef.current;
      const forward = keys.has('w') || keys.has('arrowup');
      const backward = keys.has('s') || keys.has('arrowdown');
      const left = keys.has('a') || keys.has('arrowleft');
      const right = keys.has('d') || keys.has('arrowright');

      const linearDir = (forward ? 1 : 0) - (backward ? 1 : 0);
      let angular = 0;
      if (left && !right) {
        angular = MAX_ANGULAR; // left turn = positive angular.z
      } else if (right && !left) {
        angular = -MAX_ANGULAR; // right turn = negative angular.z
      }

      const linear = linearDir * MAX_LINEAR;

      sendTeleop({
        linear: { x: linear, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: angular },
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const handled =
        key === 'w' || key === 'a' || key === 's' || key === 'd' || key.startsWith('arrow');

      if (!handled) return;

      if (event.target instanceof HTMLElement) {
        const tag = event.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (event.target.isContentEditable) return;
      }

      event.preventDefault();
      if (!keysRef.current.has(key)) {
        keysRef.current.add(key);
        updateVectorFromKeys();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (keysRef.current.has(key)) {
        keysRef.current.delete(key);
        updateVectorFromKeys();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      // Send zero command when unmounting
      sendTeleop(zeroCommand);
    };
  }, [sendTeleop]);

  return (
    <div className="text-center text-sm text-muted-foreground">
      <div className="flex justify-center mb-1">
        <kbd className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs font-mono">W</kbd>
      </div>
      <div className="flex justify-center gap-4 mb-1">
        <kbd className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs font-mono">A</kbd>
        <kbd className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs font-mono">S</kbd>
        <kbd className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs font-mono">D</kbd>
      </div>
      <p className="text-xs">Use WASD or Arrow Keys for control</p>
    </div>
  );
}
