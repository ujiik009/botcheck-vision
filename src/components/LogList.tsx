import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, ArrowDown, RotateCcw } from 'lucide-react';
import { getStageColor, getStageName } from '../types';
import type { ProgressEvent } from '../types';
import { useToast } from '@/hooks/use-toast';

interface LogListProps {
  events: ProgressEvent[];
  onReplay?: () => void;
  className?: string;
}

export function LogList({ events, onReplay, className }: LogListProps) {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    setAutoScroll(isAtBottom);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setAutoScroll(true);
    }
  };

  const copyLogs = () => {
    const logText = events.map(event => {
      const time = event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'Unknown';
      return `[${time}] ${getStageName(event.stage)}: ${event.message}`;
    }).join('\n');

    navigator.clipboard.writeText(logText).then(() => {
      toast({
        title: "Logs copied",
        description: "Progress logs copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Failed to copy logs to clipboard",
        variant: "destructive",
      });
    });
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'Unknown';
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Invalid';
    }
  };

  return (
    <Card className={cn("bg-terminal border-border", className)}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-terminal-foreground">Progress Log</h3>
        <div className="flex items-center gap-2">
          {onReplay && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReplay}
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Replay
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={copyLogs}
            disabled={events.length === 0}
            className="text-xs"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
        </div>
      </div>

      <div className="relative">
        <ScrollArea 
          className="h-80" 
          ref={scrollRef}
          onScrollCapture={handleScroll}
        >
          <div className="p-4 space-y-2 font-mono text-xs">
            {events.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                No events yet. Waiting for progress...
              </div>
            ) : (
              events.map((event, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-2 rounded bg-background/30 hover:bg-background/50 transition-colors"
                >
                  <span className="text-muted-foreground shrink-0 mt-0.5">
                    {formatTime(event.timestamp)}
                  </span>
                  
                  <Badge 
                    variant="outline"
                    className={cn(
                      "shrink-0 text-xs",
                      `border-${getStageColor(event.stage)} text-${getStageColor(event.stage)}`
                    )}
                  >
                    {getStageName(event.stage)}
                  </Badge>
                  
                  <span className="text-terminal-foreground break-words">
                    {event.message}
                  </span>

                  {event.diagnostics && (
                    <div className="ml-auto shrink-0 text-muted-foreground text-xs">
                      {event.diagnostics.rounds && `R:${event.diagnostics.rounds}`}
                      {event.diagnostics.adsSeen && ` A:${event.diagnostics.adsSeen}`}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {!autoScroll && (
          <Button
            variant="secondary"
            size="sm"
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 shadow-lg"
          >
            <ArrowDown className="w-3 h-3 mr-1" />
            Scroll to bottom
          </Button>
        )}
      </div>
    </Card>
  );
}