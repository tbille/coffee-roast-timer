/**
 * Community-entered labels arrive as "COLOMBIA", "washed" or "Kenya Nyeri".
 * Title-case only text typed entirely in one case, so deliberate casing
 * (e.g. "Honduras SHG", "Kenya AB") is left alone.
 */
export function tidyLabel(value?: string | null): string {
  const text = (value ?? "").trim().replace(/\s+/g, " ");
  if (!text) return "";
  const isAllUpper = text === text.toUpperCase();
  const isAllLower = text === text.toLowerCase();
  if (!isAllUpper && !isAllLower) return text;
  return text.toLowerCase().replace(/(^|[\s\-/(])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}
