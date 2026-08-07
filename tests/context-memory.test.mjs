import test from "node:test";
import assert from "node:assert/strict";
import { buildNoemaContext } from "../core/context-builder.js";

test("context separates recent continuity from explicit memory", () => {
  const context = buildNoemaContext({
    role: "adult",
    mode: "work",
    query: "NOEMA architecture",
    continuity: [{ user: "recent", assistant: "reply" }],
    memories: [{
      id: "m1",
      title: "NOEMA architecture",
      content: "Continue the NOEMA repository.",
      kind: "project",
      scope: "work",
      tags: ["noema"],
      active: true
    }],
    activeProject: {
      id: "p1",
      title: "NOEMA",
      summary: "Adult intelligence.",
      mode: "work",
      status: "active",
      tags: ["ai"]
    }
  });

  assert.equal(context.continuity.length, 1);
  assert.equal(context.memory.activeCount, 1);
  assert.equal(context.memory.relevant[0].id, "m1");
  assert.equal(context.project.title, "NOEMA");
});
