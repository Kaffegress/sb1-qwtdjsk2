import { Database } from '@/lib/database.types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  CheckCircle2,
  Clock,
  Link as LinkIcon,
  BarChart3,
  FileText
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';

type Item = Database['public']['Tables']['items']['Row'];

interface ItemCardProps {
  item: Item;
  onMoveToDiscovery?: () => void;
  onMoveToDevelopment?: () => void;
  onMarkDone?: () => void;
  onClick?: () => void;
  showMoveButton?: boolean;
}

const statusLabels = {
  status1: 'New',
  status2: 'Discovery',
  status3: 'Development',
  status4: 'Done',
};

const rygColors = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
};

export function ItemCard({
  item,
  onMoveToDiscovery,
  onMoveToDevelopment,
  onMarkDone,
  onClick,
  showMoveButton = true,
}: ItemCardProps) {
  const getInitials = (ownerId: string) => {
    return ownerId.slice(0, 2).toUpperCase();
  };

  const goodEnoughCount = [
    item.good_enough_demo,
    item.good_enough_measure,
    item.good_enough_log,
  ].filter(Boolean).length;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight flex-1">
            {item.title}
          </h3>
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {getInitials(item.owner_id)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {item.ryg_status && (
            <Badge variant="secondary" className="gap-1">
              <div className={`h-2 w-2 rounded-full ${rygColors[item.ryg_status]}`} />
              {item.ryg_status.toUpperCase()}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {statusLabels[item.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-2 text-xs">
        {item.problem && (
          <div>
            <span className="font-medium text-muted-foreground">Problem:</span>{' '}
            <span className="line-clamp-2">{item.problem}</span>
          </div>
        )}

        {item.user_ctx && (
          <div>
            <span className="font-medium text-muted-foreground">Bruker:</span>{' '}
            <span className="line-clamp-1">{item.user_ctx}</span>
          </div>
        )}

        {item.min_solution && (
          <div>
            <span className="font-medium text-muted-foreground">Løsning:</span>{' '}
            <span className="line-clamp-2">{item.min_solution}</span>
          </div>
        )}

        {item.kpi_name && (
          <div className="flex items-start gap-1 pt-1">
            <BarChart3 className="h-3 w-3 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-medium">{item.kpi_name}</div>
              <div className="text-muted-foreground">
                {item.kpi_baseline} → {item.kpi_target}
              </div>
            </div>
          </div>
        )}

        {item.first_measure_due && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              Måling: {format(parseISO(item.first_measure_due), 'd. MMM', { locale: nb })}
            </span>
          </div>
        )}

        {item.timebox_to && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              Frist: {format(parseISO(item.timebox_to), 'd. MMM yyyy', { locale: nb })}
            </span>
          </div>
        )}

        {item.artefact_url && (
          <div className="flex items-center gap-1 text-blue-600">
            <LinkIcon className="h-3 w-3" />
            <a
              href={item.artefact_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:underline"
            >
              Artefakt
            </a>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-1">
            <CheckCircle2
              className={`h-3 w-3 ${item.good_enough_demo ? 'text-green-600' : 'text-gray-300'}`}
            />
            <span className="text-muted-foreground">Demo</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3
              className={`h-3 w-3 ${item.good_enough_measure ? 'text-green-600' : 'text-gray-300'}`}
            />
            <span className="text-muted-foreground">Måling</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText
              className={`h-3 w-3 ${item.good_enough_log ? 'text-green-600' : 'text-gray-300'}`}
            />
            <span className="text-muted-foreground">Logg</span>
          </div>
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {showMoveButton && (
        <CardFooter className="pt-0">
          {item.status === 'status1' && onMoveToDiscovery && (
            <Button
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onMoveToDiscovery();
              }}
            >
              Send til Discovery
            </Button>
          )}
          {item.status === 'status2' && onMoveToDevelopment && (
            <Button
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onMoveToDevelopment();
              }}
            >
              Til Development
            </Button>
          )}
          {item.status === 'status3' && onMarkDone && (
            <Button
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onMarkDone();
              }}
              disabled={goodEnoughCount < 2 && !item.stopp_reason}
            >
              Markér Done
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
