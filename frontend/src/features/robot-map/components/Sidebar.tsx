import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../../lib/utils';
import type { Robot } from '../../../types/robot';
import { MissionDialog, type MissionWithContext } from './MissionDialog';
import { AdminMenu } from './Sidebar/AdminMenu';
import { MissionActions } from './Sidebar/MissionActions';
import { RobotDetails } from './Sidebar/RobotDetails';
import { RobotList } from './Sidebar/RobotList';
import { SidebarHeader } from './Sidebar/SidebarHeader';

interface SidebarProps {
  robots: Robot[];
  selectedRobotId: string | null;
  onSelectRobot: (robot: Robot | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
  missions?: MissionWithContext[];
  isMissionPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onManualControl?: () => void;
  onSetPose?: () => void;
}

export function Sidebar({
  robots,
  selectedRobotId,
  onSelectRobot,
  isOpen,
  onToggle,
  className,
  missions,
  isMissionPaused,
  onPause,
  onResume,
  onCancel,
  onManualControl,
  onSetPose,
}: SidebarProps) {
  const [missionDialogOpen, setMissionDialogOpen] = useState(false);
  const selectedRobot = robots.find(r => r.id === selectedRobotId);
  const mapName = selectedRobot?.mapId
    ? missions?.find(m => m.mapId === selectedRobot.mapId)?.mapName
    : undefined;

  const handleStartMission = (missionId: string) => {
    console.log('Start mission', missionId);
    setMissionDialogOpen(false); // Close dialog after starting mission
  };

  return (
    <div
      className={cn(
        'relative flex flex-col h-full bg-card border-l border-border shadow-xl transition-all duration-300 ease-in-out overflow-hidden',
        className
      )}
      style={{ width: isOpen ? '20rem' : '4rem' }}
    >
      <SidebarHeader isOpen={isOpen} onToggle={onToggle} />

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Collapsed View - Icons Only */}
        {!isOpen && (
          <RobotList
            robots={robots}
            selectedRobotId={selectedRobotId}
            onSelectRobot={onSelectRobot}
            isOpen={isOpen}
          />
        )}

        {/* Expanded View */}
        {isOpen && selectedRobot ? (
          <div className="p-4 min-w-[20rem] h-full flex flex-col gap-6">
            <button
              type="button"
              onClick={() => onSelectRobot(null)}
              className="flex items-center text-sm mb-4"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to List
            </button>

            <RobotDetails robot={selectedRobot} mapName={mapName ?? ''} />

            <MissionActions
              isOpen={isOpen}
              isMissionPaused={isMissionPaused ?? false}
              onPause={onPause}
              onResume={onResume}
              onCancel={onCancel}
              onManualControl={onManualControl}
              onSetPose={onSetPose}
            />
          </div>
        ) : isOpen ? (
          <RobotList
            robots={robots}
            selectedRobotId={selectedRobotId}
            onSelectRobot={onSelectRobot}
            isOpen={isOpen}
          />
        ) : null}
      </div>

      <AdminMenu
        isOpen={isOpen}
        onToggle={onToggle}
        missions={missions ?? []}
        onOpenMissionDialog={() => setMissionDialogOpen(true)}
      />

      <MissionDialog
        open={missionDialogOpen}
        onOpenChange={setMissionDialogOpen}
        missions={missions ?? []}
        onStartMission={handleStartMission}
      />
    </div>
  );
}
