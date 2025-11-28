import { Battery, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Robot } from '@/types/robot';

interface RobotDetailsProps {
  robot: Robot;
  mapName?: string;
}

export function RobotDetails({ robot, mapName }: RobotDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold text-foreground">{robot.name}</h3>
        <div className="flex items-center mt-2 space-x-2">
          <span
            className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              robot.status === 'MISSION'
                ? 'bg-status-active/15 text-status-active'
                : robot.status.includes('EMERGENCY')
                  ? 'bg-status-error/15 text-status-error'
                  : 'bg-status-offline/20 text-status-offline'
            )}
          >
            {robot.status}
          </span>
          <span className="text-xs text-muted-foreground">
            Last seen: {new Date(robot.lastSeen).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center text-muted-foreground mb-1">
            <Battery className="w-4 h-4 mr-2" />
            <span className="text-xs font-medium">Battery</span>
          </div>
          <span className="text-lg font-semibold">
            {robot.battery !== undefined ? `${robot.battery}%` : '--'}
          </span>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center text-muted-foreground mb-1">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-xs font-medium">Map</span>
          </div>
          <span className="text-lg font-semibold uppercase">{mapName || robot.mapId || '--'}</span>
        </div>
      </div>
    </div>
  );
}
