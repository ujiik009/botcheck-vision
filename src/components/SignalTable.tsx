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
import type { Signal } from '../types';

interface SignalTableProps {
  signals: Signal[];
  className?: string;
}

export function SignalTable({ signals, className }: SignalTableProps) {
  const getWeightColor = (weight: number) => {
    if (weight >= 0.7) return 'destructive';
    if (weight >= 0.4) return 'warning';
    return 'secondary';
  };

  const getWeightLabel = (weight: number) => {
    if (weight >= 0.7) return 'High';
    if (weight >= 0.4) return 'Medium';
    return 'Low';
  };

  const formatValue = (value: string | number | boolean) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  if (signals.length === 0) {
    return null;
  }

  return (
    <Card className={cn("bg-card", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Top Signals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Signal</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-[100px]">Weight</TableHead>
                <TableHead>Explanation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signals.map((signal, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {signal.signal}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {formatValue(signal.value)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        getWeightColor(signal.weight) === 'destructive' && "border-destructive text-destructive",
                        getWeightColor(signal.weight) === 'warning' && "border-warning text-warning",
                        getWeightColor(signal.weight) === 'secondary' && "border-secondary text-secondary"
                      )}
                    >
                      {getWeightLabel(signal.weight)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {signal.explain}
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