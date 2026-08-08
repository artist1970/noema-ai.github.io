import { auroraDictionary, AURORA_DICTIONARY_CONFIG } from "../resources/aurora-dictionary.js";

function ensureStyles() {
  if (document.querySelector('link[data-naib-dictionary-styles]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("../styles/naib-dictionary.css", import.meta.url).href;
  link.dataset.naibDictionaryStyles = "true";
  document.head.appendChild(link);
}

function makeResult(entry, exact = false) {
  const article = document.createElement("article");
  article.className = `dictionary-result${exact ? " exact" : ""}`;

  const word = document.createElement("strong");
  word.textContent = entry.word;

  const definition = document.createElement("p");
  definition.textContent = entry.definition;

  article.append(word, definition);
  return article;
}

function buildDrawer() {
  const drawer = document.createElement("div");
  drawer.id = "dictionaryDrawer";
  drawer.className = "dictionary-drawer";
  drawer.hidden = true;
  drawer.innerHTML = `
    <section class="dictionary-panel" role="dialog" aria-modal="true" aria-labelledby="dictionaryHeading">
      <header class="dictionary-head">
        <div>
          <div class="eyebrow">Language Reference · A–Z</div>
          <h2 id="dictionaryHeading">Dictionary</h2>
          <p>Look up a word without leaving NAIB. Definitions are read from the AuroraCore dictionary collection.</p>
        </div>
        <button class="dictionary-close" id="dictionaryClose" type="button" aria-label="Close Dictionary">×</button>
      </header>

      <form class="dictionary-search" id="dictionaryForm">
        <label for="dictionaryQuery">Word</label>
        <div class="dictionary-search-row">
          <input id="dictionaryQuery" type="search" maxlength="80" autocomplete="off" spellcheck="false" placeholder="Search a word…" required>
          <button class="btn primary" type="submit">Define</button>
        </div>
      </form>

      <div class="dictionary-status" id="dictionaryStatus" aria-live="polite">Enter a word to begin.</div>
      <div class="dictionary-results" id="dictionaryResults"></div>

      <footer class="dictionary-source">
        <span>Dictionary source: AuroraCore</span>
        <a href="${AURORA_DICTIONARY_CONFIG.dictionaryUrl}" target="_blank" rel="noopener">View source ↗</a>
      </footer>
    </section>
  `;
  document.body.appendChild(drawer);
  return drawer;
}

function mountDictionary() {
  if (typeof document === "undefined" || document.querySelector("#dictionaryBtn")) return;

  const actions = document.querySelector(".conversation .actions");
  if (!actions) return;

  ensureStyles();

  const button = document.createElement("button");
  button.className = "btn secondary";
  button.id = "dictionaryBtn";
  button.type = "button";
  button.textContent = "Dictionary";
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-controls", "dictionaryDrawer");

  const erase = actions.querySelector("#eraseBtn");
  actions.insertBefore(button, erase || null);

  const drawer = buildDrawer();
  const close = drawer.querySelector("#dictionaryClose");
  const form = drawer.querySelector("#dictionaryForm");
  const query = drawer.querySelector("#dictionaryQuery");
  const status = drawer.querySelector("#dictionaryStatus");
  const results = drawer.querySelector("#dictionaryResults");

  function openDictionary() {
    drawer.hidden = false;
    document.body.classList.add("dictionary-open");
    requestAnimationFrame(() => query.focus());
  }

  function closeDictionary() {
    drawer.hidden = true;
    document.body.classList.remove("dictionary-open");
    button.focus();
  }

  function renderLookup(data) {
    results.replaceChildren();

    if (!data.results.length) {
      const empty = document.createElement("div");
      empty.className = "dictionary-empty";
      empty.textContent = `No AuroraCore entry was found for “${data.query}” in the ${data.letter} collection.`;
      results.appendChild(empty);
      status.textContent = `No matching entry found. ${data.letterEntryCount} ${data.letter}-words were checked.`;
      return;
    }

    if (data.exact.length) {
      const title = document.createElement("div");
      title.className = "dictionary-section-label";
      title.textContent = data.exact.length === 1 ? "Definition" : "Definitions";
      results.appendChild(title);
      for (const entry of data.exact) results.appendChild(makeResult(entry, true));
    }

    if (data.suggestions.length) {
      const title = document.createElement("div");
      title.className = "dictionary-section-label related";
      title.textContent = data.exact.length ? "Related entries" : "Closest entries";
      results.appendChild(title);
      for (const entry of data.suggestions) results.appendChild(makeResult(entry));
    }

    const exactText = data.exact.length
      ? `${data.exact.length} exact definition${data.exact.length === 1 ? "" : "s"}`
      : `${data.results.length} related entr${data.results.length === 1 ? "y" : "ies"}`;
    status.textContent = `${exactText} · ${data.letterEntryCount} ${data.letter}-words available.`;
  }

  async function lookup() {
    const value = query.value.trim();
    if (!value) {
      status.textContent = "Enter a word to begin.";
      results.replaceChildren();
      return;
    }

    status.textContent = "Looking up the word…";
    results.replaceChildren();

    try {
      const data = await auroraDictionary.lookup(value, { limit: 12 });
      if (!data.ok) {
        status.textContent = data.reason;
        return;
      }
      renderLookup(data);
    } catch (error) {
      status.textContent = "The dictionary source could not be reached and no cached copy of this letter is available yet.";
      console.warn("Aurora dictionary lookup failed", error);
    }
  }

  button.addEventListener("click", openDictionary);
  close.addEventListener("click", closeDictionary);
  form.addEventListener("submit", event => {
    event.preventDefault();
    lookup();
  });
  drawer.addEventListener("click", event => {
    if (event.target === drawer) closeDictionary();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !drawer.hidden) closeDictionary();
  });

  const params = new URLSearchParams(location.search);
  if (params.get("tool") === "dictionary") openDictionary();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountDictionary, { once: true });
  } else {
    mountDictionary();
  }
}

export { mountDictionary };
