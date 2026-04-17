const STORAGE_KEY = "historia_board_state_pages_pkg_v13";

const FIGURES = [{"id": "venizelos", "name": "Ελευθ. Βενιζέλος", "era": "Ελλάδα/Μεσοπόλεμος", "color": "#0ea5e9"}, {"id": "bismarck", "name": "Όττο φον Μπίσμαρκ", "era": "19ος αι.", "color": "#22c55e"}, {"id": "wilson", "name": "Γούντροου Ουίλσον", "era": "Α΄ ΠΠ", "color": "#8b5cf6"}, {"id": "roosevelt", "name": "Φρ. Ντ. Ρούζβελτ", "era": "Β΄ ΠΠ", "color": "#f97316"}, {"id": "mussolini", "name": "Μπενίτο Μουσολίνι", "era": "Μεσοπόλεμος", "color": "#ec4899"}, {"id": "gorbachev", "name": "Μιχαήλ Γκορμπατσόφ", "era": "Τέλος Ψυχρού Πολέμου", "color": "#94a3b8"}];
const CHAPTER_IMG = {"A": "assets/chapter_A.jpg", "B": "assets/chapter_B.jpg", "C": "assets/chapter_C.jpg", "Δ": "assets/chapter_D.jpg", "Ε": "assets/chapter_E.jpg", "ΣΤ": "assets/chapter_ST.jpg", "Ζ": "assets/chapter_Z.jpg"};
const LEGACY_CHAPTER_IMG = {"Δ": "assets/chapter_Δ.jpg", "Ε": "assets/chapter_Ε.jpg", "ΣΤ": "assets/chapter_ΣΤ.jpg", "Ζ": "assets/chapter_Ζ.jpg"};
const CHAPTER_LABEL = {"A": "Κεφάλαιο Α΄", "B": "Κεφάλαιο Β΄", "C": "Κεφάλαιο Γ΄", "Δ": "Κεφάλαιο Δ΄", "Ε": "Κεφάλαιο Ε΄", "ΣΤ": "Κεφάλαιο ΣΤ΄", "Ζ": "Κεφάλαιο Ζ΄"};
const CHAPTER_COLOR = {"A": "#0ea5e9", "B": "#22c55e", "C": "#8b5cf6", "Δ": "#c79a2b", "Ε": "#f97316", "ΣΤ": "#64748b", "Ζ": "#0f766e"};
const PREFIX_MAP = {"A": "A", "Α": "A", "B": "B", "Β": "B", "C": "C", "Γ": "C", "Δ": "Δ", "D": "Δ", "E": "Ε", "Ε": "Ε", "ΣΤ": "ΣΤ", "ST": "ΣΤ", "ΣT": "ΣΤ", "Ζ": "Ζ", "Z": "Ζ"};
const CANONICAL_CHAPTER_ORDER = ["A", "B", "C", "Δ", "Ε", "ΣΤ", "Ζ"];

const SQUARES = Array.from({length: 40}, (_, i) => {
  if (i === 0) return {i, kind:"start", label:"START"};

  const chapter =
      (i>=1 && i<=5) ? "A" :
      (i>=6 && i<=10) ? "B" :
      (i>=11 && i<=15) ? "C" :
      (i>=16 && i<=20) ? "Δ" :
      (i>=21 && i<=25) ? "Ε" :
      (i>=26 && i<=30) ? "ΣΤ" :
      (i>=31 && i<=35) ? "Ζ" :
      null;

  const kind = (i % 2 === 0) ? "event" : "question";
  if (!chapter) {
    return { i, kind, chapter: null, label: "Μικτή επανάληψη" };
  }

  const label = (kind === "question") ? `Ερώτηση (${chapter})` : `Γεγονός (${chapter})`;
  return {i, kind, chapter, label};
});

