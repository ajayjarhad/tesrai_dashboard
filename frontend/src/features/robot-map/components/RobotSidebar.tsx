import { Battery, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Robot } from '../../../types/robot';

interface RobotSidebarProps {
  robots: Robot[];
  selectedRobotId: string | null;
  onSelectRobot: (robot: Robot | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function RobotSidebar({
  robots,
  selectedRobotId,
  onSelectRobot,
  isOpen,
  onToggle,
  className,
}: RobotSidebarProps) {
  const selectedRobot = robots.find(r => r.id === selectedRobotId);

  return (
    <div
      className={cn(
        'relative flex flex-col h-full bg-white border-l border-gray-200 shadow-xl transition-all duration-300 ease-in-out overflow-hidden',
        className
      )}
      style={{ width: isOpen ? '20rem' : '4rem' }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 min-w-[20rem]">
        <h2
          className={cn(
            'font-semibold text-gray-900 transition-opacity duration-200 whitespace-nowrap',
            !isOpen && 'opacity-0 hidden'
          )}
        >
          Robots
        </h2>
        <button
          type="button"
          onClick={onToggle}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Collapsed View - Icons Only */}
        {!isOpen && (
          <div className="flex flex-col items-center py-4 space-y-4 w-16 mx-auto">
            {robots.map(robot => (
              <button
                type="button"
                key={robot.id}
                onClick={() => {
                  if (!isOpen) onToggle();
                  onSelectRobot(robot);
                }}
                className={cn(
                  'w-10 h-10 flex items-center justify-center rounded-full transition-colors relative',
                  selectedRobotId === robot.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50 text-gray-500'
                )}
                title={robot.name}
              >
                <div
                  className={cn(
                    'absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white',
                    robot.status === 'MISSION'
                      ? 'bg-green-500'
                      : robot.status.includes('EMERGENCY')
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                  )}
                />
                <span className="text-xs font-bold">{robot.name.substring(0, 2)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Expanded View */}
        {isOpen &&
          (selectedRobot ? (
            <div className="p-4 space-y-6 min-w-[20rem]">
              <button
                type="button"
                onClick={() => onSelectRobot(null)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to List
              </button>

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedRobot.name}</h3>
                  <div className="flex items-center mt-2 space-x-2">
                    <span
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        selectedRobot.status === 'MISSION'
                          ? 'bg-green-100 text-green-800'
                          : selectedRobot.status.includes('EMERGENCY')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {selectedRobot.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      Last seen: {new Date(selectedRobot.lastSeen).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-1">
                      <Battery className="w-4 h-4 mr-2" />
                      <span className="text-xs font-medium">Battery</span>
                    </div>
                    <span className="text-lg font-semibold">
                      {selectedRobot.battery !== undefined ? `${selectedRobot.battery}%` : '--'}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-1">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-xs font-medium">Map</span>
                    </div>
                    <span className="text-lg font-semibold uppercase">
                      {selectedRobot.name || '--'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 min-w-[20rem]">
              {robots.map(robot => (
                <button
                  key={robot.id}
                  type="button"
                  onClick={() => onSelectRobot(robot)}
                  className={cn(
                    'w-full text-left p-4 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50',
                    selectedRobotId === robot.id && 'bg-blue-50 hover:bg-blue-50'
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900">{robot.name}</span>
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full mt-2',
                        robot.status === 'MISSION'
                          ? 'bg-green-500'
                          : robot.status.includes('EMERGENCY')
                            ? 'bg-red-500'
                            : 'bg-gray-400'
                      )}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{robot.status}</span>
                    <span>{robot.battery !== undefined ? `${robot.battery}%` : ''}</span>
                  </div>
                </button>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
