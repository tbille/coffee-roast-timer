import { useState, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { FLAVOR_TAGS, MAX_FLAVOR_TAGS } from '@/types/cupping.types';

interface FlavorTagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export function FlavorTagSelector({ selected, onChange }: FlavorTagSelectorProps) {
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
      if (selected.length < MAX_FLAVOR_TAGS) {
        onChange([...selected, tag]);
      }
    }
  };

  const removeTag = (tag: string) => {
    onChange(selected.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-3">
      <Label>Flavour tags</Label>
      
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="gap-1 border bg-background font-normal text-foreground hover:bg-muted"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Remove ${tag} tag`}
              >
                <X className="h-3 w-3" strokeWidth={1.75} />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add tags button/popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            type="button"
            variant="outline" 
            className="w-full justify-start"
            disabled={selected.length >= MAX_FLAVOR_TAGS}
          >
            {selected.length >= MAX_FLAVOR_TAGS 
              ? `Maximum ${MAX_FLAVOR_TAGS} tags selected`
              : 'Add flavour tags'
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command className="overflow-hidden">
            <CommandInput
              placeholder="Search flavours"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className="max-h-64">
              <CommandEmpty>No flavours found.</CommandEmpty>
              <CommandGroup>
                {filtered.map((tag) => {
                  const isSelected = selected.includes(tag);
                  return (
                    <CommandItem
                      key={tag}
                      onSelect={() => toggleTag(tag)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div 
                        className={`h-4 w-4 border rounded flex items-center justify-center ${
                          isSelected ? 'bg-primary border-primary' : 'border-input'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={1.75} />}
                      </div>
                      {tag}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Helper text */}
      {selected.length >= MAX_FLAVOR_TAGS && (
        <p className="text-xs text-muted-foreground">
          Maximum {MAX_FLAVOR_TAGS} tags selected
        </p>
      )}
    </div>
  );
}