let CARDS = [];
let state = {
  players: [],
  turn: 0,
  die: null,
  rolled: false,
  usedCards: [],
  mixedCursor: 0,
  pendingCard: null
};
let activeCardSession = null;

function byId(id) { return document.getElementById(id); }

function cleanText(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ")
    .split("\n")
    .map(line => line.trim().replace(/\s+/g, " "))
    .join("\n")
    .trim();
}

function normalizePrefix(value) {
  const key = cleanText(value);
  return PREFIX_MAP[key] || key;
}

function normalizeCard(card) {
  const normalized = {...card};
  normalized.prefix = normalizePrefix(normalized.prefix);
  normalized.page = Number(normalized.page);
  normalized.q = cleanText(normalized.q);
  normalized.a = cleanText(normalized.a);
  return normalized;
}

function getAvailableChapters() {
  const seen = new Set();
  for (const card of CARDS) {
    const prefix = normalizePrefix(card.prefix);
    if (CHAPTER_LABEL[prefix]) seen.add(prefix);
  }
  return CANONICAL_CHAPTER_ORDER.filter(ch => seen.has(ch));
}

function getChapterCounts() {
  const counts = {};
  for (const card of CARDS) {
    const prefix = normalizePrefix(card.prefix);
    counts[prefix] = (counts[prefix] || 0) + 1;
  }
  return counts;
}

function populateChapterFilter() {
  const select = byId("chapterFilter");
  const previous = select.value || "ALL";
  const counts = getChapterCounts();
  const available = getAvailableChapters();

  select.innerHTML = "";

  const allOpt = document.createElement("option");
  allOpt.value = "ALL";
  allOpt.textContent = "Όλα";
  select.appendChild(allOpt);

  for (const chapter of available) {
    const opt = document.createElement("option");
    opt.value = chapter;
    opt.textContent = `${CHAPTER_LABEL[chapter]} (${counts[chapter] || 0})`;
    select.appendChild(opt);
  }

  select.value = available.includes(previous) || previous === "ALL" ? previous : "ALL";
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    state = JSON.parse(raw);
    if (!Array.isArray(state.usedCards)) state.usedCards = [];
    if (!Number.isInteger(state.mixedCursor)) state.mixedCursor = 0;
    if (!state.pendingCard || typeof state.pendingCard !== "object") state.pendingCard = null;
    return true;
  } catch (e) {
    return false;
  }
}

function log(msg) {
  const el = byId("log");
  const div = document.createElement("div");
  div.className = "logItem";
  div.innerHTML = msg;
  el.prepend(div);
}

function buildBoard() {
  const board = byId("board");
  board.innerHTML = "";
  for (const s of SQUARES) {
    const d = document.createElement("div");
    d.className = "sq " + (s.kind || "");
    if (s.kind === "start") d.classList.add("start");
    d.innerHTML = `
      <div class="n">#${s.i}</div>
      <div class="tag">${s.label}</div>
      <div class="tokens" id="tokens-${s.i}"></div>
    `;
    board.appendChild(d);
  }
}

function renderTokens() {
  for (let i=0;i<SQUARES.length;i++) {
    const wrap = byId(`tokens-${i}`);
    if (wrap) wrap.innerHTML = "";
  }
  state.players.forEach((p) => {
    const wrap = byId(`tokens-${p.pos}`);
    if (!wrap) return;
    const t = document.createElement("div");
    t.className = "token";
    t.style.background = p.color;
    t.textContent = p.short;
    t.title = `${p.name} (πόντοι: ${p.score})`;
    wrap.appendChild(t);
  });
}

function renderPlayers() {
  const box = byId("players");
  box.innerHTML = "";
  state.players.forEach((p, idx) => {
    const div = document.createElement("div");
    div.className = "player" + (idx === state.turn ? " active" : "");
    div.innerHTML = `
      <div class="avatar" style="background:${p.color}">${p.short}</div>
      <div>
        <div class="name">${p.name}</div>
        <div class="era">${p.era}</div>
      </div>
      <div class="score">
        <div><b>${p.score}</b> πόντοι</div>
        <div class="muted">θέση #${p.pos}</div>
      </div>
    `;
    box.appendChild(div);
  });
}

