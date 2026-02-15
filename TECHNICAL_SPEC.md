# Coffee Roast Timer - Technical Specification
## New Features Implementation Guide

**Version:** 1.0  
**Date:** February 15, 2026  
**Based on:** DESIGN_SPEC.md v1.0 (Simplified)  
**Stack:** React + TypeScript + Vite + Supabase + shadcn/ui + TanStack Query

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema Changes](#database-schema-changes)
3. [Type Definitions](#type-definitions)
4. [API Layer](#api-layer)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [File Storage](#file-storage)
8. [Implementation Phases](#implementation-phases)
9. [Testing Strategy](#testing-strategy)
10. [Performance Considerations](#performance-considerations)

---

## Overview

### Features Summary

1. **Cupping & Tasting Notes** (Priority: High)
   - Cupping score (0-100 slider)
   - Photo upload for roasted beans
   - Flavor tag selection (simplified dropdown)
   - Brew method tracking
   - Tasting notes textarea

2. **Environmental Data Tracking** (Priority: Medium)
   - Single text field for conditions
   - Optional feature, minimal UI

3. **Profile Comparison** (Priority: High)
   - Compare 2 profiles side-by-side
   - Temperature chart overlay
   - Statistics comparison table
   - Mobile-optimized vertical layout

### Technology Stack

- **Frontend:** React 18.3 + TypeScript 5.8
- **Build Tool:** Vite 5.4
- **UI Library:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS 3.4
- **Data Fetching:** TanStack Query (React Query) 5.83
- **Backend:** Supabase (PostgreSQL + Storage + Auth)
- **Charts:** Recharts 2.15
- **Forms:** React Hook Form 7.61 + Zod validation

---

## Database Schema Changes

### 1. Update `roast_profiles` Table

Add new columns to the existing `roast_profiles` table:

```sql
-- Cupping & Tasting Notes columns
ALTER TABLE roast_profiles
ADD COLUMN cupping_score INTEGER CHECK (cupping_score >= 0 AND cupping_score <= 100),
ADD COLUMN cupping_date DATE,
ADD COLUMN rest_days INTEGER CHECK (rest_days >= 0),
ADD COLUMN flavor_notes TEXT,
ADD COLUMN flavor_tags TEXT[], -- Array of flavor tag strings
ADD COLUMN brew_method VARCHAR(100),
ADD COLUMN roasted_bean_photo_url TEXT;

-- Environmental Data (simplified)
ALTER TABLE roast_profiles
ADD COLUMN environmental_notes TEXT CHECK (char_length(environmental_notes) <= 200);

-- Indexes for performance
CREATE INDEX idx_roast_profiles_cupping_score ON roast_profiles(cupping_score);
CREATE INDEX idx_roast_profiles_flavor_tags ON roast_profiles USING GIN(flavor_tags);
CREATE INDEX idx_roast_profiles_cupping_date ON roast_profiles(cupping_date);
```

### 2. Storage Bucket for Photos

Create a new storage bucket for roasted bean photos:

```sql
-- Via Supabase Dashboard or SQL
INSERT INTO storage.buckets (id, name, public)
VALUES ('roasted-bean-photos', 'roasted-bean-photos', true);

-- RLS Policies
CREATE POLICY "Users can upload their own bean photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'roasted-bean-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view bean photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'roasted-bean-photos');

CREATE POLICY "Users can delete their own bean photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'roasted-bean-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3. Migration Script

Create migration file: `supabase/migrations/[timestamp]_add_cupping_environmental_features.sql`

```sql
-- Migration: Add Cupping & Environmental Features
BEGIN;

-- Add new columns
ALTER TABLE roast_profiles
ADD COLUMN IF NOT EXISTS cupping_score INTEGER CHECK (cupping_score >= 0 AND cupping_score <= 100),
ADD COLUMN IF NOT EXISTS cupping_date DATE,
ADD COLUMN IF NOT EXISTS rest_days INTEGER CHECK (rest_days >= 0),
ADD COLUMN IF NOT EXISTS flavor_notes TEXT,
ADD COLUMN IF NOT EXISTS flavor_tags TEXT[],
ADD COLUMN IF NOT EXISTS brew_method VARCHAR(100),
ADD COLUMN IF NOT EXISTS roasted_bean_photo_url TEXT,
ADD COLUMN IF NOT EXISTS environmental_notes TEXT CHECK (char_length(environmental_notes) <= 200);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_roast_profiles_cupping_score ON roast_profiles(cupping_score);
CREATE INDEX IF NOT EXISTS idx_roast_profiles_flavor_tags ON roast_profiles USING GIN(flavor_tags);
CREATE INDEX IF NOT EXISTS idx_roast_profiles_cupping_date ON roast_profiles(cupping_date);

COMMIT;
```

---

## Type Definitions

### Update `src/types/roast.types.ts`

The existing types already include the necessary fields! Just ensure they're being used:

```typescript
// Already defined in roast.types.ts (lines 36-49):
export interface RoastProfile {
  // ... existing fields ...
  
  // Cupping & Tasting Notes (already present!)
  cupping_score?: number;
  cupping_date?: string;
  rest_days?: number;
  flavor_notes?: string;
  flavor_tags?: string[];
  brew_method?: string;
  roasted_bean_photo_url?: string;

  // Environmental Data (simplified from existing)
  // REMOVE: ambient_temperature, ambient_temp_unit, ambient_humidity
  // KEEP: environmental_notes only
  environmental_notes?: string;
}
```

### Add New Types

Create `src/types/cupping.types.ts`:

```typescript
export interface CuppingNotes {
  cupping_score: number;
  cupping_date: string;
  rest_days?: number;
  flavor_notes?: string;
  flavor_tags?: string[];
  brew_method?: string;
  roasted_bean_photo_url?: string;
}

export interface FlavorTag {
  id: string;
  label: string;
}

export const BREW_METHODS = [
  'Espresso',
  'Pour Over',
  'French Press',
  'AeroPress',
  'Drip Coffee',
  'Cold Brew',
  'Moka Pot',
  'Turkish',
  'Other',
] as const;

export type BrewMethod = typeof BREW_METHODS[number];
```

### Add Comparison Types

Create `src/types/comparison.types.ts`:

```typescript
import { RoastProfile, RoastStatistics } from './roast.types';

export interface ComparisonProfile {
  profile: RoastProfile;
  statistics: RoastStatistics;
  color: string; // Chart line color
}

export interface ComparisonData {
  profiles: ComparisonProfile[];
  maxProfiles: 2; // Limit to 2
}

export const COMPARISON_COLORS = {
  profile1: '#3B82F6', // blue-500
  profile2: '#F59E0B', // amber-500
} as const;
```

---

## API Layer

### Supabase Queries

Update `src/integrations/supabase/types.ts` (regenerate with Supabase CLI):

```bash
npx supabase gen types typescript --project-id [your-project-id] > src/integrations/supabase/types.ts
```

### Create API Hooks

Create `src/hooks/useCuppingNotes.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CuppingNotes } from '@/types/cupping.types';

export function useUpdateCuppingNotes(profileId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cuppingNotes: Partial<CuppingNotes>) => {
      const { data, error } = await supabase
        .from('roast_profiles')
        .update(cuppingNotes)
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roast_profile', profileId] });
    },
  });
}
```

Create `src/hooks/usePhotoUpload.ts`:

```typescript
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  const uploadPhoto = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    setUploading(true);
    setProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('roasted-bean-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('roasted-bean-photos')
        .getPublicUrl(fileName);

      setProgress(100);
      return publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (url: string) => {
    if (!user) throw new Error('User not authenticated');

    // Extract path from URL
    const path = url.split('/roasted-bean-photos/')[1];
    
    const { error } = await supabase.storage
      .from('roasted-bean-photos')
      .remove([path]);

    if (error) throw error;
  };

  return { uploadPhoto, deletePhoto, uploading, progress };
}
```

Create `src/hooks/useProfileComparison.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RoastProfile } from '@/types/roast.types';
import { ComparisonProfile, COMPARISON_COLORS } from '@/types/comparison.types';
import { calculateRoastStatistics } from '@/utils/roastStatistics';

export function useProfileComparison(profileIds: string[]) {
  return useQuery({
    queryKey: ['profile_comparison', profileIds],
    queryFn: async (): Promise<ComparisonProfile[]> => {
      const { data, error } = await supabase
        .from('roast_profiles')
        .select('*')
        .in('id', profileIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((profile: RoastProfile, index) => ({
        profile,
        statistics: calculateRoastStatistics(profile),
        color: index === 0 ? COMPARISON_COLORS.profile1 : COMPARISON_COLORS.profile2,
      }));
    },
    enabled: profileIds.length > 0 && profileIds.length <= 2,
  });
}
```

---

## Component Architecture

### New Components Structure

```
src/components/
├── cupping/
│   ├── CuppingNotesCard.tsx          # Display cupping notes on profile page
│   ├── CuppingNotesForm.tsx          # Edit cupping notes (dialog/sheet)
│   ├── CuppingScoreSlider.tsx        # Score input (0-100 slider)
│   ├── FlavorTagSelector.tsx         # Simplified searchable dropdown
│   ├── PhotoUpload.tsx               # Photo upload component
│   └── BrewMethodSelect.tsx          # Brew method dropdown
├── comparison/
│   ├── ComparisonPage.tsx            # Main comparison page
│   ├── ProfileSelector.tsx           # Modal/sheet to select profiles
│   ├── ComparisonChart.tsx           # Temperature overlay chart
│   ├── ComparisonStats.tsx           # Statistics table/cards
│   └── ProfileCard.tsx               # Individual profile card
└── environmental/
    └── EnvironmentalInput.tsx        # Simple text input for conditions
```

### Component Details

#### 1. CuppingNotesCard.tsx

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RoastProfile } from '@/types/roast.types';
import { format } from 'date-fns';
import { useMobile } from '@/hooks/use-mobile';

interface CuppingNotesCardProps {
  profile: RoastProfile;
  onEdit: () => void;
}

export function CuppingNotesCard({ profile, onEdit }: CuppingNotesCardProps) {
  const isMobile = useMobile();
  
  if (!profile.cupping_score && !profile.flavor_notes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Tasting Notes
            <Button variant="outline" size="sm" onClick={onEdit}>
              Add Notes
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            No tasting notes yet. Cup your roast and record how it tastes!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Tasting Notes
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cupping Score */}
        {profile.cupping_score && (
          <div>
            <div className="text-2xl font-semibold text-gray-700">
              {profile.cupping_score}/100
            </div>
            {profile.cupping_date && (
              <div className="text-sm text-gray-500">
                Cupped on {format(new Date(profile.cupping_date), 'MMM d, yyyy')}
                {profile.rest_days && ` • ${profile.rest_days} days rest`}
              </div>
            )}
          </div>
        )}

        {/* Photo */}
        {profile.roasted_bean_photo_url && (
          <div className="relative">
            <img
              src={profile.roasted_bean_photo_url}
              alt="Roasted beans"
              className="w-full max-w-md rounded-lg"
              onContextMenu={isMobile ? (e) => {
                e.preventDefault();
                // Show long-press menu
              } : undefined}
            />
          </div>
        )}

        {/* Flavor Tags */}
        {profile.flavor_tags && profile.flavor_tags.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-500 mb-2">
              Flavor Profile:
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.flavor_tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-amber-100 text-amber-800">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Brew Method */}
        {profile.brew_method && (
          <div className="text-sm">
            <span className="text-gray-500">Brew Method: </span>
            <span className="font-medium text-gray-700">{profile.brew_method}</span>
          </div>
        )}

        {/* Notes */}
        {profile.flavor_notes && (
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Notes:</div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {profile.flavor_notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 2. CuppingScoreSlider.tsx

```typescript
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface CuppingScoreSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function CuppingScoreSlider({ value, onChange }: CuppingScoreSliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Cupping Score</Label>
        <div className="text-2xl font-semibold text-gray-700">
          {value}/100
        </div>
      </div>
      
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}
```

#### 3. FlavorTagSelector.tsx (Simplified)

```typescript
import { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

// Predefined flavor tags (alphabetical, no categories)
const FLAVOR_TAGS = [
  'Berry', 'Bitter', 'Bright', 'Buttery', 'Caramel', 'Cherry', 'Chocolate',
  'Citrus', 'Clean', 'Cocoa', 'Complex', 'Creamy', 'Earthy', 'Floral',
  'Fruity', 'Herbal', 'Honey', 'Juicy', 'Nutty', 'Roasted', 'Smooth',
  'Smoky', 'Spicy', 'Stone Fruit', 'Sweet', 'Tangy', 'Tea-like', 'Tropical',
  'Vanilla', 'Wine-like',
];

interface FlavorTagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export function FlavorTagSelector({ selected, onChange, maxTags = 8 }: FlavorTagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return FLAVOR_TAGS.filter((tag) =>
      tag.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      if (selected.length < maxTags) {
        onChange([...selected, tag]);
      }
    }
  };

  const removeTag = (tag: string) => {
    onChange(selected.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {selected.map((tag) => (
          <Badge key={tag} variant="secondary" className="bg-amber-100 text-amber-800">
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-amber-900"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            Add Flavor Tags...
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search flavors..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>No flavors found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {filtered.map((tag) => (
                <CommandItem
                  key={tag}
                  onSelect={() => toggleTag(tag)}
                  className="flex items-center gap-2"
                >
                  <div className={`h-4 w-4 border rounded flex items-center justify-center ${
                    selected.includes(tag) ? 'bg-primary border-primary' : 'border-gray-300'
                  }`}>
                    {selected.includes(tag) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  {tag}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length >= maxTags && (
        <p className="text-xs text-amber-600">
          Maximum {maxTags} tags selected
        </p>
      )}
    </div>
  );
}
```

#### 4. ComparisonChart.tsx

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ComparisonProfile } from '@/types/comparison.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComparisonChartProps {
  profiles: ComparisonProfile[];
}

export function ComparisonChart({ profiles }: ComparisonChartProps) {
  // Merge temperature data from both profiles
  const chartData = useMemo(() => {
    const maxLength = Math.max(
      ...profiles.map((p) => p.profile.temperature_data.length)
    );

    return Array.from({ length: maxLength }, (_, i) => {
      const dataPoint: any = { time: i };
      
      profiles.forEach((cp, index) => {
        const tempData = cp.profile.temperature_data[i];
        if (tempData) {
          dataPoint[`profile${index + 1}`] = tempData.currentTemp;
        }
      });

      return dataPoint;
    });
  }, [profiles]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temperature Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            {profiles.map((cp, index) => (
              <Line
                key={cp.profile.id}
                type="monotone"
                dataKey={`profile${index + 1}`}
                stroke={cp.color}
                strokeWidth={2}
                dot={false}
                name={cp.profile.beans_name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

---

## State Management

### TanStack Query Configuration

Already configured in the project. Use these patterns:

**Fetching profile data:**
```typescript
const { data: profile } = useQuery({
  queryKey: ['roast_profile', profileId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('roast_profiles')
      .select('*, profiles(username)')
      .eq('id', profileId)
      .single();
    if (error) throw error;
    return data;
  },
});
```

**Updating cupping notes:**
```typescript
const updateCuppingMutation = useUpdateCuppingNotes(profileId);

const handleSave = (notes: Partial<CuppingNotes>) => {
  updateCuppingMutation.mutate(notes, {
    onSuccess: () => {
      toast.success('Cupping notes saved!');
    },
  });
};
```

### Local State (React Hook Form)

For forms, use React Hook Form with Zod validation:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const cuppingNotesSchema = z.object({
  cupping_score: z.number().min(0).max(100),
  cupping_date: z.string().optional(),
  rest_days: z.number().min(0).optional(),
  flavor_notes: z.string().max(1000).optional(),
  flavor_tags: z.array(z.string()).max(8).optional(),
  brew_method: z.string().optional(),
});

type CuppingNotesFormData = z.infer<typeof cuppingNotesSchema>;

const form = useForm<CuppingNotesFormData>({
  resolver: zodResolver(cuppingNotesSchema),
  defaultValues: {
    cupping_score: 70,
    flavor_tags: [],
  },
});
```

---

## File Storage

### Photo Upload Flow

1. **Client-side compression:** Use `browser-image-compression` library
2. **Upload to Supabase Storage:** `roasted-bean-photos` bucket
3. **File naming:** `{user_id}/{timestamp}.{ext}`
4. **Max size:** 5MB
5. **Accepted formats:** JPG, PNG, WebP, HEIC

### Implementation Example

```typescript
import imageCompression from 'browser-image-compression';

const compressAndUpload = async (file: File) => {
  // Compress image
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  
  const compressedFile = await imageCompression(file, options);
  
  // Upload to Supabase
  const url = await uploadPhoto(compressedFile);
  
  return url;
};
```

---

## Implementation Phases

### Phase 1: Cupping Notes (Week 1) - HIGH PRIORITY

**Tasks:**
1. Database migration (cupping columns)
2. Update TypeScript types
3. Create storage bucket + RLS policies
4. Build `CuppingNotesCard` component
5. Build `CuppingNotesForm` with dialog/sheet
6. Implement `CuppingScoreSlider`
7. Implement `FlavorTagSelector`
8. Implement `PhotoUpload` component
9. Add to `RoastProfileDetails` page
10. Write tests

**Deliverable:** Users can add/edit cupping notes with score, tags, photo, and notes.

### Phase 2: Profile Comparison (Week 2) - HIGH PRIORITY

**Tasks:**
1. Create comparison page route
2. Build `ProfileSelector` component
3. Build `ComparisonChart` component
4. Build `ComparisonStats` component (desktop table, mobile cards)
5. Implement `useProfileComparison` hook
6. Add navigation to comparison page
7. Mobile optimization (vertical layout)
8. Write tests

**Deliverable:** Users can compare 2 profiles side-by-side with chart and stats.

### Phase 3: Environmental Data (Week 3) - MEDIUM PRIORITY

**Tasks:**
1. Database migration (environmental_notes column)
2. Update `SaveRoastDialog` to include environmental input
3. Display environmental notes on profile detail page
4. Simple collapsed/expanded state
5. Write tests

**Deliverable:** Users can optionally add environmental conditions as free text.

### Phase 4: Polish & Optimization (Week 4)

**Tasks:**
1. Mobile gesture support (swipe-to-delete, long-press)
2. Haptic feedback on mobile
3. Animation polish
4. Performance optimization (lazy loading, code splitting)
5. Accessibility audit (keyboard nav, screen readers)
6. Cross-browser testing
7. Documentation

---

## Testing Strategy

### Unit Tests

Test individual components and hooks:

```typescript
// Example: CuppingScoreSlider.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CuppingScoreSlider } from './CuppingScoreSlider';

describe('CuppingScoreSlider', () => {
  it('displays the current value', () => {
    render(<CuppingScoreSlider value={85} onChange={() => {}} />);
    expect(screen.getByText('85/100')).toBeInTheDocument();
  });

  it('calls onChange when slider moves', () => {
    const onChange = jest.fn();
    render(<CuppingScoreSlider value={70} onChange={onChange} />);
    // Simulate slider interaction
    // ...
    expect(onChange).toHaveBeenCalled();
  });
});
```

### Integration Tests

Test component interactions:

```typescript
// Example: CuppingNotesForm integration test
it('saves cupping notes successfully', async () => {
  // Mock Supabase
  // Render form
  // Fill in fields
  // Submit
  // Verify mutation was called
  // Verify success toast
});
```

### E2E Tests (Optional)

Use Playwright or Cypress for critical flows:

1. Add cupping notes to profile
2. Upload photo
3. Compare two profiles
4. Mobile: Swipe to delete profile from comparison

---

## Performance Considerations

### 1. Code Splitting

Split comparison page into separate chunk:

```typescript
// src/App.tsx
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'));
```

### 2. Image Optimization

- Compress before upload
- Use lazy loading: `<img loading="lazy" />`
- Consider generating thumbnails server-side (Supabase Storage transformations)

### 3. Chart Performance

- Use `recharts` with reasonable data point limits
- For very long roasts (>1000 data points), consider downsampling
- Memoize chart data transformations

### 4. Query Optimization

- Use proper indexes (already defined in migration)
- Limit query results (pagination)
- Cache with TanStack Query (already configured)

### 5. Mobile Optimization

- Bottom sheets instead of modals (lighter)
- Simplified mobile layouts (less DOM)
- Touch-friendly interactions (reduced JS events)

---

## Deployment Checklist

Before deploying to production:

- [ ] Run database migrations
- [ ] Create storage bucket and configure RLS
- [ ] Update environment variables (if any)
- [ ] Run type generation: `npx supabase gen types typescript`
- [ ] Build and test: `npm run build && npm run preview`
- [ ] Check bundle size: `npm run build -- --mode production`
- [ ] Run accessibility audit (Lighthouse)
- [ ] Test on mobile devices (iOS Safari, Chrome Android)
- [ ] Verify RLS policies are working correctly
- [ ] Update documentation

---

## Security Considerations

### Row-Level Security (RLS)

Ensure RLS policies are properly configured:

```sql
-- roast_profiles: Users can only update their own profiles
CREATE POLICY "Users can update their own profiles"
ON roast_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- roast_profiles: Anyone can view public profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON roast_profiles FOR SELECT
TO public
USING (true);
```

### Photo Upload Security

- Validate file types on client and server
- Enforce file size limits (5MB)
- Sanitize filenames
- Use user-specific folders (`{user_id}/...`)
- Set appropriate CORS policies

---

## API Reference

### Key Supabase Endpoints

```typescript
// Get profile with cupping notes
const { data } = await supabase
  .from('roast_profiles')
  .select('*, profiles(username)')
  .eq('id', profileId)
  .single();

// Update cupping notes
const { error } = await supabase
  .from('roast_profiles')
  .update({
    cupping_score: 85,
    cupping_date: '2026-02-15',
    flavor_tags: ['Berry', 'Chocolate'],
    flavor_notes: 'Delicious!',
  })
  .eq('id', profileId);

// Upload photo
const { data } = await supabase.storage
  .from('roasted-bean-photos')
  .upload(`${userId}/${timestamp}.jpg`, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('roasted-bean-photos')
  .getPublicUrl(filePath);
```

---

## Troubleshooting

### Common Issues

**Issue:** Photo upload fails with 413 error  
**Solution:** Check Supabase storage limits and file size

**Issue:** Flavor tags not saving  
**Solution:** Ensure PostgreSQL array syntax is correct: `['tag1', 'tag2']`

**Issue:** Chart not rendering on mobile  
**Solution:** Check `ResponsiveContainer` width/height, ensure parent has dimensions

**Issue:** RLS blocking updates  
**Solution:** Verify user is authenticated and policy matches user_id

---

## Additional Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [React Hook Form](https://react-hook-form.com/)

---

**End of Technical Specification**

Ready for engineering implementation! Each phase builds incrementally on the previous one.
