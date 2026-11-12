// Urdu Transliteration & Word Suggestion Engine for Sarafa / Jewellery System

// 1. Common Jewellery & Sarafa Terms Dictionary (Roman / English -> Urdu)
export const JEWELLERY_DICTIONARY = {
  // Rings
  angothi: 'انگوٹھی',
  angoothi: 'انگوٹھی',
  anguthi: 'انگوٹھی',
  ring: 'انگوٹھی',
  rings: 'انگوٹھیاں',
  chhalla: 'چھلا',
  challa: 'چھلا',
  nagina: 'نگینہ',
  nag: 'نگ',
  stone: 'نگینہ',

  // Necklaces & Sets
  har: 'ہار',
  haar: 'ہار',
  necklace: 'ہار',
  kanthi: 'کنٹھی',
  kanthihaar: 'کنٹھی ہار',
  mala: 'مالا',
  guluband: 'گلو بند',
  guloband: 'گلو بند',
  set: 'سیٹ',
  haarset: 'ہار سیٹ',
  harset: 'ہار سیٹ',
  bridalset: 'برائیڈل سیٹ',
  bridal: 'برائیڈل',
  chain: 'چین',
  chen: 'چین',
  locket: 'لاکٹ',
  taweez: 'تعویذ',
  pendant: 'پینڈنٹ',
  pendent: 'پینڈنٹ',

  // Earrings
  bali: 'بالیاں',
  baliyan: 'بالیاں',
  balian: 'بالیاں',
  earring: 'بالیاں',
  earrings: 'بالیاں',
  jhumka: 'جھمکا',
  jhumkay: 'جھمکے',
  jhumke: 'جھمکے',
  tops: 'ٹاپس',
  top: 'ٹاپس',
  bunda: 'بندے',
  bundy: 'بندے',
  kante: 'کانٹے',

  // Bangles & Bracelets
  churi: 'چوڑیاں',
  churiya: 'چوڑیاں',
  churiyan: 'چوڑیاں',
  choori: 'چوڑیاں',
  chooriyan: 'چوڑیاں',
  bangle: 'چوڑیاں',
  bangles: 'چوڑیاں',
  kara: 'کڑا',
  karra: 'کڑا',
  kangan: 'کنگن',
  bracelet: 'بریسلٹ',
  dasti: 'دستی',
  bazooband: 'بازوبند',

  // Head & Face Jewellery
  tika: 'ٹیکہ',
  teeka: 'ٹیکہ',
  bindya: 'بندیا',
  bindiya: 'بندیا',
  mathapatti: 'ماتھا پٹی',
  jhumar: 'جھومر',
  nath: 'نتھ',
  koka: 'کوکا',
  nosepin: 'کوکا',
  pin: 'کوکا',

  // Feet & Ankles
  payal: 'پائل',
  pazeb: 'پازیب',
  pajeb: 'پازیب',

  // Metals & Material
  sona: 'سونا',
  gold: 'سونا',
  chandi: 'چاندی',
  silver: 'چاندی',
  karat: 'کیریٹ',
  tola: 'تولہ',
  masha: 'ماشہ',
  rati: 'رتی',
  gram: 'گرام',
  palash: 'پالش',
  kaat: 'کاٹ'
};

