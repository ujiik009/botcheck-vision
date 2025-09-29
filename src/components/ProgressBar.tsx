import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { STAGE_PROGRESS, getStageColor, getStageName } from '../types';
import type { JobStage } from '../types';

interface ProgressBarProps {
  stage: JobStage;
  percent?: number;
  className?: string;
}

export function ProgressBar({ stage, percent, className }: ProgressBarProps) {
  // Use provided percent or estimate based on stage
  const progress = percent ?? STAGE_PROGRESS[stage];
  const stageColor = getStageColor(stage);
  const stageName = getStageName(stage);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-mono text-xs">{progress}%</span>
      </div>
      
      <div className="relative">
        <Progress 
          value={progress} 
          className="h-2 bg-muted"
        />
        <div 
          className={cn(
            "absolute inset-0 h-2 rounded-full transition-all duration-500",
            stage === 'error' && "bg-gradient-to-r from-destructive/20 to-destructive",
            stage === 'completed' && "bg-gradient-to-r from-success/20 to-success",
            stage !== 'error' && stage !== 'completed' && "bg-gradient-to-r from-primary/20 to-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <div 
          className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            `bg-${stageColor}`
          )}
        />
        <span className="text-sm font-medium">{stageName}</span>
      </div>
    </div>
  );
}