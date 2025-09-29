import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import type { Action } from '../types';

interface ActionTableProps {
  actions: Action[];
  className?: string;
}

export function ActionTable({ actions, className }: ActionTableProps) {
  const getPriorityIcon = (priority: Action['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  const getPriorityColor = (priority: Action['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
    }
  };

  if (actions.length === 0) {
    return null;
  }

  // Sort actions by priority
  const sortedActions = [...actions].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <Card className={cn("bg-card", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Recommended Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Priority</TableHead>
                <TableHead className="w-[250px]">Action</TableHead>
                <TableHead>Rationale</TableHead>
                <TableHead className="w-[150px]">Effort</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedActions.map((action, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(action.priority)}
                      <Badge 
                        variant="outline"
                        className={cn(
                          "text-xs capitalize",
                          getPriorityColor(action.priority) === 'destructive' && "border-destructive text-destructive",
                          getPriorityColor(action.priority) === 'warning' && "border-warning text-warning",
                          getPriorityColor(action.priority) === 'success' && "border-success text-success"
                        )}
                      >
                        {action.priority}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {action.action}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {action.rationale}
                  </TableCell>
                  <TableCell className="text-sm">
                    <Badge variant="outline" className="text-xs">
                      {action.estimated_effort}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}