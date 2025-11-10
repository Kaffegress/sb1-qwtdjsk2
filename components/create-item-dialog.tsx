'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { createItem, MOCK_USER_ID } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemCreated: () => void;
}

export function CreateItemDialog({
  open,
  onOpenChange,
  onItemCreated,
}: CreateItemDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    user_ctx: '',
    min_solution: '',
    current_solution: '',
    resource_assessment: '',
    kpi_name: '',
    kpi_baseline: '',
    kpi_target: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.problem.trim()) {
      toast({
        title: 'Manglende informasjon',
        description: 'Tittel og problembeskrivelse er påkrevd',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await createItem({
        title: formData.title.trim(),
        problem: formData.problem.trim(),
        user_ctx: formData.user_ctx.trim() || null,
        min_solution: formData.min_solution.trim() || null,
        current_solution: formData.current_solution.trim() || null,
        resource_assessment: formData.resource_assessment.trim() || null,
        owner_id: MOCK_USER_ID,
        kpi_name: formData.kpi_name.trim() || null,
        kpi_baseline: formData.kpi_baseline.trim() || null,
        kpi_target: formData.kpi_target.trim() || null,
        tags: [],
        status: 'status1',
      });

      toast({
        title: 'Element opprettet',
        description: 'Det nye elementet har blitt lagt til i New-kolonnen',
      });

      setFormData({
        title: '',
        problem: '',
        user_ctx: '',
        min_solution: '',
        current_solution: '',
        resource_assessment: '',
        kpi_name: '',
        kpi_baseline: '',
        kpi_target: ''
      });
      onOpenChange(false);
      onItemCreated();
    } catch (error: any) {
      console.error('Failed to create item:', error);
      toast({
        title: 'Feil',
        description: error?.message || 'Kunne ikke opprette element',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      problem: '',
      user_ctx: '',
      min_solution: '',
      current_solution: '',
      resource_assessment: '',
      kpi_name: '',
      kpi_baseline: '',
      kpi_target: ''
    });
    onOpenChange(false);
  };

  const isFormValid = formData.title.trim() && formData.problem.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Opprett nytt element</DialogTitle>
          <DialogDescription>
            Fyll ut grunnleggende informasjon for å opprette et nytt element. Felter merket med * er påkrevd.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div>
            <Label htmlFor="title" className="required">
              Tittel <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Skriv en kort, beskrivende tittel"
              className="mt-1"
              autoFocus
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-base font-semibold">Beskrivelse</Label>

            <div>
              <Label htmlFor="problem" className="required">
                Problembeskrivelse <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="problem"
                value={formData.problem}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, problem: e.target.value }))
                }
                placeholder="Beskriv problemet som skal løses"
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="min_solution">Løsningsforslag</Label>
              <Textarea
                id="min_solution"
                value={formData.min_solution}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, min_solution: e.target.value }))
                }
                placeholder="Beskriv foreslått løsning"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-base font-semibold">Målgruppe</Label>

            <div>
              <Label htmlFor="user_ctx">Brukerkontekst</Label>
              <Textarea
                id="user_ctx"
                value={formData.user_ctx}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, user_ctx: e.target.value }))
                }
                placeholder="Hvem er brukerne? Hva er deres behov og kontekst?"
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="current_solution">Dagens løsning</Label>
              <Textarea
                id="current_solution"
                value={formData.current_solution}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, current_solution: e.target.value }))
                }
                placeholder="Beskriv hvordan dette håndteres i dag"
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="resource_assessment">Ressursvurderinger</Label>
              <Textarea
                id="resource_assessment"
                value={formData.resource_assessment}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, resource_assessment: e.target.value }))
                }
                placeholder="Beskriv ressursbehov og vurderinger"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <Label className="text-base font-semibold">Verdi/KPI (valgfritt)</Label>

            <div>
              <Label htmlFor="kpi_name">KPI Navn</Label>
              <Input
                id="kpi_name"
                value={formData.kpi_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, kpi_name: e.target.value }))
                }
                placeholder="F.eks. 'Effektivitet' eller 'Tidsbesparing'"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kpi_baseline">Baseline</Label>
                <Input
                  id="kpi_baseline"
                  value={formData.kpi_baseline}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, kpi_baseline: e.target.value }))
                  }
                  placeholder="Nåværende verdi"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="kpi_target">Target/Mål</Label>
                <Input
                  id="kpi_target"
                  value={formData.kpi_target}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, kpi_target: e.target.value }))
                  }
                  placeholder="Ønsket verdi"
                  className="mt-1"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Definer hvordan suksess skal måles
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={!isFormValid || loading}>
              {loading ? 'Oppretter...' : 'Opprett element'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
