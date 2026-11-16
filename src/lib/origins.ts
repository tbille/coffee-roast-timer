/**
 * Coffee origins: producing countries, well-known growing regions and
 * normalisation of the free text people type ("Columbia", "Brasil",
 * "Ethiopian Yirgacheffe"…). Used for the origin combobox on the post-roast
 * card and for display on Discover / My roasts.
 */

/** Coffee-producing countries (display names). */
export const ORIGIN_COUNTRIES: readonly string[] = [
  'Angola',
  'Bolivia',
  'Brazil',
  'Burundi',
  'Cameroon',
  'Central African Republic',
  'China',
  'Colombia',
  'Congo',
  'Costa Rica',
  'Cuba',
  'Democratic Republic of the Congo',
  'Dominican Republic',
  'East Timor',
  'Ecuador',
  'El Salvador',
  'Ethiopia',
  'Gabon',
  'Ghana',
  'Guatemala',
  'Guinea',
  'Haiti',
  'Honduras',
  'India',
  'Indonesia',
  'Ivory Coast',
  'Jamaica',
  'Kenya',
  'Laos',
  'Liberia',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Mexico',
  'Myanmar',
  'Nepal',
  'Nicaragua',
  'Nigeria',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Puerto Rico',
  'Rwanda',
  'Sierra Leone',
  'Sri Lanka',
  'Taiwan',
  'Tanzania',
  'Thailand',
  'Togo',
  'Uganda',
  'United States',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe',
];

/** Well-known growing regions, kept as typed and attributed to their country. */
export const ORIGIN_REGIONS: Readonly<Record<string, string>> = {
  Sumatra: 'Indonesia',
  Java: 'Indonesia',
  Sulawesi: 'Indonesia',
  Bali: 'Indonesia',
  Flores: 'Indonesia',
  Aceh: 'Indonesia',
  Toraja: 'Indonesia',
  Yirgacheffe: 'Ethiopia',
  Sidamo: 'Ethiopia',
  Sidama: 'Ethiopia',
  Guji: 'Ethiopia',
  Harrar: 'Ethiopia',
  Limu: 'Ethiopia',
  Jimma: 'Ethiopia',
  Huila: 'Colombia',
  Nariño: 'Colombia',
  Cauca: 'Colombia',
  Tolima: 'Colombia',
  Antigua: 'Guatemala',
  Huehuetenango: 'Guatemala',
  Atitlán: 'Guatemala',
  Tarrazú: 'Costa Rica',
  'West Valley': 'Costa Rica',
  Boquete: 'Panama',
  Kona: 'United States',
  Hawaii: 'United States',
  'Blue Mountain': 'Jamaica',
  'Minas Gerais': 'Brazil',
  'Cerrado Mineiro': 'Brazil',
  'Sul de Minas': 'Brazil',
  Mogiana: 'Brazil',
  Nyeri: 'Kenya',
  Kirinyaga: 'Kenya',
  Kiambu: 'Kenya',
  Kilimanjaro: 'Tanzania',
  Mattari: 'Yemen',
  Chiapas: 'Mexico',
  Oaxaca: 'Mexico',
  Veracruz: 'Mexico',
  Cajamarca: 'Peru',
  Yunnan: 'China',
  'Mysore': 'India',
  Chikmagalur: 'India',
  Monsooned: 'India',
};

/** Countries + regions, for the origin combobox / datalist. */
export const ORIGIN_SUGGESTIONS: readonly string[] = [
  ...ORIGIN_COUNTRIES,
  ...Object.keys(ORIGIN_REGIONS),
].sort((a, b) => a.localeCompare(b));

