import {sourceForAudience} from "./federation-source-registry.js";

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

  if(["college","graduate","professional","adult-continuing"].includes(grade))
    return "higher-learning";

  if(enrollment.ageBand==="child-under-13") return "elementary";
  if(enrollment.ageBand==="teen-13-17") return "high";
  return "adult";
}

export function requestedAudienceFromQuery(query="",currentAudience="adult") {
  // Only an independent adult may deliberately browse another school stage.
  // A minor cannot use query wording to bypass an adult-only audience gate.
  if(!["adult","higher-learning"].includes(currentAudience)) return "";

  const q=String(query || "");
  if(/\bpreschool|pre-school|crech[eè]\b/i.test(q)) return "preschool";
  if(/\bkindergarten|kinder garden\b/i.test(q)) return "kindergarten";
  if(/\belementary|grade\s*[1-5]\b/i.test(q)) return "elementary";
  if(/\bmiddle school|grade\s*[6-8]\b/i.test(q)) return "middle";
  if(/\bhigh school|grade\s*(9|10|11|12)\b/i.test(q)) return "high";
  if(/\b(college|higher learning|university|graduate)\b/i.test(q)) return "higher-learning";
  return "";
}

export function resolveLearningContext({query="",context={}}={}) {
  const enrolledAudience=audienceFromEnrollment(context.enrollment);
  const requestedAudience=requestedAudienceFromQuery(query,enrolledAudience);
  const effectiveAudience=requestedAudience || enrolledAudience;

  return {
    enrolledAudience,
    requestedAudience,
    effectiveAudience,
    currentSchoolSourceId:sourceForAudience(effectiveAudience),
    gradeLevel:context.enrollment?.learning?.gradeLevel || "",
    favoriteSubject:context.enrollment?.learning?.favoriteSubject || "",
    interests:[...(context.enrollment?.learning?.interests || [])]
  };
}
