import test from "node:test";
import assert from "node:assert/strict";
import { ProjectContextStore } from "../memory/project-context-store.js";

function storageHarness() {
  const map = new Map();
  return {
    storage: {
      getItem: key => map.get(key) ?? null,
      setItem: (key, value) => map.set(key, value),
      removeItem: key => map.delete(key)
    }
  };
}

test("new project becomes active context", () => {
  const { storage } = storageHarness();
  const projects = new ProjectContextStore(storage);
  const project = projects.create({
    title: "NOEMA",
    summary: "Build adult intelligence.",
    mode: "work"
  });

  assert.equal(projects.active().id, project.id);
  assert.equal(projects.active().title, "NOEMA");
});