/** Lower-case alias → display name. Keys are compared after `foldKey`. */
const ALIASES: Record<string, string> = {
  // Colombia
  columbia: 'Colombia',
  colombian: 'Colombia',
  columbian: 'Colombia',
  combia: 'Colombia',
  colombie: 'Colombia',
  kolumbien: 'Colombia',
  colmbia: 'Colombia',
  colombai: 'Colombia',
  // Brazil
  brasil: 'Brazil',
  brazilian: 'Brazil',
  brasilian: 'Brazil',
  bresil: 'Brazil',
  brazill: 'Brazil',
  // Ethiopia
  ethiopian: 'Ethiopia',
  ethopia: 'Ethiopia',
  ethiopa: 'Ethiopia',
  etiopia: 'Ethiopia',
  ethiopie: 'Ethiopia',
  athiopien: 'Ethiopia',
  // Guatemala
  guatamala: 'Guatemala',
  guatemalan: 'Guatemala',
  guatemela: 'Guatemala',
  guatemalla: 'Guatemala',
  // Kenya
  kenyan: 'Kenya',
  kenia: 'Kenya',
  // Others
  costarica: 'Costa Rica',
  'costa rican': 'Costa Rica',
  'el salvadore': 'El Salvador',
  salvador: 'El Salvador',
  salvadoran: 'El Salvador',
  hondouras: 'Honduras',
  honduran: 'Honduras',
  nicaraguan: 'Nicaragua',
  panamanian: 'Panama',
  mexican: 'Mexico',
  mejico: 'Mexico',
  peruvian: 'Peru',
  bolivian: 'Bolivia',
  ecuadorian: 'Ecuador',
  rwandan: 'Rwanda',
  ruanda: 'Rwanda',
  burundian: 'Burundi',
  ugandan: 'Uganda',
  tanzanian: 'Tanzania',
  yemeni: 'Yemen',
  yemen: 'Yemen',
  indonesian: 'Indonesia',
  sumatran: 'Sumatra',
  sumatera: 'Sumatra',
  javanese: 'Java',
  indian: 'India',
  vietnamese: 'Vietnam',
  'viet nam': 'Vietnam',
  png: 'Papua New Guinea',
  'papua new guinean': 'Papua New Guinea',
  'papua': 'Papua New Guinea',
  jamaican: 'Jamaica',
  hawaiian: 'Hawaii',
  'hawai i': 'Hawaii',
  usa: 'United States',
  'united states of america': 'United States',
  'cote d ivoire': 'Ivory Coast',
  drc: 'Democratic Republic of the Congo',
  'dr congo': 'Democratic Republic of the Congo',
  'congo drc': 'Democratic Republic of the Congo',
  'timor leste': 'East Timor',
  timor: 'East Timor',
  chinese: 'China',
  thai: 'Thailand',
  burma: 'Myanmar',
  malawian: 'Malawi',
  zambian: 'Zambia',
  'yirgachefe': 'Yirgacheffe',
  'yirgacheffee': 'Yirgacheffe',
  'yirga cheffe': 'Yirgacheffe',
  'yirgachaffe': 'Yirgacheffe',
  'harar': 'Harrar',
  'tarrazu': 'Tarrazú',
  'narino': 'Nariño',
  'atitlan': 'Atitlán',
};

/** Lower-case, strip accents and punctuation, collapse spaces. */
function foldKey(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const CANONICAL = new Map<string, string>();
for (const name of [...ORIGIN_COUNTRIES, ...Object.keys(ORIGIN_REGIONS)]) {
  CANONICAL.set(foldKey(name), name);
}
for (const [alias, name] of Object.entries(ALIASES)) {
  CANONICAL.set(foldKey(alias), name);
}

/** Small words kept lower-case when we title-case unknown text. */
const MINOR_WORDS = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'and', 'of', 'da', 'do', 'dos']);

function capitaliseSensibly(s: string): string {
  // Mixed case typed on purpose ("Finca La Esperanza", "SL28") — keep it.
  const hasLower = /\p{Ll}/u.test(s);
  const hasUpper = /\p{Lu}/u.test(s);
  if (hasLower && hasUpper && !/^\p{Lu}{2,}\p{Ll}/u.test(s)) return s;
  return s
    .split(/(\s+|-|\/)/)
    .map((part, i) => {
      if (!/\p{L}/u.test(part)) return part;
      // Short codes like "AA", "SL28", "PNG" stay as typed.
      if (/^(?=.*\d)[\p{Lu}\d]{2,5}$/u.test(part) || /^\p{Lu}{2}$/u.test(part)) return part;
      const lower = part.toLowerCase();
      if (i > 0 && MINOR_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

/**
 * Normalise an origin for display. Known countries, regions and aliases map to
 * their canonical name (Columbia/Combia/COlumbian → Colombia, Brasil → Brazil).
 * When the first word(s) are a known origin followed by more text
 * ("ethiopian yirgacheffe"), the known part is normalised and the rest kept.
 * Unknown text is returned trimmed and sensibly capitalised. Empty → ''.
 */
export function normaliseOrigin(raw: string | null | undefined): string {
  if (raw == null) return '';
  const trimmed = String(raw).trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';

  const key = foldKey(trimmed);
  const exact = CANONICAL.get(key);
  if (exact) return exact;

  // "Ethiopian Yirgacheffe", "Colombia, Huila", "Brasil - Cerrado"
  const parts = trimmed.split(/\s*[,/–—-]\s*|\s+/).filter(Boolean);
  if (parts.length > 1) {
    for (let n = Math.min(4, parts.length - 1); n >= 1; n--) {
      const head = CANONICAL.get(foldKey(parts.slice(0, n).join(' ')));
      if (head) {
        const restRaw = trimmed
          .slice(trimmed.toLowerCase().indexOf(parts[n].toLowerCase()))
          .trim();
        const rest = CANONICAL.get(foldKey(restRaw)) ?? capitaliseSensibly(restRaw);
        return `${head} ${rest}`.trim();
      }
    }
  }

  return capitaliseSensibly(trimmed);
}

