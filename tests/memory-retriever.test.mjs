import test from "node:test";
import assert from "node:assert/strict";
import { retrieveRelevantMemories } from "../memory/memory-retriever.js";

const memories = [
  {
    id: "m1",
    title: "Mathematics work",
    content: "Build the algebra curriculum.",
    tags: ["math", "algebra"],
    kind: "project",
    scope: "learning",
    active: true
  },
  {
    id: "m2",
    title: "Creative preference",
    content: "Prefers parchment and gold.",
    tags: ["design"],
    kind: "preference",
    scope: "creative",
    active: true
  }
];

test("retrieval favors query and mode relevant memory", () => {
  const result = retrieveRelevantMemories(memories, {
    query: "Continue algebra mathematics",
    mode: "learning"
  });

  assert.equal(result[0].id, "m1");
  assert.ok(result[0].relevanceScore > result[1]?.relevanceScore || result.length === 1);
});
