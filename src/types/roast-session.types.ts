/**
 * Contracts shared by the roast console (Setup → Roast → Review), the
 * post-roast card, local drafts and the "Roast again" reference.
 *
 * Conventions:
 * - Times are milliseconds since Charge (t = 0), excluding nothing (there is no pause).
 * - Temperatures are always stored in °C. Convert only for display/input.
 */

import type { RoastData } from './roast-data.types';
import type { RoasterType } from './roaster.types';

/** Moments a roaster marks during a roast. Charge is t = 0 and implicit. */
export type RoastEventType =
  | 'turning_point'
  | 'yellowing'
  | 'first_crack'
  | 'second_crack'
  | 'drop';

export interface RoastEvent {
  type: RoastEventType;
  /** ms since charge */
  t: number;
  /** °C, only when a reading under 30 s old exists */
  tempC?: number;
  /** Set when the time was corrected after the fact */
  editedFromT?: number;
}

/** One tap on a machine control (heat, fan, setpoint, program, extension…). */
export interface ControlChange {
  /** Control id from the roaster registry vocabulary, e.g. 'heat', 'fan', 'setpoint', 'program', 'extend' */
  control: string;
  value: number | string;
  /** ms since charge */
  t: number;
}

/** A temperature reading typed (or later, streamed) during the roast. */
export interface TempReading {
  t: number;
  /** Bean / probe temperature °C */
  beanC: number;
  /** Environment / setpoint °C when the mode has one */
  envC?: number;
}

export type RoastLevel = 'light' | 'city' | 'city_plus' | 'full_city' | 'full_city_plus' | 'dark';
export type ProcessMethod = 'washed' | 'natural' | 'honey' | 'anaerobic' | 'wet_hulled' | 'decaf' | 'other';
export type RoastPlace = 'indoors' | 'garage' | 'outdoors';

export const ROAST_LEVEL_LABELS: Record<RoastLevel, string> = {
  light: 'Light',
  city: 'City',
  city_plus: 'City+',
  full_city: 'Full City',
  full_city_plus: 'Full City+',
  dark: 'Dark',
};

export const PROCESS_LABELS: Record<ProcessMethod, string> = {
  washed: 'Washed',
  natural: 'Natural',
  honey: 'Honey',
  anaerobic: 'Anaerobic',
  wet_hulled: 'Wet-hulled',
  decaf: 'Decaf',
  other: 'Other',
};

export const PLACE_LABELS: Record<RoastPlace, string> = {
  indoors: 'Indoors',
  garage: 'Garage',
  outdoors: 'Outdoors',
};

/** What the console hands to the post-roast card when the roast is dropped. */
export interface RoastResult {
  /** Client UUID; becomes the roast_profiles.id on save (idempotent insert). */
  id: string;
  roasterType: RoasterType;
  /** Wall-clock ms at charge */
  chargedAt: number;
  durationSeconds: number;
  batchGrams: number;
  events: RoastEvent[];
  controlChanges: ControlChange[];
  readings: TempReading[];
  /** Settings at charge, keyed by control id (e.g. { heat: 7, fan: 9 }) */
  startingSettings: Record<string, number | string>;
  /** Mode-specific payload kept for the profile page (legacy-compatible) */
  modeData: RoastData;
  /** Id of the roast followed as a reference, if any */
  referenceId?: string;
}

/** Fields filled in on the post-roast card. Everything optional. */
export interface RoastDetails {
  beanName?: string;
  origin?: string;
  farm?: string;
  process?: ProcessMethod;
  roastLevel?: RoastLevel;
  weightOutGrams?: number;
  /** Defaults to batchGrams */
  weightInGrams?: number;
  place?: RoastPlace;
  ambientC?: number;
  notes?: string;
}

/** A roast stored on this device until it is saved to the account. */
export interface RoastDraft {
  result: RoastResult;
  details: RoastDetails;
  createdAt: number;
  updatedAt: number;
  /** Set once the roast exists in Supabase (same id as result.id) */
  syncedAt?: number;
}

/** A saved roast used as a guide while roasting ("Roast again"). */
export interface RoastReference {
  id: string;
  name: string;
  roastedAt?: string;
  roasterType?: RoasterType | string;
  /** Seconds since charge */
  yellowingS?: number;
  firstCrackS?: number;
  secondCrackS?: number;
  dropS: number;
  /** Control changes to show as upcoming cues, seconds since charge */
  cues: Array<{ s: number; label: string }>;
  startingSettings?: Record<string, number | string>;
  batchGrams?: number;
}
