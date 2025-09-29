import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Copy, 
  RefreshCw, 
  ExternalLink, 
  Wifi, 
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import { useSocketJob } from '../hooks/useSocketJob';
import { ProgressBar } from '../components/ProgressBar';
import { LogList } from '../components/LogList';
import { ResultCard } from '../components/ResultCard';
import { SignalTable } from '../components/SignalTable';
import { ActionTable } from '../components/ActionTable';
import { apiService } from '../services/api';
import { useToast } from '@/hooks/use-toast';
import type { JobMetadata, ScoringResult } from '../types';

const jobIdSchema = z.string().uuid('Invalid job ID format');

export default function JobPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [jobMetadata, setJobMetadata] = useState<JobMetadata | null>(null);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Validate job ID
  const validJobId = (() => {
    try {
      return jobId ? jobIdSchema.parse(jobId) : null;
    } catch {
      return null;
    }
  })();

  const {
    events,
    isConnected,
    isConnecting,
    error: socketError,
    retryConnection,
    replayEvents
  } = useSocketJob({
    jobId: validJobId || '',
    onProgress: (event) => {
      if (event.stage === 'completed' && event.data) {
        try {
          setResult(event.data);
        } catch (err) {
          console.error('Failed to parse result data:', err);
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Socket error",
        description: error,
        variant: "destructive",
      });
    }
  });

  // Load job metadata on mount
  useEffect(() => {
    if (!validJobId) {
      setMetadataError('Invalid job ID');
      setIsLoadingMetadata(false);
      return;
    }

    const loadMetadata = async () => {
      try {
        const metadata = await apiService.getJobMetadata(validJobId);
        setJobMetadata(metadata);
        
        // If job is completed, try to load result
        if (metadata.status === 'completed') {
          try {
            const jobResult = await apiService.getJobResult(validJobId);
            setResult(jobResult);
          } catch (err) {
            console.warn('Could not load job result:', err);
          }
        }
      } catch (err) {
        setMetadataError(err instanceof Error ? err.message : 'Failed to load job');
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadMetadata();
  }, [validJobId]);

  const copyJobLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied",
        description: "Job link copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    });
  };

  const refreshJob = async () => {
    if (!validJobId) return;
    
    try {
      const metadata = await apiService.getJobMetadata(validJobId);
      setJobMetadata(metadata);
      
      if (metadata.status === 'completed') {
        const jobResult = await apiService.getJobResult(validJobId);
        setResult(jobResult);
      }
    } catch (err) {
      toast({
        title: "Refresh failed",
        description: err instanceof Error ? err.message : 'Failed to refresh job',
        variant: "destructive",
      });
    }
  };

  // Show error page for invalid job ID
  if (!validJobId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Invalid Job ID</h1>
            <p className="text-muted-foreground">
              The job ID in the URL is not valid. Please check the link and try again.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStage = events.length > 0 ? events[events.length - 1].stage : 'started';
  const latestEvent = events[events.length - 1];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div>
                <h1 className="text-lg font-semibold">
                  Bot Check: {jobMetadata?.username || 'Unknown'}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono">{validJobId}</span>
                  {jobMetadata?.createdAt && (
                    <span>• {new Date(jobMetadata.createdAt).toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Connection status */}
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  isConnected && "border-success text-success",
                  isConnecting && "border-warning text-warning",
                  !isConnected && !isConnecting && "border-destructive text-destructive"
                )}
              >
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 mr-1" />
                    Connected
                  </>
                ) : isConnecting ? (
                  <>
                    <div className="w-3 h-3 mr-1 animate-spin rounded-full border border-transparent border-t-current" />
                    Connecting
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 mr-1" />
                    Disconnected
                  </>
                )}
              </Badge>

              <Button variant="outline" size="sm" onClick={copyJobLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              
              <Button variant="outline" size="sm" onClick={refreshJob}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Error States */}
        {metadataError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              {metadataError}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')}
                className="ml-4"
              >
                Start New Check
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {socketError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Connection error: {socketError}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retryConnection}
                className="ml-4"
              >
                Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Progress Section */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Analysis Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressBar 
                stage={currentStage} 
                percent={latestEvent?.percent}
              />
            </CardContent>
          </Card>

          {/* Progress Log */}
          <LogList 
            events={events}
            onReplay={replayEvents}
          />

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              <ResultCard result={result} />
              <SignalTable signals={result.top_signals} />
              <ActionTable actions={result.action_table} />
            </div>
          )}

          {/* Error Stage */}
          {currentStage === 'error' && latestEvent && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Analysis failed:</strong> {latestEvent.message}
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/')}
                  >
                    Start New Check
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}