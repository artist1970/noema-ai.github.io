import test from "node:test";
import assert from "node:assert/strict";
import {
  AuroraDictionary,
  dictionaryEntrySenses,
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

test("Aurora dictionary preserves multiple senses and rich metadata", () => {
  const payload = normalizeLetterPayload({
    letter: "C",
    entries: [{
      word: "capital",
      definition: "A city where a government is based.",
      subjects: ["civics"],
      senses: [
        { definition: "A city where a government is based.", partOfSpeech: "noun" },
        { definition: "Money or resources used for investment.", partOfSpeech: "noun", subjects: ["finance"] }
      ]
    }]
  }, "C");

  assert.equal(payload.entries.length, 1);
  assert.equal(payload.entries[0].subjects[0], "civics");
  assert.equal(dictionaryEntrySenses(payload.entries[0]).length, 2);
  assert.equal(dictionaryEntrySenses(payload.entries[0])[1].definition, "Money or resources used for investment.");
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

test("Aurora dictionary loads one letter and reports exact sense count", async () => {
  const calls = [];
  const fakeFetch = async url => {
    calls.push(url);
    return new Response(JSON.stringify({
      letter: "A",
      entries: [
        {
          word: "abacus",
          definition: "A device with movable beads used for counting and arithmetic.",
          senses: [
            { definition: "A device with movable beads used for counting and arithmetic.", partOfSpeech: "noun" },
            { definition: "A frame or diagram formerly used for calculation or record keeping.", partOfSpeech: "noun" }
          ]
        },
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
  assert.equal(result.exactSenseCount, 2);
  assert.equal(calls.length, 1);
  assert.match(calls[0], /A-words$/);

  await dictionary.lookup("ability");
  assert.equal(calls.length, 1, "the same letter should be reused from memory during the session");
});
