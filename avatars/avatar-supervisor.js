const FORBIDDEN=new Set([
  "race","ethnicity","intelligence","iq","ability","disciplineRisk",
  "politicalIdentity","religiousIdentity","socioeconomicStatus"
]);

export class AvatarSupervisor{
  inspect(manifest={},enrollmentProfile=null){
    const concerns=[];
    if(manifest.supervisor!=="noema") concerns.push("Mentor supervisor must remain NOEMA.");
    if(manifest.inferenceBoundary?.appearanceUsedForLearnerInference!==false)
      concerns.push("Avatar appearance must not be used for learner inference.");
    if(manifest.inferenceBoundary?.drawingUsedForPsychologicalInference!==false)
      concerns.push("A user's drawing must not be used for psychological inference.");

    const serialized=JSON.stringify(manifest.appearance||{});
    for(const key of FORBIDDEN){
      if(serialized.includes(`"${key}"`)) concerns.push(`Appearance contains prohibited inference field: ${key}.`);
    }

    return {
      ok:concerns.length===0,
      supervisor:"noema",
      concerns,
      audience:
        enrollmentProfile?.ageBand==="child-under-13"?"child":
        enrollmentProfile?.ageBand==="teen-13-17"?"teen":"adult",
      guardianPathway:enrollmentProfile?.accountPathway||"unknown",
      restrictions:{
        canElevatePermissions:false,
        canChangeGuardianPolicy:false,
        canAccessAdmin:false,
        canDisableConstitution:false
      }
    };
  }
}
