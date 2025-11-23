import { useState } from 'react';
import type { Robot } from '../../../types/robot';
import { EmergencyHeader } from '../../emergency-stop/emergency-header';
import { useRobots } from '../hooks/useRobots';
import { OccupancyMap } from './OccupancyMap';
import { RobotSidebar } from './RobotSidebar';

export function Dashboard() {
  const { data: robots = [] } = useRobots();
  const [selectedRobotId, setSelectedRobotId] = useState<string | null>(null);
  const [activeMapId, setActiveMapId] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize active map from first robot if available
  if (!activeMapId && robots.length > 0 && robots[0].mapId) {
    setActiveMapId(robots[0].mapId);
  }

  const handleSelectRobot = (robot: Robot | null) => {
    setSelectedRobotId(robot?.id ?? null);
    if (robot?.mapId) {
      setActiveMapId(robot.mapId);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-100 relative">
      <EmergencyHeader className="flex-shrink-0 z-20 relative" />
      <div className="flex flex-1 overflow-hidden relative w-full">
        <div className="flex-1 relative min-w-0">
          {activeMapId ? (
            <OccupancyMap
              mapId={activeMapId}
              onMapChange={setActiveMapId}
              width="100%"
              height="100%"
              enablePanning={true}
              enableZooming={true}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              {robots.length > 0 ? 'Select a robot to view map' : 'No robots available'}
            </div>
          )}
        </div>

        <RobotSidebar
          robots={robots}
          selectedRobotId={selectedRobotId}
          onSelectRobot={handleSelectRobot}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex-shrink-0 border-l border-gray-200 bg-white z-10 shadow-xl"
        />
      </div>
    </div>
  );
}
