// nlp.js — improved FAQ matcher (English + Hindi/Hinglish friendly)
// Lightweight, dependency-free, returns answer + score + tags (if present)

const fs = require("fs");
const path = require("path");

const FAQ_FILE = path.join(__dirname, "health_faq.json");

// --- Load FAQ (and allow reload) ---
let FAQ = [];
function loadFAQ() {
  try {
    const raw = fs.readFileSync(FAQ_FILE, "utf8");
    const parsed = JSON.parse(raw);
    FAQ = Array.isArray(parsed) ? parsed : [];
    console.log(`[nlp] Loaded ${FAQ.length} FAQ entries.`);
  } catch (e) {
    console.warn("[nlp] Could not load FAQ file:", e && e.message ? e.message : e);
    FAQ = [];
  }
}
loadFAQ();

// --- Small synonyms map — extend as needed (include Hinglish/Hindi tokens too) ---
const SYNONYMS = {
  headache: [
    "headache", "head pain", "head ache", "migraine",
    "sir dard", "sar dard", "sir me dard", "sar me dard",
    "head hurts", "head hurting", "sir phat raha"
  ],
  fever: [
    "fever", "temperature", "feverish", "high temp",
    "bukhar", "bukhaar", "bukhar aa raha", "tapman"
  ],
  cough: [
    "cough", "khansi", "dry cough", "wet cough",
    "coughing", "khansi ho rahi", "gala kharab",
    "throat congestion", "phlegm", "balgam"
  ],
  cold: [
    "cold", "sardi", "runny nose", "bahati naak",
    "stuffy nose", "blocked nose", "jam rahi naak",
    "nasal congestion"
  ],
  stomach: [
    "stomach", "abdomen", "belly", "tummy",
    "stomachache", "stomach ache", "pet dard",
    "pet me dard", "abdomen pain", "gastric pain"
  ],
  acidity: [
    "acidity", "acid reflux", "heartburn",
    "gas", "gas problem", "gas ho rahi",
    "pet me jalan", "gastric"
  ],
  vomiting: [
    "vomit", "vomiting", "throwing up", "emesis",
    "ulti", "nausea", "nauseous", "man ghabra raha",
    "ulti jaisi feeling"
  ],
  rash: [
    "rash", "rashes", "red spots", "red spot",
    "lal daane", "itchy skin", "itching", "khujli",
    "fungal infection", "eczema", "allergic rash"
  ],
  breathlessness: [
    "breathless", "shortness of breath", "saans",
    "saans phoolna", "saans lene me dikkat",
    "heavy breathing", "difficulty breathing"
  ],
  chest: [
    "chest pain", "chest", "seene me dard", "seene me jalan",
    "tight chest", "pressure chest", "chest discomfort"
  ],
  diarrhoea: [
    "diarrhea", "diarrhoea", "loose motion",
    "dast", "frequent toilet", "patla paikhana"
  ],
  constipation: [
    "constipation", "constipated", "kabj",
    "pet bandh", "hard stool", "difficult toilet"
  ],
  allergy: [
    "allergy", "allergic", "allergic reaction",
    "sensitivity", "allergy ka", "itchy eyes",
    "sneezing", "nose itching"
  ],
  teeth: [
    "tooth", "teeth", "daant", "dant",
    "toothache", "teeth pain", "tooth pain",
    "gum pain", "gum swelling", "bleeding gums",
    "sensitive teeth", "tooth sensitivity",
    "wisdom tooth", "jaw pain", "dental infection"
  ],
  backpain: [
    "back pain", "lower back pain", "kamar dard",
    "kamar me dard", "spine pain", "lumber pain"
  ],
  neckpain: [
    "neck pain", "gardan dard", "stiff neck",
    "neck stiffness", "gardan me kasawat"
  ],
  eyes: [
    "eye pain", "aankh dard", "itchy eyes",
    "aankh me jalan", "dry eyes", "watering eyes",
    "blurry vision", "dhoondla dikh raha"
  ],
  ears: [
    "ear pain", "earache", "kan me dard",
    "ear itching", "kan me khujli",
    "blocked ear", "ear ringing", "tinnitus"
  ],
  throat: [
    "throat pain", "gala dard", "sore throat",
    "gala kharab", "gala baitha", "throat irritation"
  ],
  urine: [
    "urine burning", "peshab me jalan",
    "frequent urination", "bar bar peshab",
    "urinary infection", "UTI"
  ],
  periods: [
    "period pain", "cramps", "mens cramps",
    "periods me dard", "mens issues", "PMS",
    "heavy bleeding", "spotting"
  ],
  anxiety: [
    "anxiety", "stress", "tension", "ghabrahat",
    "panic", "nervous", "uneasy", "fearful"
  ],
  greeting: [
  "hi", "hello", "hey", "hii", "hiii", "yo", "sup",
  "whats up", "what's up", "good morning", "good night",
  "good evening", "good afternoon",
  "namaste", "namaskar", "pranam",
  "ram ram", "salam", "salaam", "assalamualaikum"
]
,
wellbeing: [
  "how are you", "how r u", "how are u",
  "kaise ho", "aap kaise ho", "tum kaise ho",
  "tu kaise hai", "kya haal hai", "kya scene",
  "kaisa chal raha", "kaisa ho"
]
,botidentity: [
  "what is your name", "your name", "name please",
  "tumhara naam kya hai", "tera naam kya hai",
  "naam kya hai", "aapka naam kya",
  "who are you", "who r u", "tum kaun ho",
  "aap kaun ho", "introduce yourself",
  "tell about yourself"
]
,thanks: [
  "thank you", "thanks", "thankyou",
  "shukriya", "bohot shukriya",
  "good job", "nice", "great", "awesome"
]
,confirmation: [
  "ok", "okay", "haan", "ha", "hmm",
  "theek hai", "thik hai", "achha", "acha",
  "fine", "sure", "done"
]
,goodbye: [
  "bye", "goodbye", "good bye",
  "see you", "see you later",
  "phir milte", "chal bye"
]
,help: [
  "help me", "i need help", "please help",
  "madad chahiye", "meri madad karo",
  "can you help"
]
,cora: [
  "what is cora", "cora health", "cora kya hai",
  "cora details", "about cora", "cora info",
  "cora explain", "cora health platform"
]
,medibot: [
  "what is medibot", "medibot kya hai",
  "what can you do", "what do you do",
  "tum kya kar sakte ho", "your purpose",
  "bot functions"
]
,docmap: [
  "how to find a doctor", "doctor search", "doc map",
  "docmap", "doctor kaise dhundhu", "find doctor",
  "specialist near me", "doctor near me"
]
,member: [
  "add member", "member kaise add kare",
  "how to add member", "edit member",
  "member details", "family member add"
]
,reminder: [
  "medicine reminder", "reminder kaise lagaye",
  "how to set reminders", "pill reminder",
  "medication time", "medicine timing"
]
,chitchat: [
  "tell me something", "talk to me",
  "bored", "mood off",
  "joke", "funny", "make me laugh",
  "sing a song", "story", "kuch bolo"
]

  // add more mapped groups over time
};

