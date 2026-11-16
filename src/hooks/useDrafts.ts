import { useEffect, useState } from 'react';
import { DRAFTS_CHANGED_EVENT, DRAFTS_STORAGE_KEY, listDrafts } from '@/lib/drafts';
import type { RoastDraft } from '@/types/roast-session.types';

/** Live list of drafts on this device (newest first), synced across tabs. */
export function useDrafts(): RoastDraft[] {
  const [drafts, setDrafts] = useState<RoastDraft[]>(() => listDrafts());

  useEffect(() => {
    const refresh = () => setDrafts(listDrafts());
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === DRAFTS_STORAGE_KEY) refresh();
    };
    window.addEventListener(DRAFTS_CHANGED_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    refresh();
    return () => {
      window.removeEventListener(DRAFTS_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return drafts;
}
