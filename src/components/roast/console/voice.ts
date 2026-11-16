/** Parsing of spoken phrases for the KALDI voice input. */

export type VoiceCommand = 'yellowing' | 'first_crack' | 'second_crack';

const ONES: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
};
const TENS: Record<string, number> = {
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};

/** "192", "one hundred ninety two", "one ninety two" -> 192. Null outside 1–500. */
export function parseSpokenNumber(text: string): number | null {
  const normalized = text.toLowerCase().trim();
  const direct = normalized.match(/\b(\d{1,3})\b/);
  if (direct) {
    const n = Number(direct[1]);
    return n > 0 && n <= 500 ? n : null;
  }
  const words = normalized.split(/[\s-]+/);
  let total = 0;
  let current = 0;
  let sawNumber = false;
  for (const word of words) {
    if (word === 'hundred') {
      current = (current || 1) * 100;
      sawNumber = true;
    } else if (ONES[word] !== undefined) {
      current += ONES[word];
      sawNumber = true;
    } else if (TENS[word] !== undefined) {
      current = current > 0 && current < 10 ? current * 100 + TENS[word] : current + TENS[word];
      sawNumber = true;
    }
  }
  total += current;
  return sawNumber && total > 0 && total <= 500 ? total : null;
}

export function detectCommand(text: string): VoiceCommand | null {
  const t = text.toLowerCase();
  if (/\b(first|1st) crack\b/.test(t)) return 'first_crack';
  if (/\b(second|2nd) crack\b/.test(t)) return 'second_crack';
  if (/\byellow(ing)?\b/.test(t)) return 'yellowing';
  return null;
}
