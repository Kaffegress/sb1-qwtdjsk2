'use client';

import { useState, useEffect } from 'react';
import { Database } from '@/lib/database.types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchComments, fetchAuditLogs, createComment, updateItem, MOCK_USER_ID } from '@/lib/api';
import { format, parseISO } from 'date-fns';
import { nb } from 'date-fns/locale';
import { Download, Copy, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Item = Database['public']['Tables']['items']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];
type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

interface ItemDetailSheetProps {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ItemDetailSheet({
  item,
  open,
  onOpenChange,
  onUpdate,
}: ItemDetailSheetProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editedItem, setEditedItem] = useState<Partial<Item>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item && open) {
      loadComments();
      loadAuditLogs();
      setEditedItem({});
    }
  }, [item, open]);

  const loadComments = async () => {
    if (!item) return;
    try {
      const data = await fetchComments(item.id);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const loadAuditLogs = async () => {
    if (!item) return;
    try {
      const data = await fetchAuditLogs(item.id);
      setAuditLogs(data);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  };

  const handleAddComment = async () => {
    if (!item || !newComment.trim()) return;

    setLoading(true);
    try {
      await createComment({
        item_id: item.id,
        user_id: MOCK_USER_ID,
        content: newComment.trim(),
      });
      setNewComment('');
      await loadComments();
      toast({
        title: 'Kommentar lagt til',
        description: 'Din kommentar har blitt lagret.',
      });
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke legge til kommentar.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!item || Object.keys(editedItem).length === 0) return;

    setLoading(true);
    try {
      await updateItem(item.id, editedItem, MOCK_USER_ID);
      toast({
        title: 'Endringer lagret',
        description: 'Elementet har blitt oppdatert.',
      });
      setEditedItem({});
      onUpdate();
      await loadAuditLogs();
    } catch (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke lagre endringer.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopySITREP = () => {
    if (!item) return;

    const sitrep = `${item.title}

Problem: ${item.problem || 'Ikke spesifisert'}
Bruker: ${item.user_ctx || 'Ikke spesifisert'}
Løsning: ${item.min_solution || 'Ikke spesifisert'}

KPI: ${item.kpi_name || 'Ikke satt'}
Baseline: ${item.kpi_baseline || '-'} → Target: ${item.kpi_target || '-'}

Status: ${item.status}
Eier: ${item.owner_id}`;

    navigator.clipboard.writeText(sitrep);
    toast({
      title: 'Kopiert!',
      description: 'SITREP-tekst kopiert til utklippstavle.',
    });
  };

  const handleDownloadF31Pager = () => {
    if (!item) return;

    const markdown = `# ${item.title}

## Problem
${item.problem || 'Ikke spesifisert'}

## Brukerkontekst
${item.user_ctx || 'Ikke spesifisert'}

## Minimal løsning
${item.min_solution || 'Ikke spesifisert'}

## KPI/Gevinst
- **Navn:** ${item.kpi_name || 'Ikke satt'}
- **Baseline:** ${item.kpi_baseline || '-'}
- **Target:** ${item.kpi_target || '-'}
- **Første måling:** ${item.first_measure_due ? format(parseISO(item.first_measure_due), 'd. MMMM yyyy', { locale: nb }) : 'Ikke satt'}

## Risiko
${item.risk_note || 'Ingen risikoer notert'}

## RBAC
${item.rbac_note || 'Ingen RBAC-notater'}

## Status
- **Godt-nok demo:** ${item.good_enough_demo ? 'Ja' : 'Nei'}
- **Godt-nok måling:** ${item.good_enough_measure ? 'Ja' : 'Nei'}
- **Godt-nok logg:** ${item.good_enough_log ? 'Ja' : 'Nei'}

## Artefakter
${item.artefact_url || 'Ingen artefakter'}

---
Generert: ${format(new Date(), 'd. MMMM yyyy', { locale: nb })}`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_f3.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Nedlastet!',
      description: 'F3 1-pager lastet ned som markdown.',
    });
  };

  const updateField = <K extends keyof Item>(field: K, value: Item[K]) => {
    setEditedItem((prev) => ({ ...prev, [field]: value }));
  };

  const getFieldValue = <K extends keyof Item>(field: K): Item[K] => {
    return (editedItem[field] ?? item?.[field]) as Item[K];
  };

  const isF1Field = (field: string) => {
    return ['title', 'problem', 'user_ctx', 'min_solution'].includes(field);
  };

  if (!item) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{item.title}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Detaljer</TabsTrigger>
            <TabsTrigger value="comments">Kommentarer</TabsTrigger>
            <TabsTrigger value="audit">Endringslogg</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Tittel (F1 - låst)</Label>
                <Input
                  id="title"
                  value={getFieldValue('title')}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="owner">Eier</Label>
                <Input
                  id="owner"
                  value={getFieldValue('owner_id')}
                  onChange={(e) => updateField('owner_id', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="problem">Problem (F1 - låst)</Label>
                <Textarea
                  id="problem"
                  value={getFieldValue('problem') || ''}
                  disabled
                  className="bg-gray-50"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="user_ctx">Brukerkontekst (F1 - låst)</Label>
                <Textarea
                  id="user_ctx"
                  value={getFieldValue('user_ctx') || ''}
                  disabled
                  className="bg-gray-50"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="min_solution">Minimal løsning (F1 - låst)</Label>
                <Textarea
                  id="min_solution"
                  value={getFieldValue('min_solution') || ''}
                  disabled
                  className="bg-gray-50"
                  rows={3}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kpi_name">KPI Navn</Label>
                  <Input
                    id="kpi_name"
                    value={getFieldValue('kpi_name') || ''}
                    onChange={(e) => updateField('kpi_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="first_measure_due">Første måling</Label>
                  <Input
                    id="first_measure_due"
                    type="date"
                    value={getFieldValue('first_measure_due') || ''}
                    onChange={(e) => updateField('first_measure_due', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kpi_baseline">Baseline</Label>
                  <Input
                    id="kpi_baseline"
                    value={getFieldValue('kpi_baseline') || ''}
                    onChange={(e) => updateField('kpi_baseline', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="kpi_target">Target</Label>
                  <Input
                    id="kpi_target"
                    value={getFieldValue('kpi_target') || ''}
                    onChange={(e) => updateField('kpi_target', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="risk_note">Risikonotat</Label>
                <Textarea
                  id="risk_note"
                  value={getFieldValue('risk_note') || ''}
                  onChange={(e) => updateField('risk_note', e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="rbac_note">RBAC-notat</Label>
                <Textarea
                  id="rbac_note"
                  value={getFieldValue('rbac_note') || ''}
                  onChange={(e) => updateField('rbac_note', e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="artefact_url">Artefakt URL</Label>
                <Input
                  id="artefact_url"
                  type="url"
                  value={getFieldValue('artefact_url') || ''}
                  onChange={(e) => updateField('artefact_url', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timebox_from">Timebox fra</Label>
                  <Input
                    id="timebox_from"
                    type="date"
                    value={getFieldValue('timebox_from') || ''}
                    onChange={(e) => updateField('timebox_from', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="timebox_to">Timebox til</Label>
                  <Input
                    id="timebox_to"
                    type="date"
                    value={getFieldValue('timebox_to') || ''}
                    onChange={(e) => updateField('timebox_to', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ryg_status">RYG Status</Label>
                <Select
                  value={getFieldValue('ryg_status') || 'green'}
                  onValueChange={(value) => updateField('ryg_status', value as any)}
                >
                  <SelectTrigger id="ryg_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">Grønn</SelectItem>
                    <SelectItem value="yellow">Gul</SelectItem>
                    <SelectItem value="red">Rød</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Godt-nok kriterier</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="good_enough_demo"
                    checked={getFieldValue('good_enough_demo')}
                    onCheckedChange={(checked) =>
                      updateField('good_enough_demo', checked as boolean)
                    }
                  />
                  <Label htmlFor="good_enough_demo" className="cursor-pointer">
                    Demo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="good_enough_measure"
                    checked={getFieldValue('good_enough_measure')}
                    onCheckedChange={(checked) =>
                      updateField('good_enough_measure', checked as boolean)
                    }
                  />
                  <Label htmlFor="good_enough_measure" className="cursor-pointer">
                    Måling
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="good_enough_log"
                    checked={getFieldValue('good_enough_log')}
                    onCheckedChange={(checked) =>
                      updateField('good_enough_log', checked as boolean)
                    }
                  />
                  <Label htmlFor="good_enough_log" className="cursor-pointer">
                    Logg
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="stopp_reason">Stopp-årsak (hvis nødvendig)</Label>
                <Textarea
                  id="stopp_reason"
                  value={getFieldValue('stopp_reason') || ''}
                  onChange={(e) => updateField('stopp_reason', e.target.value)}
                  rows={2}
                  placeholder="Kun hvis mindre enn 2 godt-nok kriterier er oppfylt"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveChanges}
                  disabled={loading || Object.keys(editedItem).length === 0}
                  className="flex-1"
                >
                  Lagre endringer
                </Button>
                <Button
                  onClick={handleCopySITREP}
                  variant="outline"
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Kopier SITREP
                </Button>
                <Button
                  onClick={handleDownloadF31Pager}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Last ned F3
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{comment.user_id}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(comment.created_at), 'd. MMM yyyy HH:mm', {
                          locale: nb,
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ingen kommentarer ennå
                  </p>
                )}
              </div>
            </ScrollArea>

            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="Skriv en kommentar..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleAddComment}
                disabled={loading || !newComment.trim()}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                Legg til kommentar
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{log.action}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(log.created_at), 'd. MMM yyyy HH:mm', {
                          locale: nb,
                        })}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{log.user_id}</span>
                    </div>
                    {log.old_value && (
                      <div className="mt-2 text-xs">
                        <span className="text-muted-foreground">Fra:</span>{' '}
                        <code className="bg-gray-100 px-1 rounded">
                          {JSON.stringify(log.old_value)}
                        </code>
                      </div>
                    )}
                    {log.new_value && (
                      <div className="mt-1 text-xs">
                        <span className="text-muted-foreground">Til:</span>{' '}
                        <code className="bg-gray-100 px-1 rounded">
                          {JSON.stringify(log.new_value)}
                        </code>
                      </div>
                    )}
                  </div>
                ))}

                {auditLogs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ingen endringslogg ennå
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
