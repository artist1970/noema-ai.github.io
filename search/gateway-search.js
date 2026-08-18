const DIRECTORY_URL = "./directory/ecosystem.json";

let directoryEntries = [];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreEntry(entry, query) {
  const q = normalize(query);
  if (!q) return 0;

  const name = normalize(entry.name);
  const description = normalize(entry.description);
  const type = normalize(entry.type);
  const keywords = (entry.keywords || []).map(normalize);

  let score = 0;
  if (name === q) score += 120;
  if (name.includes(q)) score += 70;
  if (description.includes(q)) score += 35;
  if (type.includes(q)) score += 25;

  for (const keyword of keywords) {
    if (keyword === q) score += 55;
    else if (keyword.includes(q) || q.includes(keyword)) score += 28;
  }

  const parts = q.split(" ").filter(Boolean);
  for (const part of parts) {
    if (name.includes(part)) score += 18;
    if (description.includes(part)) score += 8;
    if (keywords.some(k => k.includes(part))) score += 12;
  }

  return score;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function card(entry, score = 0) {
  return `
    <article class="result-card">
      <div class="result-top">
        <span class="result-type">${escapeHtml(entry.type)}</span>
        ${score ? `<span class="result-score">match ${Math.min(99, score)}</span>` : ""}
      </div>
      <h3>${escapeHtml(entry.name)}</h3>
      <p>${escapeHtml(entry.description)}</p>
      <a href="${escapeHtml(entry.url)}" target="_self">Open ${escapeHtml(entry.name)} →</a>
    </article>
  `;
}

function renderResults(entries, label) {
  const results = document.querySelector("#searchResults");
  const heading = document.querySelector("#resultHeading");

  heading.textContent = label;
  results.innerHTML = entries.length
    ? entries.map(item => card(item.entry || item, item.score || 0)).join("")
    : `<div class="empty">I couldn't find a direct match. <a href="https://artist1970.github.io/NAIB.github.io/">Meet NAIB</a> and ask for help finding the right place.</div>`;
}

function searchDirectory(query) {
  const q = normalize(query);

  if (!q) {
    renderResults(
      directoryEntries.slice(0, 8),
      "Explore the ecosystem"
    );
    return;
  }

  const ranked = directoryEntries
    .map(entry => ({ entry, score: scoreEntry(entry, q) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  renderResults(ranked, ranked.length ? `Results for “${query}”` : "No direct match");
}

async function loadDirectory() {
  try {
    const response = await fetch(DIRECTORY_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Directory unavailable (${response.status})`);
    const data = await response.json();
    directoryEntries = Array.isArray(data.entries) ? data.entries : [];
    searchDirectory("");
  } catch (error) {
    document.querySelector("#searchResults").innerHTML = `
      <div class="empty">
        The directory is temporarily unavailable.
        <a href="https://artist1970.github.io/NAIB.github.io/">Meet NAIB</a>
        or return to <a href="https://vervenveda.com/">Verve N Veda</a>.
      </div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#gatewaySearch");
  const input = document.querySelector("#gatewayQuery");
  const directoryToggle = document.querySelector("#directoryToggle");
  const directoryPanel = document.querySelector("#directoryPanel");

  form.addEventListener("submit", event => {
    event.preventDefault();
    searchDirectory(input.value);
    document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  input.addEventListener("input", () => {
    if (input.value.trim().length >= 2 || input.value.trim().length === 0) {
      searchDirectory(input.value);
    }
  });

  directoryToggle.addEventListener("click", () => {
    directoryPanel.hidden = !directoryPanel.hidden;
    directoryToggle.setAttribute("aria-expanded", String(!directoryPanel.hidden));
    if (!directoryPanel.hidden) {
      renderResults(directoryEntries, "Complete public directory");
      document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  loadDirectory();
});
