import type { TeleopCommand } from '@/types/telemetry';

// This function represents sending teleop commands via WebSocket
// In a real implementation, this would likely interface with the robotTelemetry store
export const sendTeleopCommand = async (
  _robotId: string,
  _command: TeleopCommand
): Promise<void> => {
  // This is a placeholder - in the actual implementation, this would interface with the WebSocket client
  // through the robotTelemetry store. The actual sending happens via WebSocket, not HTTP
  console.warn(
    'sendTeleopCommand is a WebSocket operation - implementation depends on store integration'
  );
  throw new Error('Not implemented: sendTeleopCommand is WebSocket-based');
};
