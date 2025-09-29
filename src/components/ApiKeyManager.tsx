import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Key, X } from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyManagerProps {
  className?: string;
}

export function ApiKeyManager({ className }: ApiKeyManagerProps) {
  const { toast } = useToast();
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [isEditing, setIsEditing] = useState(!apiService.getApiKey());

  const currentKey = apiService.getApiKey();

  const handleSave = () => {
    if (tempKey.trim()) {
      apiService.setApiKey(tempKey.trim());
      toast({
        title: "API key saved",
        description: "Your API key has been saved and will be used for requests",
      });
    }
    setIsEditing(false);
    setTempKey('');
  };

  const handleClear = () => {
    apiService.setApiKey(null);
    setTempKey('');
    setIsEditing(true);
    toast({
      title: "API key cleared",
      description: "API key has been removed",
    });
  };

  const handleEdit = () => {
    setTempKey(currentKey || '');
    setIsEditing(true);
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <Card className={cn("bg-card", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Key className="w-4 h-4" />
          API Key
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="apikey" className="text-xs">
                API Key (optional)
              </Label>
              <div className="relative">
                <Input
                  id="apikey"
                  type={showKey ? 'text' : 'password'}
                  placeholder="Enter your API key..."
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  className="pr-10 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                size="sm"
                className="text-xs"
              >
                Save
              </Button>
              {currentKey && (
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs text-muted-foreground">
                {currentKey ? maskKey(currentKey) : 'No API key set'}
              </div>
              <div className="flex gap-1">
                <Button
                  onClick={handleEdit}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  Edit
                </Button>
                {currentKey && (
                  <Button
                    onClick={handleClear}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {!currentKey && (
              <p className="text-xs text-muted-foreground">
                Optional: Add an API key for authenticated requests
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}