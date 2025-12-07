import { create } from 'zustand';
import { odomToPose } from '../lib/map/telemetryTransforms';
import { type ConnectionStatus, createRobotWsClient } from '../services/robotWsClient';
import type {
  EmergencyCommand,
  LaserScan,
  ModeCommand,
  PathMessage,
  Pose2D,
  TeleopCommand,
} from '../types/telemetry';

type RobotTelemetry = {
  pose?: Pose2D;
  odomPose?: Pose2D;
  amclPose?: Pose2D;
  laser?: LaserScan;
  path?: PathMessage;
  lastMessageAt?: number;
  lastOdomAt?: number;
  lastAmclAt?: number;
  status: ConnectionStatus;
  poseSource?: 'odom' | 'amcl';
};

type TelemetryState = {
  telemetry: Record<string, RobotTelemetry>;
  connect: (robotId: string) => void;
  disconnect: (robotId: string) => void;
  sendTeleop: (robotId: string, command: TeleopCommand) => void;
  sendMode: (robotId: string, command: ModeCommand) => void;
  sendEmergency: (robotId: string, command: EmergencyCommand) => void;
  sendInitialPose: (robotId: string, message: unknown) => void;
};

const clients = new Map<string, ReturnType<typeof createRobotWsClient>>();

export const useRobotTelemetryStore = create<TelemetryState>(set => ({
  telemetry: {},

  connect: (robotId: string) => {
    if (!robotId) return;
    if (clients.has(robotId)) return;

    const client = createRobotWsClient(robotId);
    clients.set(robotId, client);

    client.addStatusListener(status => {
      set(state => ({
        telemetry: {
          ...state.telemetry,
          [robotId]: {
            ...(state.telemetry[robotId] ?? { status: 'disconnected' }),
            status,
          },
        },
      }));
    });

    client.addEventListener(event => {
      if (event.type !== 'event') return;

      set(state => {
        const current = state.telemetry[robotId] ?? { status: client.getStatus() };
        const next: RobotTelemetry = { ...current, lastMessageAt: Date.now() };

        if (event.channel === 'odom') {
          try {
            // Always drive pose from odom to avoid AMCL snap/auto-orient.
            next.odomPose = odomToPose(event.data as any);
            next.lastOdomAt = Date.now();
          } catch {
            // ignore bad odom
          }
        } else if (event.channel === 'amcl') {
          try {
            const amcl = event.data as { pose?: { pose?: any } };
            if (amcl?.pose?.pose) {
              next.amclPose = odomToPose(amcl as any);
              next.lastAmclAt = Date.now();
            }
          } catch {
            // ignore bad amcl
          }
        } else if (event.channel === 'laser') {
          next.laser = event.data as LaserScan;
        } else if (event.channel === 'waypoints') {
          next.path = event.data as PathMessage;
        } else if (event.channel === 'state') {
          // optional: map to status; for now, leave as is
        }

        if (next.amclPose) {
          next.pose = next.amclPose;
          next.poseSource = 'amcl';
        } else if (next.odomPose) {
          next.pose = next.odomPose;
          next.poseSource = 'odom';
        }

        return {
          telemetry: {
            ...state.telemetry,
            [robotId]: next,
          },
        };
      });
    });

    client.connect();
  },

  disconnect: (robotId: string) => {
    const client = clients.get(robotId);
    if (client) {
      client.disconnect();
      clients.delete(robotId);
    }
    set(state => {
      const next = { ...state.telemetry };
      delete next[robotId];
      return { telemetry: next };
    });
  },

  sendTeleop: (robotId: string, command: TeleopCommand) => {
    const client = clients.get(robotId);
    client?.sendCommand('teleop', command);
  },

  sendMode: (robotId: string, command: ModeCommand) => {
    const client = clients.get(robotId);
    client?.sendCommand('mode', command);
  },

  sendEmergency: (robotId: string, command: EmergencyCommand) => {
    const client = clients.get(robotId);
    client?.sendCommand('emergency', command);
  },

  sendInitialPose: (robotId: string, message: unknown) => {
    const client = clients.get(robotId);
    client?.sendCommand('initialpose', message);
  },
}));
