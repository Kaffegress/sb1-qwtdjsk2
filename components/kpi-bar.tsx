import { WeeklyKPIs } from '@/lib/kpi';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Target, FileText } from 'lucide-react';

interface KPIBarProps {
  kpis: WeeklyKPIs;
  onGenerateSITREP: () => void;
}

const rygColors = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
};

const rygTextColors = {
  red: 'text-red-700',
  yellow: 'text-yellow-700',
  green: 'text-green-700',
};

const rygBgColors = {
  red: 'bg-red-50',
  yellow: 'bg-yellow-50',
  green: 'bg-green-50',
};

export function KPIBar({ kpis, onGenerateSITREP }: KPIBarProps) {
  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                F1 Volum (uke):
              </span>
            </div>
            <span className="text-2xl font-bold">{kpis.f1Volume}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                F1→F2:
              </span>
            </div>
            <span className="text-2xl font-bold">{kpis.f1ToF2Conversion}%</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Ledetid:
              </span>
            </div>
            <span className="text-2xl font-bold">
              {kpis.f1ToF2LeadTimeMedian}d
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`gap-2 py-1.5 px-3 ${rygBgColors[kpis.rygStatus]}`}
            >
              <div className={`h-3 w-3 rounded-full ${rygColors[kpis.rygStatus]}`} />
              <span className={`font-semibold ${rygTextColors[kpis.rygStatus]}`}>
                {kpis.rygStatus === 'green' && 'Grønn (>70%)'}
                {kpis.rygStatus === 'yellow' && 'Gul (40-70%)'}
                {kpis.rygStatus === 'red' && 'Rød (<40%)'}
              </span>
            </Badge>
          </div>
        </div>

        <Button onClick={onGenerateSITREP} variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Lag SITREP
        </Button>
      </div>
    </Card>
  );
}
