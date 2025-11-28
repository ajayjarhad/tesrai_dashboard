import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { TeleopCommand } from '@/types/telemetry';

interface VirtualJoystickProps {
  sendTeleop: (command: TeleopCommand) => void; // Callback to update parent state
  className?: string;
  style?: CSSProperties;
  linear?: number;
  angular?: number;
}

const MAX_LINEAR = 0.333333; // fixed linear m/s
const MAX_ANGULAR = 0.333333; // fixed angular rad/s
const DEADZONE = 0.05; // pointer deadzone for small jitters
const KNOB_SIZE = 56; // px (tailwind h-14)
const POINTER_GAIN = 1.8; // amplifies drag so knob reaches edge quickly

export function VirtualJoystick({
  sendTeleop,
  className,
  style,
  linear,
  angular,
}: VirtualJoystickProps) {
  const padRef = useRef<HTMLDivElement>(null);
  const [pointerActive, setPointerActive] = useState(false);
  const pointerIdRef = useRef<number | null>(null);
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const zeroCommand: TeleopCommand = {
    linear: { x: 0, y: 0, z: 0 },
    angular: { x: 0, y: 0, z: 0 },
  };

  const clampOffset = useCallback((x: number, y: number, allowed: number) => {
    if (allowed <= 0) return { x: 0, y: 0 };
    const mag = Math.hypot(x, y);
    if (mag <= allowed) return { x, y };
    const scale = allowed / mag;
    return { x: x * scale, y: y * scale };
  }, []);

  const updateVectorFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const pad = padRef.current;
      if (!pad) return;

      const rect = pad.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const radius = rect.width / 2;
      const distance = Math.min(Math.hypot(dx, dy), radius);
      const allowed = Math.max(0, radius - KNOB_SIZE / 2);

      const normX = radius ? dx / radius : 0; // right is +, left is -
      const normY = radius ? dy / radius : 0; // down is +, up is -

      const scaledX = Math.max(-1, Math.min(1, normX * POINTER_GAIN));
      const scaledY = Math.max(-1, Math.min(1, normY * POINTER_GAIN));

      const linear = Math.abs(scaledY) > DEADZONE ? -Math.sign(scaledY) * MAX_LINEAR : 0;
      // ROS positive angular.z = left turn; invert so dragging right turns right (negative).
      const angular = Math.abs(scaledX) > DEADZONE ? -Math.sign(scaledX) * MAX_ANGULAR : 0;

      // Send updated command to parent
      sendTeleop({
        linear: { x: linear, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: angular },
      });

      const rawX = scaledX * allowed * (radius ? Math.min(1, distance / radius) : 0);
      const rawY = scaledY * allowed * (radius ? Math.min(1, distance / radius) : 0);
      setKnobOffset(clampOffset(rawX, rawY, allowed));
    },
    [clampOffset, sendTeleop]
  );

  // Reflect external velocity (e.g., keyboard) on the knob
  useEffect(() => {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const radius = rect.width / 2;
    const allowed = Math.max(24, radius - KNOB_SIZE / 2);
    if (!allowed || allowed <= 0) return;

    const lin = linear ?? 0;
    const ang = angular ?? 0;

    const normX = Math.max(-1, Math.min(1, -(ang / MAX_ANGULAR || 0))); // invert to match right=negative
    const normY = Math.max(-1, Math.min(1, -(lin / MAX_LINEAR || 0))); // up is negative

    const rawX = normX * allowed;
    const rawY = normY * allowed;
    setKnobOffset(clampOffset(rawX, rawY, allowed));
  }, [angular, clampOffset, linear]);

  // Pointer (touch/mouse) handling
  useEffect(() => {
    if (!pointerActive) return;

    const handleMove = (event: PointerEvent) => {
      if (pointerIdRef.current !== null && event.pointerId !== pointerIdRef.current) return;
      updateVectorFromPointer(event.clientX, event.clientY);
    };

    const handleUp = (event: PointerEvent) => {
      if (pointerIdRef.current !== null && event.pointerId !== pointerIdRef.current) return;
      pointerIdRef.current = null;
      setPointerActive(false);
      // Send zero command when released
      sendTeleop(zeroCommand);
      setKnobOffset({ x: 0, y: 0 });
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [pointerActive, updateVectorFromPointer, sendTeleop]);

  return (
    <div className={cn('relative w-full aspect-square', className)} style={style}>
      <div
        ref={padRef}
        className={cn(
          'absolute inset-0 rounded-full border border-border/80 bg-muted',
          'shadow-inner flex items-center justify-center touch-none'
        )}
        onPointerDown={event => {
          event.preventDefault();
          setPointerActive(true);
          pointerIdRef.current = event.pointerId;
          updateVectorFromPointer(event.clientX, event.clientY);
        }}
      >
        <div className="absolute inset-[18%] rounded-full border border-border/60 opacity-50 pointer-events-none bg-white/10" />
        <div className="absolute inset-[36%] rounded-full border border-border/40 opacity-30 pointer-events-none bg-white/5" />
        <div
          className={cn(
            'absolute h-16 w-16 rounded-full',
            'bg-green-500 text-white',
            'shadow-[0_14px_30px_rgba(0,0,0,0.15)] border-4 border-green-200 ring-2 ring-green-200/80',
            'transition-transform duration-75 ease-linear will-change-transform'
          )}
          style={{
            transform: `translate(calc(-50% + ${knobOffset.x}px), calc(-50% + ${knobOffset.y}px))`,
            left: '50%',
            top: '50%',
          }}
        />
        <div className="pointer-events-none absolute h-28 w-28 rounded-full bg-green-400/15 blur-xl" />
      </div>
    </div>
  );
}