// 2. Common Pakistani Customer Names & Titles (Roman / English -> Urdu)
export const NAMES_DICTIONARY = {
  // Common Given Names
  muhammad: 'محمد',
  mohammad: 'محمد',
  mohammed: 'محمد',
  m: 'محمد',
  md: 'محمد',
  ali: 'علی',
  ahmed: 'احمد',
  ahmad: 'احمد',
  iqbal: 'اقبال',
  hassan: 'حسن',
  hasan: 'حسن',
  hussain: 'حسین',
  husain: 'حسین',
  khan: 'خان',
  malik: 'ملک',
  usman: 'عثمان',
  osman: 'عثمان',
  umar: 'عمر',
  omer: 'عمر',
  bilal: 'بلال',
  tariq: 'طارق',
  asif: 'آصف',
  imran: 'عمران',
  sajid: 'ساجد',
  rashid: 'راشد',
  shahid: 'شاہد',
  akram: 'اکرم',
  nawaz: 'نواز',
  zafar: 'ظفر',
  rizwan: 'رضوان',
  kamran: 'کامران',
  kashif: 'کاشف',
  salman: 'سلمان',
  hamza: 'حمزہ',
  waseem: 'وسیم',
  nasir: 'ناصر',
  farooq: 'فاروق',
  irfan: 'عرفان',
  tahir: 'طاہر',
  abid: 'عابد',
  zahid: 'زاہد',
  saleem: 'سلیم',
  nadeem: 'ندیم',
  waqar: 'وقار',
  asghar: 'اصغر',
  akbar: 'اکبر',
  shabbir: 'شبیر',
  munir: 'منیر',
  bashir: 'بشیر',
  arshad: 'ارشد',
  ashraf: 'اشرف',
  anwar: 'انور',
  tanveer: 'تنویر',
  khalid: 'خالد',
  amjad: 'امجد',
  javed: 'جاوید',
  qasim: 'قاسم',
  raza: 'رضا',
  sultan: 'سلطان',
  shafiq: 'شفیق',
  rehman: 'رحمان',
  rahman: 'رحمان',
  gul: 'گل',
  mohsin: 'محسن',
  abbas: 'عباس',
  adnan: 'عدنان',
  waheed: 'وحید',
  zubair: 'زبیر',
  saeed: 'سعید',
  majid: 'ماجد',
  haroon: 'ہارون',
  noman: 'نعمان',
  faisal: 'فیصل',
  babar: 'بابر',
  zeeshan: 'ذیشان',

  // Castes / Surnames
  rajput: 'راجپوت',
  bhatti: 'بھٹی',
  butt: 'بٹ',
  chaudhary: 'چوہدری',
  choudhary: 'چوہدری',
  ch: 'چوہدری',
  rana: 'رانا',
  sheikh: 'شیخ',
  sh: 'شیخ',
  syed: 'سید',
  jutt: 'جٹ',
  jat: 'جٹ',
  gujjar: 'گجر',
  gujjer: 'گجر',
  mughal: 'مغل',
  ansari: 'انصاری',
  qureshi: 'قریشی',
  zargar: 'زرگر',
  sonar: 'سنار',

  // Female Names
  fatima: 'فاطمہ',
  ayesha: 'عائشہ',
  aisha: 'عائشہ',
  zainab: 'زینب',
  maryam: 'مریم',
  mariam: 'مریم',
  shahnaz: 'شاہناز',
  parveen: 'پروین',
  nasreen: 'نسرین',
  samina: 'ثمینہ',
  bushra: 'بشریٰ',
  sadia: 'سعدیہ',
  rubina: 'روبینہ',
  saima: 'صائمہ',
  tahira: 'طاہرہ',
  uzma: 'عظمیٰ',
  farzana: 'فرزانہ',
  hina: 'حنا',
  sana: 'ثناء',
  kiran: 'کرن',
  nida: 'ندا',
  rabia: 'رابعہ',
  khadija: 'خدیجہ',
  sobia: 'ثوبیہ',
  amina: 'آمنہ',
  amna: 'آمنہ',
  asma: 'اسماء',
  yasmin: 'یاسمین',
  begum: 'بیگم',
  bibi: 'بی بی',
  baji: 'باجی'
};

// 3. Phonetic Digraphs & Letter Mapping (Fallback for arbitrary words)
const DIGRAPHS = [
  { en: 'sh', ur: 'ش' },
  { en: 'ch', ur: 'چ' },
  { en: 'kh', ur: 'خ' },
  { en: 'gh', ur: 'غ' },
  { en: 'th', ur: 'تھ' },
  { en: 'ph', ur: 'پھ' },
  { en: 'jh', ur: 'جھ' },
  { en: 'bh', ur: 'بھ' },
  { en: 'dh', ur: 'دھ' },
  { en: 'rh', ur: 'ڑھ' },
  { en: 'ee', ur: 'ی' },
  { en: 'oo', ur: 'و' },
  { en: 'aa', ur: 'ا' }
];

const SINGLE_LETTERS = {
  a: 'ا',
  b: 'ب',
  p: 'پ',
  t: 'ت',
  T: 'ٹ',
  s: 'س',
  j: 'ج',
  c: 'ک',
  h: 'ہ',
  d: 'د',
  D: 'ڈ',
  r: 'ر',
  R: 'ڑ',
  z: 'ز',
  x: 'کس',
  f: 'ف',
  q: 'ق',
  k: 'ک',
  g: 'گ',
  l: 'ل',
  m: 'م',
  n: 'ن',
  N: 'ں',
  w: 'و',
  v: 'و',
  y: 'ی',
  i: 'ی',
  o: 'و',
  u: 'و',
  e: 'ے'
};

