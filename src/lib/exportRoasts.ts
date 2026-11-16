/**
 * CSV / JSON export of the user's roasts: saved rows from the account plus
 * drafts kept on this device. Everything runs in the browser.
 */
import type { RoastDraft } from '@/types/roast-session.types';
import { PLACE_LABELS, PROCESS_LABELS, ROAST_LEVEL_LABELS, type RoastLevel } from '@/types/roast-session.types';
import { deriveRoastFacts, type ProfileViewInput } from '@/utils/roastProfileView';
import { normaliseOrigin } from '@/lib/origins';
import { msToSeconds } from '@/lib/format';
import { buildRoastRow, findEvent } from '@/lib/saveRoast';

/** The subset of a `roast_profiles` row the export reads. */
export interface ExportableRow {
  id: string;
  created_at: string;
  beans_name: string;
  origin?: string | null;
  farm_name?: string | null;
  roast_process?: string | null;
  roaster_type?: string | null;
  initial_weight?: number | null;
  final_weight?: number | null;
  duration_seconds: number;
  milestones?: unknown;
  crack_events?: unknown;
  roaster_settings?: unknown;
  environmental_notes?: string | null;
  notes?: string | null;
  cupping_score?: number | null;
}

export interface ExportRecord {
  id: string;
  source: 'account' | 'device';
  roasted_at: string;
  bean: string;
  origin: string;
  farm: string;
  process: string;
  roast_level: string;
  roaster: string;
  weight_in_g: number | '';
  weight_out_g: number | '';
  loss_percent: number | '';
  total_s: number;
  yellowing_s: number | '';
  first_crack_s: number | '';
  second_crack_s: number | '';
  development_s: number | '';
  development_percent: number | '';
  environment: string;
  notes: string;
  cupping_score: number | '';
}

const round1 = (n: number | undefined): number | '' => (n === undefined || !Number.isFinite(n) ? '' : Math.round(n * 10) / 10);
const orBlank = (n: number | null | undefined): number | '' => (typeof n === 'number' && Number.isFinite(n) ? n : '');

function settingsLevel(settings: unknown): string {
  const level = (settings as { roast_level?: unknown } | null)?.roast_level;
  return typeof level === 'string' && level in ROAST_LEVEL_LABELS ? ROAST_LEVEL_LABELS[level as RoastLevel] : '';
}

function yellowingFrom(milestones: unknown): number | '' {
  if (!Array.isArray(milestones)) return '';
  const m = milestones.find((x) => x && (x as { event_type?: string }).event_type === 'yellowing') as { time_seconds?: number } | undefined;
  return orBlank(m?.time_seconds);
}

export function exportRecordFromRow(row: ExportableRow): ExportRecord {
  const facts = deriveRoastFacts(row as unknown as ProfileViewInput);
  return {
    id: row.id,
    source: 'account',
    roasted_at: row.created_at,
    bean: row.beans_name ?? '',
    origin: normaliseOrigin(row.origin),
    farm: row.farm_name ?? '',
    process: row.roast_process ?? '',
    roast_level: settingsLevel(row.roaster_settings),
    roaster: row.roaster_type ?? '',
    weight_in_g: orBlank(row.initial_weight),
    weight_out_g: orBlank(row.final_weight),
    loss_percent: round1(facts.weightLossPercent),
    total_s: facts.totalSeconds,
    yellowing_s: yellowingFrom(row.milestones),
    first_crack_s: orBlank(facts.firstCrack?.time),
    second_crack_s: orBlank(facts.secondCrack?.time),
    development_s: orBlank(facts.developmentSeconds),
    development_percent: round1(facts.developmentPercent),
    environment: row.environmental_notes ?? '',
    notes: row.notes ?? '',
    cupping_score: orBlank(row.cupping_score),
  };
}

export function exportRecordFromDraft(draft: RoastDraft): ExportRecord {
  const row = buildRoastRow(draft, '');
  const base = exportRecordFromRow({ ...row, id: draft.result.id, created_at: row.created_at ?? new Date(draft.result.chargedAt).toISOString(), beans_name: row.beans_name });
  const y = findEvent(draft.result.events, 'yellowing');
  return {
    ...base,
    source: 'device',
    process: draft.details.process ? PROCESS_LABELS[draft.details.process] : '',
    roast_level: draft.details.roastLevel ? ROAST_LEVEL_LABELS[draft.details.roastLevel] : '',
    yellowing_s: y ? msToSeconds(y.t) : '',
    environment: [draft.details.place ? PLACE_LABELS[draft.details.place] : '', draft.details.ambientC !== undefined ? `${draft.details.ambientC} °C` : '']
      .filter(Boolean)
      .join(' · '),
  };
}

const CSV_COLUMNS: (keyof ExportRecord)[] = [
  'id', 'source', 'roasted_at', 'bean', 'origin', 'farm', 'process', 'roast_level', 'roaster',
  'weight_in_g', 'weight_out_g', 'loss_percent', 'total_s', 'yellowing_s', 'first_crack_s',
  'second_crack_s', 'development_s', 'development_percent', 'environment', 'notes', 'cupping_score',
];

function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  // Spreadsheet formula injection guard.
  if (/^[=+\-@\t\r]/.test(text) && typeof value === 'string') text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function recordsToCsv(records: ExportRecord[]): string {
  const lines = [CSV_COLUMNS.join(',')];
  for (const r of records) lines.push(CSV_COLUMNS.map((c) => csvCell(r[c])).join(','));
  return lines.join('\r\n');
}

export function collectRecords(rows: ExportableRow[], drafts: RoastDraft[]): ExportRecord[] {
  const ids = new Set(rows.map((r) => r.id));
  return [
    ...rows.map(exportRecordFromRow),
    ...drafts.filter((d) => !ids.has(d.result.id)).map(exportRecordFromDraft),
  ].sort((a, b) => b.roasted_at.localeCompare(a.roasted_at));
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const BOM = String.fromCharCode(0xfeff);
const stamp = () => new Date().toISOString().slice(0, 10);

export function exportRoastsCsv(rows: ExportableRow[], drafts: RoastDraft[]): number {
  const records = collectRecords(rows, drafts);
  // BOM so spreadsheet apps read UTF-8 (°, accents) correctly.
  download(`roast-timer-roasts-${stamp()}.csv`, `${BOM}${recordsToCsv(records)}`, 'text/csv;charset=utf-8');
  return records.length;
}

/** Full data: account rows as stored, plus device drafts as-is. */
export function exportRoastsJson(rows: unknown[], drafts: RoastDraft[]): number {
  const ids = new Set((rows as Array<{ id?: string }>).map((r) => r.id));
  const deviceOnly = drafts.filter((d) => !ids.has(d.result.id));
  const payload = { exported_at: new Date().toISOString(), schema_version: 2, roasts: rows, device_drafts: deviceOnly };
  download(`roast-timer-roasts-${stamp()}.json`, JSON.stringify(payload, null, 2), 'application/json');
  return rows.length + deviceOnly.length;
}
