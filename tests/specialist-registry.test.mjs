import test from "node:test";
import assert from "node:assert/strict";
import {
  specialistEligible,
  SPECIALIST_STATES,
  getSpecialist
} from "../specialists/specialist-registry.js";

test("Hope requires explicit adult request",()=>{
  assert.equal(
    specialistEligible("hope",{
      audience:"adult",
      explicitRequest:false
    }).eligible,
    false
  );

  assert.equal(
    specialistEligible("hope",{
      audience:"adult",
      explicitRequest:true
    }).eligible,
    true
  );
});

test("333 remains account restricted",()=>{
  const x=specialistEligible("333",{
    audience:"adult",
    accountConnected:false
  });

  assert.equal(x.eligible,false);
  assert.equal(x.reason,"account-required");
  assert.equal(
    getSpecialist("333").state,
    SPECIALIST_STATES.RESTRICTED
  );
});

test("Moirai is registered as Music Mentor of The Refrain",()=>{
  const s=getSpecialist("moirai");

  assert.ok(s);
  assert.equal(s.state,SPECIALIST_STATES.HANDOFF);
  assert.equal(s.category,"music-mentoring");
  assert.equal(
    s.url,
    "https://artist1970.github.io/Moirai.github.io/"
  );
  assert.ok(s.purposes.includes("music"));
  assert.ok(s.purposes.includes("composition"));
  assert.ok(s.purposes.includes("songwriting"));
  assert.ok(s.notes.includes("Music Mentor of The Refrain"));
});

test("Zelle is registered as Art Director at Bazaar Art",()=>{
  const s=getSpecialist("zelle");

  assert.ok(s);
  assert.equal(s.state,SPECIALIST_STATES.HANDOFF);
  assert.equal(s.category,"bazaar-art-direction");
  assert.equal(
    s.url,
    "https://artist1970.github.io/Zelle.github.io/"
  );
  assert.ok(s.purposes.includes("bazaar-art"));
  assert.ok(s.purposes.includes("art-direction"));
  assert.ok(s.notes.includes("Art Director at Bazaar Art"));
});

test("Eiren is registered for reflective creative guidance",()=>{
  const s=getSpecialist("eiren");

  assert.ok(s);
  assert.equal(s.state,SPECIALIST_STATES.HANDOFF);
  assert.equal(
    s.url,
    "https://artist1970.github.io/Eiren.github.io/"
  );
  assert.ok(s.purposes.includes("reflection"));
  assert.ok(s.purposes.includes("poetry"));
  assert.ok(s.purposes.includes("songwriting"));
});

test("Archaemenes uses the canonical live repository",()=>{
  const s=getSpecialist("archaemenes");

  assert.ok(s);
  assert.equal(s.state,SPECIALIST_STATES.HANDOFF);
  assert.equal(
    s.url,
    "https://artist1970.github.io/Archaemenes.github.io/"
  );
  assert.ok(s.purposes.includes("learning"));
  assert.ok(s.purposes.includes("tutoring"));
});

test("canonical specialists remain audience eligible where approved",()=>{
  assert.equal(
    specialistEligible("moirai",{audience:"adult"}).eligible,
    true
  );

  assert.equal(
    specialistEligible("zelle",{audience:"child"}).eligible,
    true
  );

  assert.equal(
    specialistEligible("eiren",{audience:"student"}).eligible,
    true
  );

  assert.equal(
    specialistEligible("archaemenes",{audience:"child"}).eligible,
    true
  );
});