/**
 * Phonetically transliterates a single English/Roman token into Urdu.
 */
export function phoneticTransliterateWord(word) {
  if (!word) return '';
  const lower = word.toLowerCase().trim();

  // 1. Check Sarafa Jewellery Dictionary
  if (JEWELLERY_DICTIONARY[lower]) {
    return JEWELLERY_DICTIONARY[lower];
  }

  // 2. Check Names Dictionary
  if (NAMES_DICTIONARY[lower]) {
    return NAMES_DICTIONARY[lower];
  }

  // 3. Fallback character-by-character phonetic parsing
  let res = '';
  let i = 0;
  let isStart = true;

  while (i < word.length) {
    const twoChars = word.substring(i, i + 2).toLowerCase();
    const matchDigraph = DIGRAPHS.find(d => d.en === twoChars);

    if (matchDigraph) {
      if (twoChars === 'aa' && isStart) {
        res += 'آ';
      } else {
        res += matchDigraph.ur;
      }
      i += 2;
    } else {
      const char = word[i];
      const charLower = char.toLowerCase();

      if (charLower === 'a' && isStart) {
        res += 'آ';
      } else if (SINGLE_LETTERS[char] || SINGLE_LETTERS[charLower]) {
        res += SINGLE_LETTERS[char] || SINGLE_LETTERS[charLower];
      } else {
        res += char;
      }
      i += 1;
    }
    isStart = false;
  }

  return res;
}

/**
 * Transliterates a whole text sentence (handles plus '+' signs, spaces, etc.)
 */
export function transliterateSentence(text, type = 'any') {
  if (!text) return '';

  // Preserve delimiters like ' + ' or ' ، '
  const tokens = text.split(/(\s+|\+|,|،)/);

  return tokens.map(token => {
    // If it's whitespace or punctuation, leave as is
    if (/^[\s+,،-]+$/.test(token) || !token) {
      return token;
    }

    const clean = token.trim().toLowerCase();

    // Check specific dictionary based on context
    if (type === 'jewellery' && JEWELLERY_DICTIONARY[clean]) {
      return JEWELLERY_DICTIONARY[clean];
    }
    if (type === 'name' && NAMES_DICTIONARY[clean]) {
      return NAMES_DICTIONARY[clean];
    }

    // Otherwise check all
    if (JEWELLERY_DICTIONARY[clean]) return JEWELLERY_DICTIONARY[clean];
    if (NAMES_DICTIONARY[clean]) return NAMES_DICTIONARY[clean];

    // Fallback phonetic
    return phoneticTransliterateWord(token);
  }).join('');
}

/**
 * Returns top word suggestions for autocomplete dropdown.
 */
export function getSuggestions(query, type = 'jewellery', max = 6) {
  if (!query || query.trim().length === 0) {
    if (type === 'jewellery') {
      return [
        { urdu: 'انگوٹھی', roman: 'angothi' },
        { urdu: 'کنٹھی', roman: 'kanthi' },
        { urdu: 'ہار', roman: 'haar' },
        { urdu: 'بالیاں', roman: 'baliyan' },
        { urdu: 'چوڑیاں', roman: 'churiyan' },
        { urdu: 'ٹیکہ', roman: 'tika' }
      ];
    }
    return [];
  }

  const q = query.trim().toLowerCase();
  const results = [];

  const sourceDict = type === 'jewellery'
    ? { ...JEWELLERY_DICTIONARY, ...NAMES_DICTIONARY }
    : { ...NAMES_DICTIONARY, ...JEWELLERY_DICTIONARY };

  // Match Roman keys or Urdu values
  for (const [roman, urdu] of Object.entries(sourceDict)) {
    if (roman.startsWith(q) || roman.includes(q) || urdu.includes(q)) {
      if (!results.some(r => r.urdu === urdu)) {
        results.push({ urdu, roman });
      }
    }
    if (results.length >= max) break;
  }

  // Also offer phonetic conversion of the current typed word
  const phonetic = phoneticTransliterateWord(query);
  if (phonetic && !results.some(r => r.urdu === phonetic)) {
    results.unshift({ urdu: phonetic, roman: query, isPhonetic: true });
  }

  return results.slice(0, max);
}