function getExplicitFiltersPool() {
  let pool = CARDS.slice();
  const chapterFilterRaw = byId("chapterFilter").value;
  const typeFilter = byId("typeFilter").value;

  if (chapterFilterRaw !== "ALL") {
    const chapterFilter = normalizePrefix(chapterFilterRaw);
    pool = pool.filter(c => c.prefix === chapterFilter);
  }
  if (typeFilter !== "ALL") {
    pool = pool.filter(c => c.type === typeFilter);
  }
  return pool;
}

function getCounterPool() {
  const chapterFilterRaw = byId("chapterFilter").value;
  const typeFilter = byId("typeFilter").value;
  if (chapterFilterRaw !== "ALL" || typeFilter !== "ALL") {
    return getExplicitFiltersPool();
  }
  return CARDS;
}

function getAvailableChaptersForCurrentType() {
  let pool = CARDS.slice();
  const typeFilter = byId("typeFilter").value;
  if (typeFilter !== "ALL") {
    pool = pool.filter(c => c.type === typeFilter);
  }
  const seen = new Set(pool.map(c => normalizePrefix(c.prefix)).filter(Boolean));
  return CANONICAL_CHAPTER_ORDER.filter(ch => seen.has(ch));
}

function pickFromPool(pool) {
  if (!pool.length) return null;
  const used = new Set(state.usedCards || []);
  const unused = pool.filter(c => !used.has(c.code));
  const chosenPool = unused.length ? unused : pool;
  const chosen = chosenPool[Math.floor(Math.random() * chosenPool.length)];
  if (!chosen) return null;

  state.usedCards = state.usedCards || [];
  if (!state.usedCards.includes(chosen.code)) {
    state.usedCards.push(chosen.code);
    const maxUsed = Math.max(CARDS.length, 200);
    if (state.usedCards.length > maxUsed) {
      state.usedCards = state.usedCards.slice(-maxUsed);
    }
  }
  save();
  return chosen;
}

function pickBalancedMixedCard() {
  const chapterFilterRaw = byId("chapterFilter").value;
  if (chapterFilterRaw !== "ALL") return null;

  let pool = CARDS.slice();
  const typeFilter = byId("typeFilter").value;
  if (typeFilter !== "ALL") {
    pool = pool.filter(c => c.type === typeFilter);
  }
  const chapters = getAvailableChaptersForCurrentType();
  if (!chapters.length) return pickFromPool(pool);

  const start = Number.isInteger(state.mixedCursor) ? state.mixedCursor : 0;
  for (let step = 0; step < chapters.length; step++) {
    const idx = (start + step) % chapters.length;
    const chapter = chapters[idx];
    const chapterPool = pool.filter(c => normalizePrefix(c.prefix) === chapter);
    if (chapterPool.length) {
      state.mixedCursor = (idx + 1) % chapters.length;
      return pickFromPool(chapterPool);
    }
  }
  return pickFromPool(pool);
}

function getPickPool(squareChapter) {
  let pool = CARDS.slice();
  const chapterFilterRaw = byId("chapterFilter").value;
  const typeFilter = byId("typeFilter").value;
  const mode = byId("mode").value;

  if (chapterFilterRaw !== "ALL") {
    const chapterFilter = normalizePrefix(chapterFilterRaw);
    pool = pool.filter(c => c.prefix === chapterFilter);
  } else if (mode === "bySquare" && squareChapter) {
    pool = pool.filter(c => c.prefix === normalizePrefix(squareChapter));
  }

  if (typeFilter !== "ALL") {
    pool = pool.filter(c => c.type === typeFilter);
  }

  return pool;
}

