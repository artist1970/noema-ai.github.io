function lowerSet(values=[]) {
  return new Set(values.map(v=>String(v || "").trim().toLowerCase()).filter(Boolean));
}

export function audienceFromEnrollment(enrollment=null) {
  if(!enrollment) return "adult";
  const grade=String(enrollment.learning?.gradeLevel || "").toLowerCase();
  if(grade==="preschool") return "preschool";
  if(grade==="kindergarten") return "kindergarten";
  const m=grade.match(/^grade-(\d{2})$/);
  if(m) {
    const n=Number(m[1]);
    if(n<=5) return "elementary";
    if(n<=8) return "middle";
    return "high";
  }
  if(["college","graduate","professional"].includes(grade)) return "higher-learning";
  if(enrollment.ageBand==="child-under-13") return "elementary";
  if(enrollment.ageBand==="teen-13-17") return "high";
  return "adult";
}

export function roleFromEnrollment(enrollment=null) {
  if(!enrollment) return "student";
  if(enrollment.accountPathway==="guardian-managed" || enrollment.accountPathway==="guardian-linked")
    return "student";
  return "student";
}

export function explicitPreferenceTerms({query="",context={}}={}) {
  const terms=new Set();
  const q=String(query || "").toLowerCase();

  // Request-local intent is permitted. It is not retained as a demographic or religious inference.
  if(/\b(bible|biblical|scripture|faith|christian|religion|religious)\b/i.test(q)) {
    terms.add("faith");
    terms.add("biblical-study");
  }

  for(const value of [
    ...(context.enrollment?.learning?.interests || []),
    ...(context.avatar?.sharedInterests || [])
  ]) {
    terms.add(String(value || "").toLowerCase());
  }

  return [...terms];
}

export function checkResourceEligibility(resource,{
  audience="adult",
  role="student",
  preferenceTerms=[]
}={}) {
  const reasons=[];
  if(resource.mentorEligible!==true) reasons.push("mentor-ineligible");

  if(resource.audiences?.length && !resource.audiences.includes(audience)) {
    // Parent resources are intentionally not reclassified as learner resources.
    reasons.push("audience-mismatch");
  }

  if(resource.roles?.length && !resource.roles.includes(role)) {
    reasons.push("role-mismatch");
  }

  if(resource.requiresPreferenceMatch?.length) {
    const prefs=lowerSet(preferenceTerms);
    const match=resource.requiresPreferenceMatch.some(term=>prefs.has(String(term).toLowerCase()));
    if(!match) reasons.push("preference-match-required");
  }

  return {
    eligible:reasons.length===0,
    reasons
  };
}
