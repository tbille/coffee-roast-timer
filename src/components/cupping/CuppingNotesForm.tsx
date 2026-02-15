import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUpdateCuppingNotes } from '@/hooks/useCuppingNotes';
import { RoastProfile } from '@/types/roast.types';
import { CuppingScoreSlider } from './CuppingScoreSlider';
import { FlavorTagSelector } from './FlavorTagSelector';
import { BrewMethodSelect } from './BrewMethodSelect';
import { PhotoUpload } from './PhotoUpload';
import { format } from 'date-fns';

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
  const { toast } = useToast();
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
      cupping_score: profile.cupping_score || 70,
      cupping_date: profile.cupping_date 
        ? format(new Date(profile.cupping_date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      rest_days: profile.rest_days || null,
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

  const onSubmit = async (data: CuppingNotesFormData) => {
    try {
      await updateMutation.mutateAsync({
        cupping_score: data.cupping_score,
        cupping_date: data.cupping_date || null,
        rest_days: data.rest_days || null,
        flavor_notes: data.flavor_notes || null,
        flavor_tags: data.flavor_tags || null,
        brew_method: data.brew_method || null,
        roasted_bean_photo_url: data.roasted_bean_photo_url || null,
      });

      toast({
        title: 'Tasting notes saved',
        description: 'Your cupping notes have been saved successfully.',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving cupping notes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save cupping notes. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Cupping Score */}
      <CuppingScoreSlider
        value={cuppingScore}
        onChange={(value) => setValue('cupping_score', value)}
      />

      {/* Cupping Date & Rest Days */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cupping-date">Cupping Date</Label>
          <Input
            id="cupping-date"
            type="date"
            {...register('cupping_date')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rest-days">Rest Days</Label>
          <Input
            id="rest-days"
            type="number"
            min="0"
            placeholder="0"
            {...register('rest_days', { 
              setValueAs: (v) => v === '' ? null : parseInt(v, 10) 
            })}
          />
        </div>
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
        <p className="text-sm text-red-600">{errors.flavor_tags.message}</p>
      )}

      {/* Brew Method */}
      <BrewMethodSelect
        value={brewMethod}
        onChange={(value) => setValue('brew_method', value)}
      />

      {/* Flavor Notes */}
      <div className="space-y-2">
        <Label htmlFor="flavor-notes">Tasting Notes</Label>
        <Textarea
          id="flavor-notes"
          placeholder="Describe the flavors, acidity, body, finish, and overall impression..."
          className="min-h-32"
          {...register('flavor_notes')}
        />
        {errors.flavor_notes && (
          <p className="text-sm text-red-600">{errors.flavor_notes.message}</p>
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
          {updateMutation.isPending ? 'Saving...' : 'Save Notes'}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Tasting Notes</SheetTitle>
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
          <DialogTitle>Edit Tasting Notes</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
