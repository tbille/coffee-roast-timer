import type { RoasterType } from '@/types/roaster.types';

const ROASTER_PREFERENCE_KEY = 'preferred_roaster';

export const saveRoasterPreference = (roasterType: RoasterType) => {
  try {
    localStorage.setItem(ROASTER_PREFERENCE_KEY, roasterType);
  } catch (error) {
    console.error('Failed to save roaster preference:', error);
  }
};

export const getRoasterPreference = (): RoasterType | null => {
  try {
    return localStorage.getItem(ROASTER_PREFERENCE_KEY) as RoasterType | null;
  } catch (error) {
    console.error('Failed to get roaster preference:', error);
    return null;
  }
};

export const clearRoasterPreference = () => {
  try {
    localStorage.removeItem(ROASTER_PREFERENCE_KEY);
  } catch (error) {
    console.error('Failed to clear roaster preference:', error);
  }
};
