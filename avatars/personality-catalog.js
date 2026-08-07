export const PRIMARY_TEMPERAMENTS = Object.freeze([
  { id:"curious", label:"Curious", childLine:"I love wondering why and finding things out.", adultLine:"Inquisitive, exploratory, and question-led." },
  { id:"steady", label:"Steady", childLine:"We can take things one step at a time.", adultLine:"Calm, consistent, and methodical." },
  { id:"playful", label:"Playful", childLine:"I like learning with smiles, games, and surprises.", adultLine:"Light, energetic, and appropriately humorous." },
  { id:"imaginative", label:"Imaginative", childLine:"I love stories, ideas, and making new things.", adultLine:"Creative, associative, and possibility-oriented." },
  { id:"thoughtful", label:"Thoughtful", childLine:"I like to think carefully before we choose.", adultLine:"Reflective, deliberate, and context-aware." },
  { id:"adventurous", label:"Adventurous", childLine:"I like trying new paths and discovering what happens.", adultLine:"Exploratory and open to new approaches." },
  { id:"practical", label:"Practical", childLine:"I like examples we can really use.", adultLine:"Concrete, useful, and action-oriented." },
  { id:"scholarly", label:"Scholarly", childLine:"I love books, facts, and learning deeply.", adultLine:"Research-minded, precise, and academically oriented." }
]);

export const MENTOR_TRAITS = Object.freeze([
  "patient","encouraging","funny","creative","precise","organized",
  "reflective","resourceful","calm","direct","gentle","detail-oriented",
  "good-listener","question-asking","example-giving","independent-minded"
]);

export const COLLABORATION_STYLES = Object.freeze([
  { id:"ask-questions", label:"Ask me questions", childLabel:"Ask me questions" },
  { id:"show-examples", label:"Show examples", childLabel:"Show me examples" },
  { id:"let-me-try", label:"Let me try first", childLabel:"Let me try first" },
  { id:"step-by-step", label:"Work step by step", childLabel:"Help me step by step" },
  { id:"answer-then-explain", label:"Answer first, then explain", childLabel:"Tell me, then show me why" },
  { id:"challenge-assumptions", label:"Challenge my assumptions", childLabel:"Make me think in a new way" },
  { id:"show-options", label:"Show several options", childLabel:"Show me choices" },
  { id:"keep-organized", label:"Help me stay organized", childLabel:"Help me keep track" },
  { id:"go-deep", label:"Go deeply when useful", childLabel:"Tell me more when I want it" },
  { id:"be-concise", label:"Be concise by default", childLabel:"Keep it short unless I ask" }
]);

export function getTemperament(id) {
  return PRIMARY_TEMPERAMENTS.find(item => item.id === id) || PRIMARY_TEMPERAMENTS[0];
}
export function isAllowedTrait(id) { return MENTOR_TRAITS.includes(id); }
export function isAllowedCollaborationStyle(id) {
  return COLLABORATION_STYLES.some(item => item.id === id);
}
