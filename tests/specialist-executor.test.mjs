import test from "node:test";
import assert from "node:assert/strict";
import {SpecialistExecutor} from "../orchestration/specialist-executor.js";

const core={
  accountServer:{connected:false}
};

test("Moirai produces music handoff rather than fake execution",()=>{
  const ex=new SpecialistExecutor({core});
  const result=ex.execute(
    {id:"music",specialistId:"moirai"},
    {
      message:"Help me write a melody and chord progression for a new song",
      route:{mode:{id:"creative"}},
      context:{}
    }
  );

  assert.equal(result.status,"handoff");
  assert.equal(result.output.executed,false);
  assert.equal(result.output.specialistId,"moirai");
  assert.equal(result.output.url,"https://artist1970.github.io/Moirai.github.io/");
  assert.equal(result.output.brief.mode,"compose");
  assert.ok(result.output.brief.domains.includes("melody"));
  assert.ok(result.output.brief.domains.includes("harmony"));
});

test("Zelle produces Bazaar Art handoff rather than fake execution",()=>{
  const ex=new SpecialistExecutor({core});
  const result=ex.execute(
    {id:"visual",specialistId:"zelle"},
    {
      message:"Help me develop the composition and color direction for a painting",
      route:{mode:{id:"creative"}},
      context:{}
    }
  );

  assert.equal(result.status,"handoff");
  assert.equal(result.output.executed,false);
  assert.equal(result.output.specialistId,"zelle");
  assert.equal(result.output.url,"https://artist1970.github.io/Zelle.github.io/");
});

test("Eiren produces reflective creative handoff rather than fake execution",()=>{
  const ex=new SpecialistExecutor({core});
  const result=ex.execute(
    {id:"reflection",specialistId:"eiren"},
    {
      message:"Help me shape this reflection into a poem",
      route:{mode:{id:"creative"}},
      context:{}
    }
  );

  assert.equal(result.status,"handoff");
  assert.equal(result.output.executed,false);
  assert.equal(result.output.specialistId,"eiren");
  assert.equal(result.output.url,"https://artist1970.github.io/Eiren.github.io/");
});

test("Archaemenes produces academic handoff rather than fake execution",()=>{
  const ex=new SpecialistExecutor({core});
  const result=ex.execute(
    {id:"academic",specialistId:"archaemenes"},
    {
      message:"Help me understand this science lesson",
      route:{mode:{id:"learning"}},
      context:{}
    }
  );

  assert.equal(result.status,"handoff");
  assert.equal(result.output.executed,false);
  assert.equal(result.output.specialistId,"archaemenes");
  assert.equal(result.output.url,"https://artist1970.github.io/Archaemenes.github.io/");
});

test("Eiren accepts a governed child literacy handoff without execution",()=>{
  const ex=new SpecialistExecutor({core});
  const result=ex.execute(
    {id:"early-literacy",specialistId:"eiren"},
    {
      message:"Read this story with me and help me talk about the new words",
      route:{mode:{id:"learning"}},
      context:{enrollment:{ageBand:"child-under-13"}}
    }
  );

  assert.equal(result.status,"handoff");
  assert.equal(result.output.executed,false);
  assert.equal(result.output.specialistId,"eiren");
  assert.equal(result.output.url,"https://artist1970.github.io/Eiren.github.io/");
});

test("Verifier local state can execute",()=>{
  const ex=new SpecialistExecutor({core});
  const result=ex.execute(
    {id:"verify",specialistId:"verifier"},
    {
      context:{},
      verifierSession:{
        analysis:{domain:"science"},
        verdict:{
          status:"unexamined",
          canUseVerifiedLabel:false,
          missingRequiredLanes:["arshif"]
        }
      }
    }
  );

  assert.equal(result.status,"complete");
  assert.equal(result.output.verifiedLabelAllowed,false);
});


test("Moirai's broad creative mode distinguishes composing from learning",()=>{
  const ex=new SpecialistExecutor({core});
  const composition=ex.execute(
    {id:"music",specialistId:"moirai"},
    {message:"Help me create a melody and chord progression",route:{mode:{id:"creative"}},context:{}}
  );
  assert.equal(composition.status,"handoff");
  assert.equal(composition.output.brief.mode,"compose");
  assert.equal(composition.output.executed,false);
  const lesson=ex.execute(
    {id:"music",specialistId:"moirai"},
    {message:"Teach me music theory",route:{mode:{id:"learning"}},context:{}}
  );
  assert.equal(lesson.status,"handoff");
  assert.equal(lesson.output.brief.mode,"learn");
});
