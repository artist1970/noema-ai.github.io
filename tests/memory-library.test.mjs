import test from "node:test";
import assert from "node:assert/strict";
import { MemoryStore } from "../memory/memory-store.js";

function harness() {
  const map = new Map();
  return {
    map,
    storage: {
      getItem: key => map.get(key) ?? null,
      setItem: (key, value) => map.set(key, value),
      removeItem: key => map.delete(key)
    }
  };
}

test("long-term memory requires confirmation", () => {
  const { storage } = harness();
  const store = new MemoryStore(storage);
  const result = store.add({ content: "Prefers concise technical summaries." });
  assert.equal(result.ok, false);
  assert.equal(store.list().length, 0);
});

test("confirmed memory is retained with provenance", () => {
  const { storage } = harness();
  const store = new MemoryStore(storage);
  const result = store.add({
    title: "Writing preference",
    content: "Prefers cohesive paragraphs.",
    kind: "preference",
    scope: "global",
    source: { type: "user-explicit", label: "Saved by user" }
  }, { confirmed: true });

  assert.equal(result.ok, true);
  assert.equal(store.list().length, 1);
  assert.equal(store.list()[0].source.label, "Saved by user");
});

test("obvious credentials are rejected from ordinary memory", () => {
  const { storage } = harness();
  const store = new MemoryStore(storage);
  const result = store.add({
    content: "My API key is abcdef"
  }, { confirmed: true });

  assert.equal(result.ok, false);
  assert.equal(store.list().length, 0);
});

test("memory can be edited and deleted explicitly", () => {
  const { storage } = harness();
  const store = new MemoryStore(storage);
  const added = store.add({ content: "First", scope: "work" }, { confirmed: true });
  const id = added.item.id;

  assert.equal(store.update(id, { content: "Second" }, { confirmed: true }).ok, true);
  assert.equal(store.get(id).content, "Second");

  assert.equal(store.remove(id, { confirmed: true }).ok, true);
  assert.equal(store.list().length, 0);
});
