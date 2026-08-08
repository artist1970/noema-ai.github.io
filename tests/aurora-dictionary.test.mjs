import test from "node:test";
import assert from "node:assert/strict";
import {
  AuroraDictionary,
  dictionaryLetter,
  dictionaryLetterUrl,
  normalizeLetterPayload,
  searchDictionaryEntries
} from "../resources/aurora-dictionary.js";

test("Aurora dictionary resolves letter URLs safely", () => {
  assert.equal(dictionaryLetter("Abacus"), "A");
  assert.match(dictionaryLetterUrl("A"), /AuroraCore\/main\/dictionary\/letters\/A-words$/);
  assert.throws(() => dictionaryLetterUrl("AA"), /dictionary-letter-invalid/);
});

test("Aurora dictionary returns exact definitions before nearby words", () => {
  const payload = normalizeLetterPayload({
    letter: "A",
    entries: [
      { word: "abacus", definition: "A counting device." },
      { word: "abandon", definition: "To leave behind." },
      { word: "ability", definition: "Capacity to do something." }
    ]
  }, "A");

  const result = searchDictionaryEntries(payload.entries, "abacus");
  assert.equal(result.exact.length, 1);
  assert.equal(result.results[0].word, "abacus");
});

test("Aurora dictionary loads one letter and performs a lookup", async () => {
  const calls = [];
  const fakeFetch = async url => {
    calls.push(url);
    return new Response(JSON.stringify({
      letter: "A",
      entries: [
        { word: "abacus", definition: "A device with movable beads used for counting and arithmetic." },
        { word: "ability", definition: "The skill or capacity to do something." }
      ]
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  const dictionary = new AuroraDictionary({
    fetchImpl: fakeFetch,
    cacheStorage: null,
    rawBase: "https://example.test/dictionary/letters"
  });

  const result = await dictionary.lookup("abacus");
  assert.equal(result.ok, true);
  assert.equal(result.letter, "A");
  assert.equal(result.exact[0].definition, "A device with movable beads used for counting and arithmetic.");
  assert.equal(calls.length, 1);
  assert.match(calls[0], /A-words$/);

  await dictionary.lookup("ability");
  assert.equal(calls.length, 1, "the same letter should be reused from memory during the session");
});