function setTurnUI() {
  const p = state.players[state.turn];
  const counterPool = getCounterPool();
  const usedSet = new Set(state.usedCards || []);
  const usedCount = counterPool.filter(card => usedSet.has(card.code)).length;
  const pendingUnresolved = !!(state.pendingCard && !state.pendingCard.resolved);

  byId("turnPill").textContent = p ? `Σειρά: ${p.name}` : "Σειρά: —";
  byId("dieValue").textContent = state.die ?? "—";
  byId("usedCount").textContent = String(usedCount);
  byId("totalCount").textContent = String(counterPool.length || 0);

  byId("roll").disabled = !p || state.rolled || !CARDS.length || !counterPool.length;
  byId("endTurn").disabled = !p || !state.rolled || pendingUnresolved;
  renderPlayers();
}

function newGame() {
  const count = parseInt(byId("playersCount").value, 10);
  const shortMap = {
    "Βενιζέλος":"Β","Μπίσμαρκ":"Μπ","Ουίλσον":"Ο","Ρούζβελτ":"Ρ","Μουσολίνι":"Μ","Γκορμπατσόφ":"Γ"
  };
  state.players = FIGURES.slice(0, count).map((f) => {
    const last = f.name.split(" ").slice(-1)[0];
    const short = (shortMap[last] || last.substring(0,2)).substring(0,2);
    return { id:f.id, name:f.name, era:f.era, color:f.color, short, pos:0, score:0 };
  });
  state.turn = 0;
  state.die = null;
  state.rolled = false;
  state.usedCards = [];
  state.mixedCursor = 0;
  state.pendingCard = null;
  activeCardSession = null;
  save();
  renderTokens();
  renderPlayers();
  setTurnUI();
  log(`<span class="muted">Νέο παιχνίδι:</span> ${count} παίκτες.`);
}

function resetPositions() {
  state.players.forEach(p => { p.pos = 0; p.score = 0; });
  state.turn = 0;
  state.die = null;
  state.rolled = false;
  state.usedCards = [];
  state.mixedCursor = 0;
  state.pendingCard = null;
  activeCardSession = null;
  save();
  renderTokens();
  renderPlayers();
  setTurnUI();
  log(`<span class="muted">Reset:</span> όλοι στο START (πόντοι 0).`);
}

function endTurn() {
  if (!state.players.length) return;
  if (state.pendingCard && !state.pendingCard.resolved) return;

  state.pendingCard = null;
  activeCardSession = null;
  if (byId("cardDialog").open) byId("cardDialog").close();

  state.turn = (state.turn + 1) % state.players.length;
  state.rolled = false;
  state.die = null;
  save();
  setTurnUI();
}

function pickCard(squareChapter) {
  const chapterFilterRaw = byId("chapterFilter").value;
  const mode = byId("mode").value;
  if (chapterFilterRaw === "ALL" && mode === "bySquare" && !squareChapter) {
    return pickBalancedMixedCard();
  }
  const pool = getPickPool(squareChapter);
  return pickFromPool(pool);
}

function findCardByCode(code) {
  return CARDS.find(card => card.code === code) || null;
}

function setCardImage(prefix) {
  const img = byId("cardImg");
  if (!img) return;

  const primary = CHAPTER_IMG[prefix] || "";
  const legacy = LEGACY_CHAPTER_IMG[prefix] || "";

  img.alt = CHAPTER_LABEL[prefix] ? `Εικόνα ${CHAPTER_LABEL[prefix]}` : "Εικόνα κεφαλαίου";
  img.onerror = null;

  if (!primary) {
    img.removeAttribute("src");
    return;
  }

  if (legacy && legacy !== primary) {
    let triedLegacy = false;
    img.onerror = () => {
      if (!triedLegacy) {
        triedLegacy = true;
        img.src = encodeURI(legacy);
      } else {
        img.onerror = null;
        img.removeAttribute("src");
      }
    };
  } else {
    img.onerror = () => {
      img.onerror = null;
      img.removeAttribute("src");
    };
  }

  img.src = encodeURI(primary);
}

