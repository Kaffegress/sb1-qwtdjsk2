'use client';

import { useState, useEffect } from 'react';
import { Database } from '@/lib/database.types';
import { fetchItems, updateItemStatus, MOCK_USER_ID } from '@/lib/api';
import { calculateWeeklyKPIs, generateSITREP } from '@/lib/kpi';
import { KPIBar } from '@/components/kpi-bar';
import { Filters, FilterState } from '@/components/filters';
import { ItemCard } from '@/components/item-card';
import { ItemDetailSheet } from '@/components/item-detail-sheet';
import { CreateItemDialog } from '@/components/create-item-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { startOfISOWeek, endOfISOWeek, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Plus } from 'lucide-react';

type Item = Database['public']['Tables']['items']['Row'];

export default function Home() {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sitrepOpen, setSitrepOpen] = useState(false);
  const [sitrepText, setSitrepText] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    thisWeekOnly: true,
    owner: 'all',
    rygStatus: 'all',
    tag: 'all',
    hasDemo: null,
    hasMeasure: null,
    hasLog: null,
    searchText: '',
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke laste items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToDiscovery = async (itemId: string) => {
    try {
      await updateItemStatus(itemId, 'status2', MOCK_USER_ID);
      await loadItems();
      toast({
        title: 'Flyttet til Discovery',
        description: 'Elementet er nå i Discovery-fasen',
      });
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke flytte element',
        variant: 'destructive',
      });
    }
  };

  const handleMoveToDevelopment = async (itemId: string) => {
    try {
      await updateItemStatus(itemId, 'status3', MOCK_USER_ID);
      await loadItems();
      toast({
        title: 'Flyttet til Development',
        description: 'Elementet er nå i Development-fasen',
      });
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke flytte element',
        variant: 'destructive',
      });
    }
  };

  const handleMarkDone = async (item: Item) => {
    const goodEnoughCount = [
      item.good_enough_demo,
      item.good_enough_measure,
      item.good_enough_log,
    ].filter(Boolean).length;

    if (goodEnoughCount < 2 && !item.stopp_reason) {
      toast({
        title: 'Kan ikke markere som Done',
        description: 'Minst 2 av 3 godt-nok kriterier må være oppfylt, eller stopp-årsak må være angitt',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateItemStatus(item.id, 'status4', MOCK_USER_ID);
      await loadItems();
      toast({
        title: 'Markert som Done',
        description: 'Elementet er nå fullført',
      });
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke markere element som Done',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateSITREP = () => {
    const kpis = calculateWeeklyKPIs(items);
    const sitrep = generateSITREP(items, kpis);
    setSitrepText(sitrep);
    setSitrepOpen(true);
  };

  const handleCopySITREP = () => {
    navigator.clipboard.writeText(sitrepText);
    toast({
      title: 'Kopiert!',
      description: 'SITREP kopiert til utklippstavle',
    });
  };

  const filteredItems = items.filter((item) => {
    if (filters.thisWeekOnly && item.status === 'status1') {
      const now = new Date();
      const weekStart = startOfISOWeek(now);
      const weekEnd = endOfISOWeek(now);
      const createdAt = parseISO(item.created_at);
      if (createdAt < weekStart || createdAt > weekEnd) {
        return false;
      }
    }

    if (filters.owner !== 'all' && item.owner_id !== filters.owner) {
      return false;
    }

    if (filters.rygStatus !== 'all' && item.ryg_status !== filters.rygStatus) {
      return false;
    }

    if (filters.tag !== 'all' && !item.tags.includes(filters.tag)) {
      return false;
    }

    if (filters.hasDemo !== null && item.good_enough_demo !== filters.hasDemo) {
      return false;
    }

    if (filters.hasMeasure !== null && item.good_enough_measure !== filters.hasMeasure) {
      return false;
    }

    if (filters.hasLog !== null && item.good_enough_log !== filters.hasLog) {
      return false;
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(searchLower);
      const problemMatch = item.problem?.toLowerCase().includes(searchLower);
      if (!titleMatch && !problemMatch) {
        return false;
      }
    }

    return true;
  });

  const sortItems = (itemsToSort: Item[]) => {
    return [...itemsToSort].sort((a, b) => {
      if (a.timebox_to && b.timebox_to) {
        return parseISO(a.timebox_to).getTime() - parseISO(b.timebox_to).getTime();
      }
      if (a.timebox_to) return -1;
      if (b.timebox_to) return 1;

      return parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime();
    });
  };

  const status1Items = sortItems(filteredItems.filter((i) => i.status === 'status1'));
  const status2Items = sortItems(filteredItems.filter((i) => i.status === 'status2'));
  const status3Items = sortItems(filteredItems.filter((i) => i.status === 'status3'));
  const status4Items = sortItems(filteredItems.filter((i) => i.status === 'status4'));

  const kpis = calculateWeeklyKPIs(items);

  const availableOwners = Array.from(new Set(items.map((i) => i.owner_id)));
  const availableTags = Array.from(new Set(items.flatMap((i) => i.tags)));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Cocoon F2</h1>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nytt element
          </Button>
        </div>

        <KPIBar kpis={kpis} onGenerateSITREP={handleGenerateSITREP} />

        <Filters
          filters={filters}
          onFilterChange={setFilters}
          availableOwners={availableOwners}
          availableTags={availableTags}
        />

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Laster...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">New</h2>
                <span className="text-sm text-muted-foreground">
                  {status1Items.length}
                </span>
              </div>
              <div className="space-y-3">
                {status1Items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => {
                      setSelectedItem(item);
                      setSheetOpen(true);
                    }}
                    onMoveToDiscovery={() => handleMoveToDiscovery(item.id)}
                  />
                ))}
                {status1Items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ingen items
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Discovery</h2>
                <span className="text-sm text-muted-foreground">
                  {status2Items.length}
                </span>
              </div>
              <div className="space-y-3">
                {status2Items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => {
                      setSelectedItem(item);
                      setSheetOpen(true);
                    }}
                    onMoveToDevelopment={() => handleMoveToDevelopment(item.id)}
                  />
                ))}
                {status2Items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ingen items
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Development</h2>
                <span className="text-sm text-muted-foreground">
                  {status3Items.length}
                </span>
              </div>
              <div className="space-y-3">
                {status3Items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => {
                      setSelectedItem(item);
                      setSheetOpen(true);
                    }}
                    onMarkDone={() => handleMarkDone(item)}
                  />
                ))}
                {status3Items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ingen items
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Done</h2>
                <span className="text-sm text-muted-foreground">
                  {status4Items.length}
                </span>
              </div>
              <div className="space-y-3">
                {status4Items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => {
                      setSelectedItem(item);
                      setSheetOpen(true);
                    }}
                    showMoveButton={false}
                  />
                ))}
                {status4Items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ingen items
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <ItemDetailSheet
          item={selectedItem}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onUpdate={loadItems}
        />

        <CreateItemDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onItemCreated={loadItems}
        />

        <Dialog open={sitrepOpen} onOpenChange={setSitrepOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>SITREP</DialogTitle>
              <DialogDescription>
                Ukes-rapport for innovasjonsflyten
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={sitrepText}
                readOnly
                rows={12}
                className="font-mono text-sm"
              />
              <Button onClick={handleCopySITREP} className="w-full gap-2">
                <Copy className="h-4 w-4" />
                Kopier til utklippstavle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
