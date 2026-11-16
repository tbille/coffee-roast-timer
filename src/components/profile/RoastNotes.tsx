import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import { parseDateOnly, restDaysBetween } from "@/utils/roastProfileView";

export interface RoastNotesData {
  created_at?: string | null;
  notes?: string | null;
  cupping_score?: number | null;
  cupping_date?: string | null;
  rest_days?: number | null;
  flavor_notes?: string | null;
  flavor_tags?: string[] | null;
  brew_method?: string | null;
  roasted_bean_photo_url?: string | null;
}

interface RoastNotesProps {
  data: RoastNotesData;
  isOwner: boolean;
  onSaveNotes: (notes: string) => Promise<boolean>;
  onEditCupping: () => void;
}

function hasTastingContent(d: RoastNotesData): boolean {
  return Boolean(
    d.notes?.trim() || d.flavor_notes?.trim() || d.flavor_tags?.length || d.cupping_score != null || d.roasted_bean_photo_url || d.brew_method,
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

export function RoastNotes({ data, isOwner, onSaveNotes, onEditCupping }: RoastNotesProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  const hasContent = hasTastingContent(data);
  if (!hasContent && !isOwner) return null;

  const save = async () => {
    setSaving(true);
    const ok = await onSaveNotes(draft);
    setSaving(false);
    if (ok) setEditing(false);
  };

  const cuppedOn = parseDateOnly(data.cupping_date);
  // Rest is derived from the roast date and the cupping date; the stored value is a fallback.
  const restDays = restDaysBetween(data.created_at, data.cupping_date) ?? data.rest_days ?? undefined;
  const hasCupping = data.cupping_score != null || Boolean(data.flavor_tags?.length) || Boolean(cuppedOn) || Boolean(data.brew_method);

  return (
    <Card id="notes" className="scroll-mt-24" aria-labelledby="notes-title">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle as="h2" id="notes-title" className="text-lg">Tasting notes</CardTitle>
        {isOwner && (
          <Button variant="ghost" size="sm" onClick={onEditCupping}>
            {data.cupping_score != null || data.flavor_tags?.length ? "Edit tasting" : "Add tasting"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {hasCupping && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
            {data.cupping_score != null && (
              <Fact label="Score">
                <span className="font-mono text-2xl font-semibold tabular-nums">{data.cupping_score}</span>
                <span className="ml-1 font-mono text-sm text-muted-foreground tabular-nums">/ 100</span>
              </Fact>
            )}
            {cuppedOn && (
              <Fact label="Tasted">
                <time dateTime={data.cupping_date ?? undefined} className="font-mono tabular-nums">{formatDate(cuppedOn)}</time>
              </Fact>
            )}
            {restDays !== undefined && (
              <Fact label="Rest">
                <span className="font-mono tabular-nums">{restDays}</span> {restDays === 1 ? "day" : "days"}
              </Fact>
            )}
            {data.brew_method && <Fact label="Brewed as">{data.brew_method}</Fact>}
          </dl>
        )}

        {data.flavor_tags?.length ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Flavour tags">
            {data.flavor_tags.map((tag) => (
              <li key={tag} className="rounded-full border px-2.5 py-0.5 text-sm text-foreground">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        {data.flavor_notes?.trim() && <p className="whitespace-pre-wrap leading-relaxed">{data.flavor_notes}</p>}

        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="How did it taste? What would you change next time?"
              className="min-h-28"
              aria-label="Roast notes"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save notes"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraft(data.notes ?? "");
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : data.notes?.trim() ? (
          <div className="flex items-start gap-2">
            <div className="flex-1">
              {hasCupping && <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Roast notes</h3>}
              <p className="whitespace-pre-wrap leading-relaxed">{data.notes}</p>
            </div>
            {isOwner && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setEditing(true)} aria-label="Edit notes">
                <Pencil strokeWidth={1.75} />
              </Button>
            )}
          </div>
        ) : (
          isOwner && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="w-full rounded-md border border-dashed p-4 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              Add notes: how it tasted, and what you would change next time.
            </button>
          )
        )}

        {data.roasted_bean_photo_url && !photoFailed && (
          <img
            src={data.roasted_bean_photo_url}
            alt="Roasted beans from this roast"
            loading="lazy"
            className="w-full max-w-sm rounded-lg border"
            onError={() => setPhotoFailed(true)}
          />
        )}
      </CardContent>
    </Card>
  );
}
