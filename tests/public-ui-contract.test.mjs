import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../app/noema-app.js", import.meta.url), "utf8");
const presentation = fs.readFileSync(new URL("../front/public-presentation.js", import.meta.url), "utf8");

const wiredButtons = [
  "routeBtn",
  "clearBtn",
  "eraseBtn",
  "voiceTalkBtn",
  "readResponseBtn",
  "verifierBtn",
  "verifierClose",
  "addEvidenceBtn",
  "freshnessVerifiedBtn",
  "saveVerificationBtn",
  "avatarBtn",
  "avatarClose",
  "partsTab",
  "drawTab",
  "sketchEraser",
  "sketchSymmetry",
  "sketchUndo",
  "sketchRedo",
  "sketchClear",
  "sketchRefine",
  "sketchSave",
  "saveAvatarDraftBtn",
  "hearMentorBtn",
  "enrollmentBtn",
  "enrollmentClose",
  "memoryBtn",
  "memoryClose",
  "exportMemoryBtn"
];

test("public control IDs exist and have application handlers", () => {
  for (const id of wiredButtons) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `${id} is missing from index.html`);
    assert.match(app, new RegExp(`${id}\\.addEventListener`), `${id} has no application handler`);
  }
});

test("form submit controls have submit handlers", () => {
  for (const form of ["verifierForm", "avatarForm", "enrollmentForm", "memoryForm", "projectForm"]) {
    assert.match(html, new RegExp(`id=["']${form}["']`));
    assert.match(app, new RegExp(`${form}\\.addEventListener\\(["']submit["']`));
  }
});

test("optional diagnostics are converted to collapsed disclosures", () => {
  assert.match(presentation, /prepareProcessDisclosure/);
  assert.match(presentation, /prepareModuleDisclosure/);
  assert.match(presentation, /collapseResponseDiagnostics/);
  assert.doesNotMatch(presentation, /details\.open\s*=\s*true/);
});

test("public landing copy does not expose the internal administrative name", () => {
  assert.doesNotMatch(html, />[^<]*NOEMA[^<]*</i);
  assert.doesNotMatch(html, /(aria-label|title|placeholder|content)=["'][^"']*NOEMA[^"']*["']/i);
});
