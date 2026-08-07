export const MENTOR_MODULE_URL =
  "https://vervenveda.com/assessment-engine/mentor/index.js";

export async function loadMentorCore() {
  try {
    return await import(MENTOR_MODULE_URL);
  } catch (error) {
    return {
      unavailable: true,
      moduleUrl: MENTOR_MODULE_URL,
      error: String(error?.message || error)
    };
  }
}
