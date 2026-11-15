import { useState } from "react";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export interface RoastNotesData {
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

  const meta = [
    data.cupping_date && `Cupped ${format(new Date(data.cupping_date), "MMM d, yyyy")}`,
    data.rest_days != null && `${data.rest_days} days rest`,
    data.brew_method && `Brewed as ${data.brew_method}`,
  ].filter(Boolean) as string[];

  return (
    <Card className="shadow-coffee">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle as="h2" className="text-lg">Tasting notes</CardTitle>
        {isOwner && (
          <Button variant="ghost" size="sm" onClick={onEditCupping}>
            {data.cupping_score != null || data.flavor_tags?.length ? "Edit cupping" : "Add cupping"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {(data.cupping_score != null || Boolean(data.flavor_tags?.length)) && (
          <div className="flex flex-wrap items-center gap-3">
            {data.cupping_score != null && (
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-3xl font-semibold tabular-nums">{data.cupping_score}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
            )}
            {data.flavor_tags?.length ? (
              <ul className="flex flex-wrap gap-1.5" aria-label="Flavor tags">
                {data.flavor_tags.map((tag) => (
                  <li key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-sm text-secondary-foreground">
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}

        {meta.length > 0 && <p className="text-xs text-muted-foreground">{meta.join(" · ")}</p>}

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
          <div className="group flex items-start gap-2">
            <p className="flex-1 whitespace-pre-wrap leading-relaxed">{data.notes}</p>
            {isOwner && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setEditing(true)} aria-label="Edit notes">
                <Pencil />
              </Button>
            )}
          </div>
        ) : (
          isOwner && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="w-full rounded-md border border-dashed p-4 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50"
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
