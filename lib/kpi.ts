import { startOfISOWeek, endOfISOWeek, differenceInDays, parseISO } from 'date-fns';
import { Database } from './database.types';

type Item = Database['public']['Tables']['items']['Row'];

export interface WeeklyKPIs {
  f1Volume: number;
  f1ToF2Conversion: number;
  f1ToF2LeadTimeMedian: number;
  rygStatus: 'red' | 'yellow' | 'green';
}

export function calculateWeeklyKPIs(allItems: Item[]): WeeklyKPIs {
  const now = new Date();
  const weekStart = startOfISOWeek(now);
  const weekEnd = endOfISOWeek(now);

  const thisWeekStatus1Items = allItems.filter((item) => {
    const createdAt = parseISO(item.created_at);
    return (
      item.status === 'status1' &&
      createdAt >= weekStart &&
      createdAt <= weekEnd
    );
  });

  const f1Volume = thisWeekStatus1Items.length;

  const thisWeekItemsMovedToF2Plus = thisWeekStatus1Items.filter((item) => {
    if (!item.f1_locked_at) return false;
    const lockedAt = parseISO(item.f1_locked_at);
    return lockedAt >= weekStart && lockedAt <= weekEnd;
  });

  const f1ToF2Conversion = f1Volume > 0
    ? (thisWeekItemsMovedToF2Plus.length / f1Volume) * 100
    : 0;

  const itemsWithLeadTime = allItems.filter(
    (item) => item.f1_locked_at && item.status !== 'status1'
  );

  const leadTimes = itemsWithLeadTime.map((item) => {
    const created = parseISO(item.created_at);
    const locked = parseISO(item.f1_locked_at!);
    return differenceInDays(locked, created);
  }).sort((a, b) => a - b);

  const f1ToF2LeadTimeMedian = leadTimes.length > 0
    ? leadTimes[Math.floor(leadTimes.length / 2)]
    : 0;

  let rygStatus: 'red' | 'yellow' | 'green' = 'red';
  if (f1ToF2Conversion > 70) {
    rygStatus = 'green';
  } else if (f1ToF2Conversion >= 40) {
    rygStatus = 'yellow';
  }

  return {
    f1Volume,
    f1ToF2Conversion: Math.round(f1ToF2Conversion),
    f1ToF2LeadTimeMedian,
    rygStatus,
  };
}

export function generateSITREP(allItems: Item[], kpis: WeeklyKPIs): string {
  const now = new Date();
  const weekStart = startOfISOWeek(now);
  const weekEnd = endOfISOWeek(now);

  const thisWeekItems = allItems.filter((item) => {
    const createdAt = parseISO(item.created_at);
    return createdAt >= weekStart && createdAt <= weekEnd;
  });

  const status2Count = allItems.filter((i) => i.status === 'status2').length;
  const status3Count = allItems.filter((i) => i.status === 'status3').length;
  const status4Count = allItems.filter((i) => i.status === 'status4').length;

  const topTags = getTopTags(thisWeekItems, 3);

  return `SITREP UKE ${now.getFullYear()}-W${getISOWeek(now)}

F1 Volum: ${kpis.f1Volume} nye idéer denne uken
F1→F2 Konvertering: ${kpis.f1ToF2Conversion}% (${kpis.rygStatus.toUpperCase()})
F1→F2 Ledetid: ${kpis.f1ToF2LeadTimeMedian} dager (median)

Aktive prosjekter: ${status2Count} i Discovery, ${status3Count} i Development
Fullført denne perioden: ${status4Count} items i Done

Top Tags: ${topTags.join(', ') || 'ingen'}

Neste uke: Fokus på å øke conversion rate og redusere ledetid.`;
}

function getISOWeek(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

function getTopTags(items: Item[], limit: number): string[] {
  const tagCounts = new Map<string, number>();

  items.forEach((item) => {
    item.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}
