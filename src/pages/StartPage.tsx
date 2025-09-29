import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Search, Zap, Shield } from 'lucide-react';
import { ApiKeyManager } from '../components/ApiKeyManager';
import { apiService } from '../services/api';
import { useToast } from '@/hooks/use-toast';

const usernameSchema = z.string()
  .min(1, 'Username is required')
  .max(50, 'Username must be less than 50 characters')
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Username contains invalid characters');

export default function StartPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Validate username
      const validatedUsername = usernameSchema.parse(username.trim());
      
      setIsLoading(true);
      
      // Start bot check
      const response = await apiService.startBotCheck(validatedUsername);
      
      // Show success toast
      toast({
        title: "Bot check started",
        description: `Analysis started for @${validatedUsername}`,
      });
      
      // Navigate to job page
      navigate(`/job/${response.jobId}`);
      
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to start bot check');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Account Bot-Check</h1>
              <p className="text-sm text-muted-foreground">AI-powered social media bot detection</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Main Form */}
          <div className="space-y-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-2xl">Start Bot Analysis</CardTitle>
                <p className="text-muted-foreground">
                  Enter a username to analyze their account for bot-like behavior using advanced AI detection.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                      <Input
                        id="username"
                        type="text"
                        placeholder="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-8"
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !username.trim()}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-transparent border-t-current" />
                        Starting Analysis...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Start Bot Check
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <ApiKeyManager />
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                      <Search className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Data Collection</h4>
                      <p className="text-sm text-muted-foreground">
                        Fetches public account data, posts, and engagement patterns
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                      <Zap className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">AI Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        Advanced algorithms analyze behavior patterns and content
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                      <Shield className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Score & Report</h4>
                      <p className="text-sm text-muted-foreground">
                        Provides human likelihood score with detailed explanations
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-warning/20">
              <CardContent className="pt-6">
                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Note:</strong> This tool analyzes publicly available data only. 
                    Results are for informational purposes and should not be used as the sole 
                    basis for important decisions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}