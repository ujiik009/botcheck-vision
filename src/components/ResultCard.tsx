import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Copy, User, Calendar } from 'lucide-react';
import type { ScoringResult } from '../types';
import { useToast } from '@/hooks/use-toast';

interface ResultCardProps {
  result: ScoringResult;
  className?: string;
}

export function ResultCard({ result, className }: ResultCardProps) {
  const { toast } = useToast();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Likely Human';
    if (score >= 60) return 'Uncertain';
    return 'Likely Bot';
  };

  const downloadJson = () => {
    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `botcheck-${result.username || 'result'}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Result JSON file has been downloaded",
    });
  };

  const copyJson = () => {
    const dataStr = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
      toast({
        title: "Result copied",
        description: "JSON result copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Failed to copy result to clipboard",
        variant: "destructive",
      });
    });
  };

  return (
    <Card className={cn("bg-card", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Analysis Complete</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyJson}>
              <Copy className="w-4 h-4 mr-2" />
              Copy JSON
            </Button>
            <Button variant="outline" size="sm" onClick={downloadJson}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        
        {(result.username || result.analysis_date) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {result.username && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {result.username}
              </div>
            )}
            {result.analysis_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(result.analysis_date).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score Summary */}
        <div className="text-center space-y-2">
          <div className="space-y-1">
            <div className="text-5xl font-bold text-primary">
              {result.human_score}
            </div>
            <div className="text-sm text-muted-foreground">Human Score</div>
          </div>
          
          <Badge 
            variant="outline"
            className={cn(
              "text-lg px-4 py-1",
              getScoreColor(result.human_score) === 'success' && "border-success text-success",
              getScoreColor(result.human_score) === 'warning' && "border-warning text-warning",
              getScoreColor(result.human_score) === 'destructive' && "border-destructive text-destructive"
            )}
          >
            {getScoreLabel(result.human_score)}
          </Badge>
          
          <div className="text-sm text-muted-foreground">
            Confidence: {result.confidence}%
          </div>
        </div>

        {/* Summary Bullets */}
        {result.summary_bullets.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Summary</h4>
            <ul className="space-y-1 text-sm">
              {result.summary_bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}