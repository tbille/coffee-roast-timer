import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';
import { useUpdateCuppingNotes } from '@/hooks/useCuppingNotes';
import type { RoastProfile } from '@/types/roast.types';
import { CuppingScoreSlider } from './CuppingScoreSlider';
import { FlavorTagSelector } from './FlavorTagSelector';
import { BrewMethodSelect } from './BrewMethodSelect';
import { PhotoUpload } from './PhotoUpload';
import { format } from 'date-fns';
import { parseDateOnly, restDaysBetween } from '@/utils/roastProfileView';

const cuppingNotesSchema = z.object({
  cupping_score: z.number().min(0).max(100),
  cupping_date: z.string().optional(),
  rest_days: z.number().min(0).optional().nullable(),
  flavor_notes: z.string().max(1000).optional(),
  flavor_tags: z.array(z.string()).max(8).optional(),
  brew_method: z.string().optional(),
  roasted_bean_photo_url: z.string().optional(),
});

type CuppingNotesFormData = z.infer<typeof cuppingNotesSchema>;

interface CuppingNotesFormProps {
  profile: RoastProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CuppingNotesForm({ profile, open, onOpenChange }: CuppingNotesFormProps) {
  const isMobile = useIsMobile();
  const updateMutation = useUpdateCuppingNotes(profile.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CuppingNotesFormData>({
    resolver: zodResolver(cuppingNotesSchema),
    defaultValues: {
      cupping_score: profile.cupping_score ?? 70,
      cupping_date: parseDateOnly(profile.cupping_date)
        ? format(parseDateOnly(profile.cupping_date)!, 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      rest_days: profile.rest_days ?? null,
      flavor_notes: profile.flavor_notes || '',
      flavor_tags: profile.flavor_tags || [],
      brew_method: profile.brew_method || '',
      roasted_bean_photo_url: profile.roasted_bean_photo_url || '',
    },
  });

  const cuppingScore = watch('cupping_score');
  const flavorTags = watch('flavor_tags');
  const brewMethod = watch('brew_method');
  const photoUrl = watch('roasted_bean_photo_url');
  const cuppingDate = watch('cupping_date');
  // Rest is derived from the roast date and the tasting date
  const derivedRestDays = restDaysBetween(profile.created_at, cuppingDate);

  const onSubmit = async (data: CuppingNotesFormData) => {
    try {
      await updateMutation.mutateAsync({
        cupping_score: data.cupping_score,
        cupping_date: data.cupping_date || null,
        rest_days: restDaysBetween(profile.created_at, data.cupping_date) ?? data.rest_days ?? null,
        flavor_notes: data.flavor_notes || null,
        flavor_tags: data.flavor_tags || null,
        brew_method: data.brew_method || null,
        roasted_bean_photo_url: data.roasted_bean_photo_url || null,
      });

      toast.success('Tasting notes saved');

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving cupping notes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      toast.error('Tasting notes could not be saved', { description: errorMessage });
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Cupping Score */}
      <CuppingScoreSlider
        value={cuppingScore}
        onChange={(value) => setValue('cupping_score', value)}
      />

      {/* Tasting date; rest is derived from the roast date */}
      <div className="space-y-2">
        <Label htmlFor="cupping-date">Tasting date</Label>
        <Input id="cupping-date" type="date" className="font-mono tabular-nums sm:max-w-56" aria-describedby="cupping-rest" {...register('cupping_date')} />
        <p id="cupping-rest" className="text-xs text-muted-foreground">
          {derivedRestDays !== undefined ? (
            <>
              Rested <span className="font-mono tabular-nums">{derivedRestDays}</span> {derivedRestDays === 1 ? 'day' : 'days'} after roasting
            </>
          ) : (
            'Rest is worked out from the roast date and this date.'
          )}
        </p>
      </div>

      {/* Photo Upload */}
      <PhotoUpload
        currentPhotoUrl={photoUrl}
        onPhotoUploaded={(url) => setValue('roasted_bean_photo_url', url)}
        onPhotoRemoved={() => setValue('roasted_bean_photo_url', '')}
      />

      {/* Flavor Tags */}
      <FlavorTagSelector
        selected={flavorTags || []}
        onChange={(tags) => setValue('flavor_tags', tags)}
      />
      {errors.flavor_tags && (
        <p className="text-sm text-destructive">{errors.flavor_tags.message}</p>
      )}

      {/* Brew Method */}
      <BrewMethodSelect
        value={brewMethod}
        onChange={(value) => setValue('brew_method', value)}
      />

      {/* Flavor Notes */}
      <div className="space-y-2">
        <Label htmlFor="flavor-notes">Tasting notes</Label>
        <Textarea
          id="flavor-notes"
          placeholder="Describe the flavors, acidity, body, finish, and overall impression..."
          className="min-h-32"
          {...register('flavor_notes')}
        />
        {errors.flavor_notes && (
          <p className="text-sm text-destructive">{errors.flavor_notes.message}</p>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving…' : 'Save tasting'}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Tasting notes</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {formContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tasting notes</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
