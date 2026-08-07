function tokenize(value = "") {
  return [...new Set(
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter(token => token.length > 2)
  )];
}

export function scoreMemory(memory, {
  query = "",
  mode = "personal",
  activeProject = null
} = {}) {
  const queryTokens = tokenize(query);
  const memoryText = [
    memory.title,
    memory.content,
    ...(memory.tags || []),
    memory.kind,
    memory.scope
  ].join(" ").toLowerCase();

  let score = 0;

  for (const token of queryTokens) {
    if (memoryText.includes(token)) score += 3;
  }

  if (memory.scope === "global") score += 1;
  if (memory.scope === mode) score += 3;

  if (activeProject) {
    const projectTokens = tokenize(`${activeProject.title} ${activeProject.summary} ${(activeProject.tags || []).join(" ")}`);
    for (const token of projectTokens) {
      if (memoryText.includes(token)) score += 2;
    }
    if (memory.kind === "project") score += 1;
  }

  if (memory.kind === "decision") score += 0.5;
  if (memory.kind === "preference") score += 0.4;

  return score;
}

export function retrieveRelevantMemories(memories = [], context = {}, limit = 8) {
  return memories
    .filter(memory => memory?.active !== false)
    .map(memory => ({ memory, score: scoreMemory(memory, context) }))
    .filter(entry => entry.score > 0 || entry.memory.scope === "global")
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(entry => ({
      ...entry.memory,
      relevanceScore: Number(entry.score.toFixed(2))
    }));
}
