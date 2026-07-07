import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { clsx } from 'clsx';

interface KPICardProps {
  title: string;
  value: string | number;
  delta?: number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}

export function KPICard({ title, value, delta, icon: Icon, trend = 'neutral' }: KPICardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {delta !== undefined && (
            <p
              className={clsx(
                'mt-1 text-xs font-medium',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-destructive',
                trend === 'neutral' && 'text-muted-foreground'
              )}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {Math.abs(delta)}%
            </p>
          )}
        </div>
        <div className="rounded-md bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}
