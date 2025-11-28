import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  title?: string;
}

export function SidebarHeader({ isOpen, onToggle, title = 'Robots' }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/60 min-w-[20rem]">
      <h2
        className={cn(
          'font-semibold text-foreground transition-opacity duration-200 whitespace-nowrap',
          !isOpen && 'opacity-0 hidden'
        )}
      >
        {title}
      </h2>
      <button
        type="button"
        onClick={onToggle}
        className="p-1 hover:bg-muted rounded-md transition-colors"
        title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
      >
        {isOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </div>
  );
}