function renderPendingCard(card) {
  const dlg = byId("cardDialog");
  const prefix = normalizePrefix(card.prefix);
  const reviewMode = !!state.pendingCard?.reviewMode;
  const answerShown = !!state.pendingCard?.answerShown || !!state.pendingCard?.resolved;
  const resolved = !!state.pendingCard?.resolved;

  activeCardSession = { code: card.code, scored: resolved };

  setCardImage(prefix);
  byId("badgeText").textContent = reviewMode
    ? `Μικτή επανάληψη · ${card.type} · ${CHAPTER_LABEL[prefix] || prefix}`
    : `${card.type} · ${CHAPTER_LABEL[prefix] || prefix}`;
  byId("badgeDot").style.background = CHAPTER_COLOR[prefix] || "#0ea5e9";
  byId("cardPage").textContent = card.page || "—";

  byId("cardTitle").textContent = card.code;
  byId("cardMeta").textContent = reviewMode
    ? `Μικτή επανάληψη → ${CHAPTER_LABEL[prefix] || prefix} · σελ. ${card.page} · ${card.type}`
    : `${CHAPTER_LABEL[prefix] || prefix} · σελ. ${card.page} · ${state.pendingCard?.squareKind || "Κάρτα"}`;
  byId("cardQ").textContent = card.q;
  byId("cardAText").textContent = card.a;

  const aWrap = byId("cardA");
  aWrap.classList.toggle("show", answerShown);

  byId("showAnswer").disabled = answerShown || resolved;
  byId("showAnswer").textContent = resolved
    ? "Η κάρτα βαθμολογήθηκε"
    : (answerShown ? "Η απάντηση εμφανίστηκε" : "Δείξε απάντηση");
  byId("markCorrect").disabled = !(answerShown && !resolved);
  byId("markWrong").disabled = !(answerShown && !resolved);
  byId("closeCard").disabled = !resolved;

  if (!dlg.open) dlg.showModal();
}

function reopenPendingCardIfNeeded() {
  if (!state.pendingCard || !state.pendingCard.code || state.pendingCard.resolved) return;
  const card = findCardByCode(state.pendingCard.code);
  if (!card) {
    state.pendingCard = null;
    save();
    return;
  }
  renderPendingCard(card);
}

function beginPendingCard(card, chapter, squareKind) {
  state.pendingCard = {
    code: card.code,
    chapter: chapter || null,
    squareKind,
    reviewMode: !chapter,
    answerShown: false,
    resolved: false
  };
  save();
  renderPendingCard(card);
  setTurnUI();
}

function openCard(chapter, squareKind) {
  const card = pickCard(chapter);
  if (!card) {
    const typeLabel = byId("typeFilter").value === "ALL" ? "όλων των τύπων" : byId("typeFilter").value;
    const chapterLabel = byId("chapterFilter").value === "ALL"
      ? (chapter ? (CHAPTER_LABEL[normalizePrefix(chapter)] || normalizePrefix(chapter)) : "μικτή επανάληψη")
      : (CHAPTER_LABEL[normalizePrefix(byId("chapterFilter").value)] || normalizePrefix(byId("chapterFilter").value));
    log(`<span class="muted">Δεν βρέθηκαν κάρτες:</span> ${chapterLabel} · ${typeLabel}.`);
    state.pendingCard = null;
    save();
    setTurnUI();
    return;
  }

  beginPendingCard(card, chapter, squareKind);
}

function enableMarking() {
  if (!state.pendingCard || state.pendingCard.resolved) return;
  byId("markCorrect").disabled = false;
  byId("markWrong").disabled = false;
}

