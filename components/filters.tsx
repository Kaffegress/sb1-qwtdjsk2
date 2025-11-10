import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search } from 'lucide-react';

export interface FilterState {
  thisWeekOnly: boolean;
  owner: string;
  rygStatus: string;
  tag: string;
  hasDemo: boolean | null;
  hasMeasure: boolean | null;
  hasLog: boolean | null;
  searchText: string;
}

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableOwners: string[];
  availableTags: string[];
}

export function Filters({
  filters,
  onFilterChange,
  availableOwners,
  availableTags,
}: FiltersProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <Card className="p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="thisWeekOnly"
            checked={filters.thisWeekOnly}
            onCheckedChange={(checked) => updateFilter('thisWeekOnly', checked)}
          />
          <Label htmlFor="thisWeekOnly" className="cursor-pointer">
            Denne uken (New)
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner">Eier</Label>
          <Select
            value={filters.owner}
            onValueChange={(value) => updateFilter('owner', value)}
          >
            <SelectTrigger id="owner">
              <SelectValue placeholder="Alle eiere" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle eiere</SelectItem>
              {availableOwners.map((owner) => (
                <SelectItem key={owner} value={owner}>
                  {owner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ryg">RYG Status</Label>
          <Select
            value={filters.rygStatus}
            onValueChange={(value) => updateFilter('rygStatus', value)}
          >
            <SelectTrigger id="ryg">
              <SelectValue placeholder="Alle statuser" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle statuser</SelectItem>
              <SelectItem value="green">Grønn</SelectItem>
              <SelectItem value="yellow">Gul</SelectItem>
              <SelectItem value="red">Rød</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tag">Tag</Label>
          <Select
            value={filters.tag}
            onValueChange={(value) => updateFilter('tag', value)}
          >
            <SelectTrigger id="tag">
              <SelectValue placeholder="Alle tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle tags</SelectItem>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="search">Søk</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Søk i tittel og problem..."
              value={filters.searchText}
              onChange={(e) => updateFilter('searchText', e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasDemo"
              checked={filters.hasDemo === true}
              onCheckedChange={(checked) =>
                updateFilter('hasDemo', checked ? true : null)
              }
            />
            <Label htmlFor="hasDemo" className="cursor-pointer">
              Har demo
            </Label>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasMeasure"
              checked={filters.hasMeasure === true}
              onCheckedChange={(checked) =>
                updateFilter('hasMeasure', checked ? true : null)
              }
            />
            <Label htmlFor="hasMeasure" className="cursor-pointer">
              Har måling
            </Label>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasLog"
              checked={filters.hasLog === true}
              onCheckedChange={(checked) =>
                updateFilter('hasLog', checked ? true : null)
              }
            />
            <Label htmlFor="hasLog" className="cursor-pointer">
              Har logg
            </Label>
          </div>
        </div>
      </div>
    </Card>
  );
}
