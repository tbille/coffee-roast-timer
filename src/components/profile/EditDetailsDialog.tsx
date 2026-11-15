import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface EditableDetails {
  beans_name: string;
  origin: string;
  farm_name: string;
  roast_process: string;
  coffee_roaster: string;
  initial_weight: number;
  final_weight: number;
}

interface EditDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: EditableDetails;
  /** Free-text roaster field is only relevant for profiles without a structured roaster */
  showRoasterField: boolean;
  onSave: (details: EditableDetails) => Promise<boolean>;
}

export function EditDetailsDialog({ open, onOpenChange, initial, showRoasterField, onSave }: EditDetailsDialogProps) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  const set = <K extends keyof EditableDetails>(key: K, value: EditableDetails[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.beans_name.trim()) return;
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit roast details</DialogTitle>
            <DialogDescription>Bean information and batch weights shown on this profile.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="edit-beans">Bean name</Label>
            <Input id="edit-beans" value={form.beans_name} onChange={(e) => set("beans_name", e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-origin">Origin</Label>
              <Input id="edit-origin" value={form.origin} onChange={(e) => set("origin", e.target.value)} placeholder="e.g. Ethiopia" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-process">Process</Label>
              <Input id="edit-process" value={form.roast_process} onChange={(e) => set("roast_process", e.target.value)} placeholder="e.g. Washed" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-farm">Farm</Label>
            <Input id="edit-farm" value={form.farm_name} onChange={(e) => set("farm_name", e.target.value)} />
          </div>
          {showRoasterField && (
            <div className="space-y-1.5">
              <Label htmlFor="edit-roaster">Roaster</Label>
              <Input id="edit-roaster" value={form.coffee_roaster} onChange={(e) => set("coffee_roaster", e.target.value)} placeholder="e.g. Gene CBR-101" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-in">Green weight (g)</Label>
              <Input id="edit-in" type="number" inputMode="decimal" min={0} step="any" value={form.initial_weight || ""} onChange={(e) => set("initial_weight", Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-out">Roasted weight (g)</Label>
              <Input id="edit-out" type="number" inputMode="decimal" min={0} step="any" value={form.final_weight || ""} onChange={(e) => set("final_weight", Number(e.target.value) || 0)} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.beans_name.trim()}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