function applyResult(isCorrect) {
  const p = state.players[state.turn];
  if (!p || !state.pendingCard || state.pendingCard.resolved) return;

  if (isCorrect) {
    p.score += 1;
    log(`<b>${p.name}</b>: <span style="color:var(--good); font-weight:900;">Σωστό</span> (+1).`);
  } else {
    p.score = Math.max(0, p.score - 1);
    log(`<b>${p.name}</b>: <span style="color:var(--bad); font-weight:900;">Λάθος</span> (-1).`);
  }

  state.pendingCard.resolved = true;
  if (activeCardSession) activeCardSession.scored = true;

  save();
  renderPlayers();
  setTurnUI();

  const card = findCardByCode(state.pendingCard.code);
  if (card) renderPendingCard(card);
}

function closeCardView() {
  if (state.pendingCard && !state.pendingCard.resolved) {
    log(`<span class="muted">Η κάρτα παραμένει ανοιχτή:</span> πρέπει πρώτα να εμφανιστεί η απάντηση και να καταχωριστεί «Σωστό» ή «Λάθος».`);
    return;
  }
  activeCardSession = null;
  if (byId("cardDialog").open) byId("cardDialog").close();
}

function rollDie() {
  if (!state.players.length) return;
  const die = Math.floor(Math.random()*6) + 1;
  state.die = die;
  state.rolled = true;

  const p = state.players[state.turn];
  const from = p.pos;
  p.pos = (p.pos + die) % SQUARES.length;

  save();
  renderTokens();
  setTurnUI();

  const sq = SQUARES[p.pos];
  const sqLabel = sq.chapter ? (CHAPTER_LABEL[sq.chapter] || sq.chapter) : "Μικτή επανάληψη";
  log(`<b>${p.name}</b> έριξε <b>${die}</b> και πήγε από #${from} → #${p.pos} (${sqLabel}).`);

  if (sq.kind === "question") openCard(sq.chapter, sq.chapter ? "Ερώτηση" : "Μικτή επανάληψη");
  if (sq.kind === "event") openCard(sq.chapter, sq.chapter ? "Γεγονός" : "Μικτή επανάληψη");
}

byId("showAnswer").addEventListener("click", () => {
  if (!state.pendingCard || state.pendingCard.resolved) return;
  state.pendingCard.answerShown = true;
  save();
  byId("cardA").classList.add("show");
  byId("showAnswer").disabled = true;
  byId("showAnswer").textContent = "Η απάντηση εμφανίστηκε";
  enableMarking();
  setTurnUI();
});
byId("cardDialog").addEventListener("cancel", (event) => {
  if (state.pendingCard && !state.pendingCard.resolved) {
    event.preventDefault();
  }
});
byId("closeCard").addEventListener("click", closeCardView);
byId("markCorrect").addEventListener("click", () => applyResult(true));
byId("markWrong").addEventListener("click", () => applyResult(false));

byId("newGame").addEventListener("click", newGame);
byId("resetPos").addEventListener("click", resetPositions);
byId("roll").addEventListener("click", rollDie);
byId("endTurn").addEventListener("click", endTurn);
byId("chapterFilter").addEventListener("change", setTurnUI);
byId("typeFilter").addEventListener("change", setTurnUI);
byId("mode").addEventListener("change", setTurnUI);

(async function init() {
  buildBoard();
  load();
  try {
    const res = await fetch("./cards.json", { cache: "no-store" });
    const raw = await res.json();
    CARDS = Array.isArray(raw) ? raw.map(normalizeCard).filter(c => c.code && c.q && c.a) : [];
  } catch (e) {
    CARDS = [];
    log(`<span class="muted">Σφάλμα:</span> δεν φόρτωσαν οι κάρτες. Βεβαιώσου ότι υπάρχει το αρχείο <b>cards.json</b>.`);
  }

  populateChapterFilter();

  if (!state.players || !state.players.length) {
    newGame();
  }
  renderTokens();
  renderPlayers();
  setTurnUI();
  reopenPendingCardIfNeeded();
})();