// ---- Normalization / tokenization ----

// detect if string contains Devanagari (Hindi) chars
function hasDevanagari(s = "") {
  return /[\u0900-\u097F]/.test(s);
}

// normalize general string (keep Devanagari words intact; remove punctuation from Latin words)
function normalize(s = "") {
  if (!s) return "";
  // replace smart quotes
  let t = String(s).replace(/[\u2018\u2019\u201C\u201D]/g, "'");

  // replace punctuation with spaces (but keep Devanagari letters and arabic-indic digits)
  t = t.replace(/[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00BF\u2000-\u206F]/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  return t.toLowerCase();
}

function normalizeToken(tok = "") {
  return normalize(String(tok || "")).split(" ").join(" ").trim();
}

function tokenize(s = "") {
  const t = normalize(s);
  if (!t) return [];
  // split on whitespace
  const arr = t.split(/\s+/).filter(Boolean);
  // dedupe
  return Array.from(new Set(arr));
}

// Build a reverse map for quick lookup of token -> canonical (after normalizeToken defined)
const TOKEN_TO_CANONICAL = {};
for (const [canon, arr] of Object.entries(SYNONYMS)) {
  for (const s of arr) {
    TOKEN_TO_CANONICAL[normalizeToken(s)] = canon;
  }
}

// expand tokens with canonical synonyms (so 'migraine' -> 'headache')
function expandTokensWithSynonyms(tokens) {
  const out = new Set(tokens);
  for (const tok of tokens) {
    const key = normalizeToken(tok);
    if (TOKEN_TO_CANONICAL[key]) {
      out.add(TOKEN_TO_CANONICAL[key]);
    }
    // also if token itself is a canonical name, keep it
    if (SYNONYMS[tok]) out.add(tok);
  }
  return Array.from(out);
}

// jaccard similarity between arrays of tokens
function jaccard(aTokens, bTokens) {
  if (!aTokens.length || !bTokens.length) return 0;
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  const inter = [...a].filter(x => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : inter / union;
}

// token overlap: proportion of query tokens that appear in candidate
function tokenOverlapScore(qTokens, fTokens) {
  if (!qTokens.length) return 0;
  const qSet = new Set(qTokens);
  const fSet = new Set(fTokens);
  const matched = [...qSet].filter(x => fSet.has(x)).length;
  return qSet.size === 0 ? 0 : matched / qSet.size;
}

// build indexed FAQ (tokens + tags)
let indexedFAQ = [];
function buildIndex() {
  indexedFAQ = FAQ.map(entry => {
    const q = (entry.question || entry.q || "").toString();
    const a = (entry.answer || entry.a || entry.response || "").toString();
    const tags = Array.isArray(entry.tags) ? entry.tags.map(t => String(t)) : (entry.tags ? [String(entry.tags)] : []);
    const tokens = expandTokensWithSynonyms(tokenize(q + " " + (entry.keywords || "").toString()));
    return { raw: entry, q, a, tokens, tags };
  });
}
buildIndex();

// allow runtime reload
function reloadFAQ() {
  loadFAQ();
  buildIndex();
  return { ok: true, count: indexedFAQ.length };
}

// --- Self-harm / suicide detection (HIGH PRIORITY) ---
// Note: this list is intentionally short but can be expanded.
// If a user message matches these phrases the bot returns an emergency-safe response.
const SELF_HARM_KEYWORDS = [
  "suicide", "kill myself", "want to die", "marna hai",
  "marna", "not want to live", "end my life", "i want to die",
  "take my life", "suicidal"
];

// main matching function
// returns { answer, score, matchedQuestion, tags } or null
function getBestAnswer(query) {
  const q = String(query || "").trim();
  if (!q) return { answer: "Please type your question.", score: 0, matchedQuestion: null, tags: [] };

  // HIGH PRIORITY: detect self-harm phrases and return a safe, non-medical emergency response immediately
  const lowQ = q.toLowerCase();
  for (const ph of SELF_HARM_KEYWORDS) {
    if (lowQ.includes(ph)) {
      return {
        answer:
          "I'm really sorry that you're feeling this way. I can't help with this, but you deserve support right now.\n\n" +
          "If you are in India, you can call the 24/7 suicide prevention helpline: 9152987821 (AASRA) or Aasra Helpline: +91 9820466726.\n" +
          "If you are elsewhere, please contact your local emergency services or a crisis hotline immediately. Please reach out to someone you trust.",
        score: 1,
        matchedQuestion: "self-harm emergency",
        tags: []
      };
    }
  }

  const qTokens = expandTokensWithSynonyms(tokenize(q));

  // Score each FAQ entry
  let best = { idx: -1, score: 0, overlap: 0, phraseBoost: false };
  for (let i = 0; i < indexedFAQ.length; i++) {
    const f = indexedFAQ[i];

    // compute jaccard and overlap
    const jac = jaccard(qTokens, f.tokens);
    const overlap = tokenOverlapScore(qTokens, f.tokens);

    // base score: weighted mix
    let score = (jac * 0.6) + (overlap * 0.4);

    // phrase boost: if FAQ question contains the full user query (or vice versa)
    const qLow = q.toLowerCase();
    if (f.q && f.q.toLowerCase().includes(qLow)) {
      score = Math.min(1, score + 0.18);
    } else if (qLow.includes(f.q.toLowerCase()) && f.q.length > 3) {
      score = Math.min(1, score + 0.12);
    }

    // small boost if tags match tokens (e.g., user typed "cardiologist")
    if (f.tags && f.tags.length) {
      for (const t of f.tags) {
        if (!t) continue;
        const lowerTag = String(t).toLowerCase();
        if (qTokens.includes(lowerTag) || q.toLowerCase().includes(lowerTag)) {
          score = Math.min(1, score + 0.08);
        }
      }
    }

    if (score > best.score) {
      best = { idx: i, score, overlap, phraseBoost: false };
    }
  }

  // tuning threshold
  const THRESHOLD = 0.18;

  if (best.idx >= 0 && best.score >= THRESHOLD) {
    const matched = indexedFAQ[best.idx];
    return {
      answer: matched.a || "Sorry, I couldn't find a full answer right now.",
      score: Number(best.score.toFixed(3)),
      matchedQuestion: matched.q,
      tags: matched.tags || [],
    };
  }

  // fallback: try keyword synonyms: find best FAQ that contains at least one canonical synonym
  for (const [canon, syns] of Object.entries(SYNONYMS)) {
    if (qTokens.includes(canon) || syns.some(s => qTokens.includes(normalizeToken(s)))) {
      const found = indexedFAQ.find(f => f.tokens.includes(canon));
      if (found) {
        return {
          answer: found.a || "I might not be certain; please consult a professional.",
          score: 0.12,
          matchedQuestion: found.q,
          tags: found.tags || [],
        };
      }
    }
  }

  // last resort: try simple substring match (looser)
  for (let i = 0; i < indexedFAQ.length; i++) {
    const f = indexedFAQ[i];
    if (!f.q) continue;
    if (f.q.toLowerCase().includes(q.toLowerCase()) || q.toLowerCase().includes(f.q.toLowerCase())) {
      return {
        answer: f.a || "Maybe consult a professional.",
        score: 0.11,
        matchedQuestion: f.q,
        tags: f.tags || [],
      };
    }
  }

  // give caller ability to show a generic fallback message
  return null;
}

// Export functions
module.exports = {
  getBestAnswer,
  reloadFAQ,
  // expose these helpers if you want to inspect from other modules (optional)
  _internal: {
    tokenize,
    normalize,
    expandTokensWithSynonyms,
    jaccard,
    tokenOverlapScore,
    indexedFAQ,
    SYNONYMS,
  },
};
