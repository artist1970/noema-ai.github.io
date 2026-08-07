export const ACCOUNT_PATHWAYS = Object.freeze([
  "guardian-managed-child",
  "guardian-linked-teen",
  "independent-adult"
]);

export const EDUCATION_SETTINGS = Object.freeze([
  "preschool",
  "k12-school",
  "homeschool",
  "college",
  "higher-learning",
  "professional",
  "independent",
  "not-currently-enrolled"
]);

export const GRADE_LEVELS = Object.freeze([
  "preschool",
  "kindergarten",
  "grade-01",
  "grade-02",
  "grade-03",
  "grade-04",
  "grade-05",
  "grade-06",
  "grade-07",
  "grade-08",
  "grade-09",
  "grade-10",
  "grade-11",
  "grade-12",
  "college",
  "graduate",
  "professional",
  "adult-continuing",
  "independent",
  "not-applicable"
]);

export const INTERESTS = Object.freeze([
  "music",
  "cooking",
  "reading",
  "art",
  "writing",
  "science",
  "mathematics",
  "history",
  "nature",
  "animals",
  "space",
  "technology",
  "building",
  "games",
  "sports",
  "languages",
  "design",
  "photography",
  "film",
  "gardening"
]);

export const FAVORITE_SUBJECTS = Object.freeze([
  "mathematics",
  "science",
  "language-arts",
  "social-studies",
  "history",
  "art",
  "music",
  "technology",
  "languages",
  "physical-education",
  "not-sure-yet",
  "not-applicable"
]);

export function calculateAgeFromMonthYear({
  birthMonth,
  birthYear,
  now = new Date()
} = {}) {
  const month = Number(birthMonth);
  const year = Number(birthYear);

  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  if (!Number.isInteger(year) || year < 1900 || year > now.getFullYear()) return null;

  let age = now.getFullYear() - year;
  const currentMonth = now.getMonth() + 1;
  if (currentMonth < month) age -= 1;
  return age >= 0 ? age : null;
}

export function ageBand(age) {
  if (!Number.isFinite(age)) return "unknown";
  if (age < 13) return "child-under-13";
  if (age < 18) return "teen-13-17";
  return "adult-18-plus";
}

export function accountPathwayForAge(age) {
  const band = ageBand(age);
  if (band === "child-under-13") return "guardian-managed-child";
  if (band === "teen-13-17") return "guardian-linked-teen";
  if (band === "adult-18-plus") return "independent-adult";
  return "unknown";
}

function clean(value, max = 120) {
  return String(value || "").trim().slice(0, max);
}

export function normalizePersonProfile(input = {}) {
  const age = calculateAgeFromMonthYear(input);
  const interests = Array.isArray(input.interests)
    ? [...new Set(input.interests.filter(item => INTERESTS.includes(item)))].slice(0, 8)
    : [];

  return {
    schemaVersion: 1,
    personId: clean(input.personId, 80) || null,
    displayName: clean(input.displayName, 60),
    birthMonth: Number.isInteger(Number(input.birthMonth)) ? Number(input.birthMonth) : null,
    birthYear: Number.isInteger(Number(input.birthYear)) ? Number(input.birthYear) : null,
    age,
    ageBand: ageBand(age),
    accountPathway: accountPathwayForAge(age),

    // Educational placement is intentionally independent of chronological age.
    learning: {
      gradeLevel: GRADE_LEVELS.includes(input.gradeLevel) ? input.gradeLevel : "not-applicable",
      learningStage: clean(input.learningStage, 80),
      educationSetting: EDUCATION_SETTINGS.includes(input.educationSetting)
        ? input.educationSetting
        : "independent",
      favoriteSubject: FAVORITE_SUBJECTS.includes(input.favoriteSubject)
        ? input.favoriteSubject
        : "not-sure-yet",
      interests
    },

    // Appearance never belongs in this learner profile.
    // Avatar appearance is a separate future Avatar Foundry record.
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
