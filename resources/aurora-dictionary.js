export const AURORA_DICTIONARY_CONFIG = Object.freeze({
  repository: "artist1970/AuroraCore",
  repositoryUrl: "https://github.com/artist1970/AuroraCore",
  dictionaryUrl: "https://github.com/artist1970/AuroraCore/tree/main/dictionary",
  rawBase: "https://raw.githubusercontent.com/artist1970/AuroraCore/main/dictionary/letters",
  cacheName: "naib-aurora-dictionary-v2",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
});

export function normalizeDictionaryQuery(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/^[^a-z]+|[^a-z'-]+$/g, "")
    .slice(0, 100);
}

export function dictionaryLetter(value = "") {
  const query = normalizeDictionaryQuery(value);
  const match = query.match(/[a-z]/i);
  return match ? match[0].toUpperCase() : "";
}

export function dictionaryLetterUrl(letter, base = AURORA_DICTIONARY_CONFIG.rawBase) {
  const normalized = String(letter || "").trim().toUpperCase();
  if (!AURORA_DICTIONARY_CONFIG.alphabet.includes(normalized) || normalized.length !== 1) {
    throw new Error("dictionary-letter-invalid");
  }
  return `${base}/${normalized}-words`;
}

function cleanList(value) {
  return Array.isArray(value)
    ? value.map(item => String(item || "").trim()).filter(Boolean)
    : [];
}

function normalizeSense(raw = {}) {
  const definition = String(raw?.definition || "").trim();
  if (!definition) return null;
  const sense = { definition };
  const partOfSpeech = String(raw?.partOfSpeech || "").trim();
  const example = String(raw?.example || "").trim();
  const id = String(raw?.id || raw?.senseId || "").trim();
  const sourceId = String(raw?.sourceId || "").trim();
  if (id) sense.id = id;
  if (partOfSpeech) sense.partOfSpeech = partOfSpeech;
  if (example) sense.example = example;
  if (sourceId) sense.sourceId = sourceId;
  for (const field of ["synonyms", "antonyms", "subjects", "labels"]) {
    const list = cleanList(raw?.[field]);
    if (list.length) sense[field] = list;
  }
  return sense;
}

export function dictionaryEntrySenses(entry = {}) {
  const collected = [];
  const primary = normalizeSense(entry);
  if (primary) collected.push(primary);
  for (const raw of Array.isArray(entry?.senses) ? entry.senses : []) {
    const sense = normalizeSense(raw);
    if (sense) collected.push(sense);
  }

  const seen = new Set();
  return collected.filter(sense => {
    const key = [
      sense.definition.toLowerCase(),
      String(sense.partOfSpeech || "").toLowerCase(),
      String(sense.example || "").toLowerCase()
    ].join("\u0000");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeDictionaryEntry(entry = {}) {
  const word = String(entry?.word || "").trim();
  const senses = dictionaryEntrySenses(entry);
  const definition = String(entry?.definition || senses[0]?.definition || "").trim();
  if (!word || !definition) return null;

  const normalized = { word, definition };
  for (const field of ["partOfSpeech", "example", "etymology", "pronunciation", "sourceId"]) {
    const value = String(entry?.[field] || "").trim();
    if (value) normalized[field] = value;
  }
  for (const field of ["synonyms", "antonyms", "subjects", "gradeBands", "labels", "forms"]) {
    const list = cleanList(entry?.[field]);
    if (list.length) normalized[field] = list;
  }
  if (senses.length > 1 || Array.isArray(entry?.senses)) normalized.senses = senses;
  if (entry?.provenance && typeof entry.provenance === "object") normalized.provenance = entry.provenance;
  if (Number.isFinite(Number(entry?.frequency))) normalized.frequency = Number(entry.frequency);
  return normalized;
}

export function normalizeLetterPayload(payload, expectedLetter = "") {
  const raw = typeof payload === "string" ? JSON.parse(payload) : payload;
  const letter = String(raw?.letter || expectedLetter || "").trim().toUpperCase();
  const entries = Array.isArray(raw?.entries) ? raw.entries : [];

  return {
    letter,
    entries: entries.map(normalizeDictionaryEntry).filter(Boolean)
  };
}

function uniqueSuggestions(entries, query) {
  const seen = new Set();
  const ranked = [];

  for (const entry of entries) {
    const word = entry.word.toLowerCase();
    if (word === query) continue;

    let rank = Number.POSITIVE_INFINITY;
    if (word.startsWith(query)) rank = 10 + Math.max(0, word.length - query.length);
    else {
      const index = word.indexOf(query);
      if (index >= 0) rank = 100 + index + Math.max(0, word.length - query.length);
    }

    if (!Number.isFinite(rank) || seen.has(word)) continue;
    seen.add(word);
    ranked.push({ ...entry, rank });
  }

  return ranked.sort((a, b) => a.rank - b.rank || a.word.localeCompare(b.word));
}

export function searchDictionaryEntries(entries = [], value = "", { limit = 12 } = {}) {
  const query = normalizeDictionaryQuery(value);
  if (!query) return { query, exact: [], suggestions: [], results: [] };

  const exact = entries.filter(entry => entry.word.toLowerCase() === query);
  const suggestions = uniqueSuggestions(entries, query).slice(0, Math.max(0, limit - exact.length));

  return {
    query,
    exact,
    suggestions,
    results: [...exact, ...suggestions].slice(0, limit)
  };
}

export class AuroraDictionary {
  constructor({
    fetchImpl = globalThis.fetch,
    cacheStorage = globalThis.caches,
    rawBase = AURORA_DICTIONARY_CONFIG.rawBase
  } = {}) {
    this.fetchImpl = fetchImpl;
    this.cacheStorage = cacheStorage;
    this.rawBase = rawBase;
    this.memory = new Map();
  }

  async #cachedText(url) {
    if (!this.cacheStorage?.open) return "";
    try {
      const cache = await this.cacheStorage.open(AURORA_DICTIONARY_CONFIG.cacheName);
      const response = await cache.match(url);
      return response?.ok ? await response.text() : "";
    } catch {
      return "";
    }
  }

  async #cacheResponse(url, response) {
    if (!this.cacheStorage?.open || !response?.clone) return;
    try {
      const cache = await this.cacheStorage.open(AURORA_DICTIONARY_CONFIG.cacheName);
      await cache.put(url, response.clone());
    } catch {
      // Browser-managed cache is an optimization, never a lookup requirement.
    }
  }

  async loadLetter(letter, { force = false } = {}) {
    const normalized = String(letter || "").trim().toUpperCase();
    const url = dictionaryLetterUrl(normalized, this.rawBase);

    if (!force && this.memory.has(normalized)) return this.memory.get(normalized);

    let networkError = null;
    if (typeof this.fetchImpl === "function") {
      try {
        const response = await this.fetchImpl(url, {
          method: "GET",
          credentials: "omit",
          cache: "no-cache",
          headers: { Accept: "application/json,text/plain;q=0.9,*/*;q=0.8" }
        });

        if (!response.ok) throw new Error(`dictionary-http-${response.status}`);
        const cacheCopy = response.clone?.();
        const text = await response.text();
        const payload = normalizeLetterPayload(text, normalized);
        this.memory.set(normalized, payload);
        if (cacheCopy) await this.#cacheResponse(url, cacheCopy);
        return payload;
      } catch (error) {
        networkError = error;
      }
    }

    const cached = await this.#cachedText(url);
    if (cached) {
      const payload = normalizeLetterPayload(cached, normalized);
      this.memory.set(normalized, payload);
      return payload;
    }

    throw networkError || new Error("dictionary-unavailable");
  }

  async lookup(value, { limit = 12 } = {}) {
    const query = normalizeDictionaryQuery(value);
    const letter = dictionaryLetter(query);
    if (!query || !letter) {
      return { ok: false, reason: "Enter a word beginning with A–Z.", query, results: [] };
    }

    const payload = await this.loadLetter(letter);
    const search = searchDictionaryEntries(payload.entries, query, { limit });

    return {
      ok: true,
      query,
      letter,
      exact: search.exact,
      suggestions: search.suggestions,
      results: search.results,
      letterEntryCount: payload.entries.length,
      exactSenseCount: search.exact.reduce((sum, entry) => sum + dictionaryEntrySenses(entry).length, 0),
      source: {
        name: "AuroraCore",
        repository: AURORA_DICTIONARY_CONFIG.repository,
        url: AURORA_DICTIONARY_CONFIG.dictionaryUrl,
        letterUrl: dictionaryLetterUrl(letter, this.rawBase)
      }
    };
  }
}

export const auroraDictionary = new AuroraDictionary();
