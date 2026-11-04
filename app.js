(() => {
  // ================= constants =================
  const PLAT = {
    lc:   { name: "LeetCode",   short: "LC",   diffLabel: "Difficulty", diffs: ["Easy","Medium","Hard"] },
    cf:   { name: "Codeforces", short: "CF",   diffLabel: "Rating", diffs: Array.from({length: 28}, (_, i) => String(800 + i * 100)) },
    cses: { name: "CSES",       short: "CSES", diffLabel: "Section", diffs: ["Introductory Problems","Sorting and Searching","Dynamic Programming","Graph Algorithms","Range Queries","Tree Algorithms","Mathematics","String Algorithms","Geometry","Advanced Techniques","Sliding Window Problems","Interactive Problems","Bitwise Operations","Construction Problems","Advanced Graph Problems","Counting Problems","Additional Problems I","Additional Problems II"] },
    qt:   { name: "Quant",      short: "Q",    diffLabel: "Difficulty", diffs: ["Easy","Medium","Hard"] }
  };
  const VERDICT = { solo: "solved alone", hint: "solved with a hint", editorial: "solved with the editorial" };
  const LANGS = [["python","Python3"],["cpp","C++"],["java","Java"],["javascript","JavaScript"],["typescript","TypeScript"],["go","Go"],["rust","Rust"],["c","C"],["kotlin","Kotlin"],["plaintext","Plain text"]];
  const ROADMAP = [
    ["Arrays & Hashing", ["arrays & hashing","array","arrays","hash table","hashing","hash map","hashmap","prefix sum"], "hash-table"],
    ["Two Pointers", ["two pointers","two pointer"], "two-pointers"],
    ["Stack", ["stack","monotonic stack"], "stack"],
    ["Binary Search", ["binary search"], "binary-search"],
    ["Sliding Window", ["sliding window"], "sliding-window"],
    ["Linked List", ["linked list"], "linked-list"],
    ["Trees", ["trees","tree","binary tree","bst","binary search tree"], "tree"],
    ["Tries", ["tries","trie"], "trie"],
    ["Heap / Priority Queue", ["heap / priority queue","heap","priority queue"], "heap-priority-queue"],
    ["Backtracking", ["backtracking"], "backtracking"],
    ["Graphs", ["graphs","graph","bfs","dfs","union-find","union find","topological sort"], "graph"],
    ["Intervals", ["intervals","interval","line sweep","sweep line"], "line-sweep"],
    ["Greedy", ["greedy"], "greedy"],
    ["1-D DP", ["1-d dp","1d dp","dp","dynamic programming"], "dynamic-programming"],
    ["Advanced Graphs", ["advanced graphs","shortest path","dijkstra","minimum spanning tree","mst"], "shortest-path"],
    ["2-D DP", ["2-d dp","2d dp","grid dp","interval dp"], "dynamic-programming"],
    ["Bit Manipulation", ["bit manipulation","bitmask","bits"], "bit-manipulation"],
    ["Math & Geometry", ["math & geometry","math","geometry","matrix","number theory"], "math"]
  ];
  const QUANT_CATS = [["Expected Value",["expected value","ev","expectation"]],["Conditional Probability",["conditional probability","bayes"]],["Combinatorics",["combinatorics","counting"]],["Brainteasers",["brainteasers","brainteaser","puzzle"]],["Markov Chains",["markov chains","markov chain"]],["Statistics",["statistics","stats"]],["Mental Math",["mental math","arithmetic"]]];
  const SUGGESTED_TAGS = ROADMAP.map(r => r[0]).concat(["Monotonic Stack","Union-Find","Topological Sort","Prefix Sum","Dynamic Programming","Segment Tree","Number Theory","Combinatorics","Probability","Expected Value","Conditional Probability","Markov Chains","Brainteasers","Statistics","Mental Math","Game Theory"]);
  const PAGE = 20;
  const $ = (id) => document.getElementById(id);

  // ================= state =================
  let items = [];
  let probCol = null, pageCol = null, assets = null;
  let canWrite = true, loaded = false, listPage = 0, editingId = null, pendingDelete = null;

  // ================= helpers =================
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  const safeUrl = (u) => /^https?:\/\//i.test(u || "") ? u : "";
  const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (t) => t.getFullYear() + "-" + pad(t.getMonth() + 1) + "-" + pad(t.getDate());
  const today = () => ymd(new Date());
  function addDays(ds, n) { const [y, m, d] = (ds || today()).split("-").map(Number); return ymd(new Date(y, m - 1, d + n)); }
  function daysBetween(a, b) { const p = (s) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); }; return Math.round((p(b) - p(a)) / 86400000); }
  function fmtDate(d, withYear) {
    if (!d) return ""; const [y, m, dd] = d.split("-").map(Number); if (!y) return "";
    const o = { month: "short", day: "numeric" }; if (withYear || y !== new Date().getFullYear()) o.year = "numeric";
    return new Date(y, m - 1, dd).toLocaleDateString(undefined, o);
  }
  const letter = (i) => String.fromCharCode(97 + (i % 26));
  const verdictOf = (it) => it.status === "wip" ? "editorial" : (it.status || "solo");
  function probLabel(it) { return it.num ? (it.platform === "qt" && /^\d+$/.test(it.num) ? "Q" + it.num : it.num) : ""; }
  function showNotice(msg) { const n = $("notice"); n.textContent = msg || ""; n.hidden = !msg; }
  let toastTimer = null;
  function toast(msg, actionLabel, action) {
    document.querySelectorAll(".toast").forEach(t => t.remove());
    const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status");
    t.innerHTML = `<span>${esc(msg)}</span>${actionLabel ? `<button type="button">${esc(actionLabel)}</button>` : ""}`;
    if (actionLabel) t.querySelector("button").onclick = () => { action(); t.remove(); };
    document.body.appendChild(t); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.remove(), 5000);
  }
  function typeset(el) {
    const mj = window.MathJax;
    if (mj && mj.typesetPromise) { try { mj.typesetClear && mj.typesetClear([el]); } catch (e) {} mj.typesetPromise([el]).catch(() => {}); }
    else setTimeout(() => { if (window.MathJax && window.MathJax.typesetPromise && document.contains(el)) typeset(el); }, 700);
  }
  function renderTex(el, tex) {
    tex = (tex || "").trim();
    if (!tex) { el.innerHTML = `<span class="hint">Write LaTeX above; it renders here.</span>`; return; }
    const mj = window.MathJax;
    if (mj && mj.tex2svgPromise) mj.tex2svgPromise(tex, { display: true }).then(n => { el.innerHTML = ""; el.appendChild(n); }).catch(() => { el.textContent = tex; });
    else { el.textContent = tex; setTimeout(() => { if (document.contains(el) && window.MathJax && window.MathJax.tex2svgPromise) renderTex(el, tex); }, 800); }
  }
  // Keep only simple inline formatting from stored rich text.
  function cleanInline(html) {
    const t = document.createElement("template"); t.innerHTML = String(html || "");
    const ok = new Set(["B","STRONG","I","EM","U","S","CODE","A","BR","MARK","SUB","SUP"]);
    const walk = (node) => {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 1) {
          walk(ch);
          if (!ok.has(ch.tagName)) { ch.replaceWith(...ch.childNodes); return; }
          [...ch.attributes].forEach(a => { if (!(ch.tagName === "A" && a.name === "href") && !(a.name === "class" && ch.tagName === "CODE")) ch.removeAttribute(a.name); });
          if (ch.tagName === "A") { if (!safeUrl(ch.getAttribute("href"))) ch.removeAttribute("href"); ch.setAttribute("target", "_blank"); ch.setAttribute("rel", "noopener"); }
        } else if (ch.nodeType !== 3) ch.remove();
      });
    };
    walk(t.content);
    const d = document.createElement("div"); d.appendChild(t.content); return d.innerHTML;
  }
  function hl(code, lang) {
    try { if (window.hljs && lang && lang !== "plaintext") return window.hljs.highlight(code, { language: lang, ignoreIllegals: true }).value; } catch (e) {}
    return esc(code);
  }

  // ================= spaced repetition =================
  const FIRST_GAP = { solo: 3, hint: 1, editorial: 1 };
  function initSrs(status, solvedAt) {
    const gap = FIRST_GAP[status] ?? 1;
    return { interval: gap, ease: 2.5, reps: 0, lapses: 0, due: addDays(solvedAt || today(), gap), mastered: false, history: [] };
  }
  function srsOf(it) {
    if (it.due) return { interval: it.interval || 1, ease: it.ease || 2.5, reps: it.reps || 0, lapses: it.lapses || 0, due: it.due, mastered: !!it.mastered, history: it.history || [] };
    return initSrs(verdictOf(it), it.solvedAt);
  }
  function nextGap(s, r) {
    const iv = s.interval || 1, ease = s.ease || 2.5;
    const good = iv <= 1 ? 3 : Math.max(iv + 1, Math.round(iv * ease));
    if (r === "again") return 1;
    if (r === "hard") return Math.max(1, Math.round(iv * 1.2));
    if (r === "good") return good;
    return Math.max(good + 2, iv <= 1 ? 7 : Math.round(iv * ease * 1.3));
  }
  function schedule(s, r) {
    let ease = s.ease || 2.5, lapses = s.lapses || 0;
    const interval = nextGap(s, r);
    if (r === "again") { ease -= 0.2; lapses++; } else if (r === "hard") ease -= 0.15; else if (r === "easy") ease += 0.15;
    ease = Math.round(Math.min(3.5, Math.max(1.3, ease)) * 100) / 100;
    const history = (s.history || []).concat([{ d: today(), r }]).slice(-20);
    return { interval, ease, reps: (s.reps || 0) + 1, lapses, due: addDays(today(), interval), mastered: interval >= 60, history, revisit: false };
  }
  const isDue = (it) => !!it.revisit || (!srsOf(it).mastered && srsOf(it).due <= today());

  // ---- "Reviewed today?" — log a review outside the schedule ----
  const rtOpen = new Set(); // problems whose rating picker is showing
  function reviewedToday(it) { const h = srsOf(it).history; return h.length > 0 && h[h.length - 1].d === today(); }
  function reviewedTodayHTML(it) {
    const done = reviewedToday(it);
    if (!canWrite && !done) return "";
    const box = `<label class="check rtoday"><input type="checkbox" data-rt="${esc(it.id)}" ${done || rtOpen.has(it.id) ? "checked" : ""} ${canWrite ? "" : "disabled"}> Reviewed today?</label>`;
    if (!rtOpen.has(it.id) || done) return box;
    const s = srsOf(it);
    return box + `<span class="rtpick">How well did you remember it? ${["again","hard","good","easy"].map(r =>
      `<button type="button" class="link rtrate ${r}" data-rtrate="${r}" data-id="${esc(it.id)}">${r[0].toUpperCase() + r.slice(1)}</button> <small>${nextGap(s, r)}d</small>`).join(" ")} <button type="button" class="link muted" data-rtcancel="${esc(it.id)}">Cancel</button></span>`;
  }
  async function logReview(id, r) {
    const it = items.find(x => x.id === id); if (!it || !probCol) return;
    const s = srsOf(it);
    const patch = schedule(s, r);
    patch.preReview = { interval: s.interval, ease: s.ease, reps: s.reps, lapses: s.lapses, due: s.due, mastered: s.mastered, history: s.history, revisit: !!it.revisit, on: today() };
    rtOpen.delete(id);
    try { await probCol.doc(id).update(patch); toast(`Review logged. Next one in ${patch.interval} day${patch.interval === 1 ? "" : "s"}.`); }
    catch (err) { handleWriteError(err); refreshReviewedToday(); }
  }
  async function undoReview(id) {
    const it = items.find(x => x.id === id); if (!it || !probCol) return;
    const p = it.preReview;
    if (!p || p.on !== today()) { toast("Only a review you logged today can be undone here."); refreshReviewedToday(); return; }
    const { on, ...prev } = p;
    try { await probCol.doc(id).update(Object.assign(prev, { preReview: firebase.firestore.FieldValue.delete() })); toast("Today's review removed."); }
    catch (err) { handleWriteError(err); refreshReviewedToday(); }
  }
  function refreshReviewedToday() { if (!$("listView").hidden) renderList(); if (P.id && $("pHead")) { const it = items.find(x => x.id === P.id); if (it) { $("pHead").innerHTML = pageHeadHTML(it); typeset($("pHead")); } } }
  document.addEventListener("change", (e) => {
    const box = e.target.closest("input[data-rt]"); if (!box) return;
    const id = box.dataset.rt, it = items.find(x => x.id === id); if (!it) return;
    if (!canWrite) { box.checked = reviewedToday(it); toast("Sign in as the owner to record reviews."); return; }
    if (box.checked) { rtOpen.add(id); refreshReviewedToday(); }
    else if (rtOpen.has(id)) { rtOpen.delete(id); refreshReviewedToday(); }
    else undoReview(id);
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rtrate]");
    if (b) { e.preventDefault(); logReview(b.dataset.id, b.dataset.rtrate); return; }
    const c = e.target.closest("[data-rtcancel]");
    if (c) { e.preventDefault(); rtOpen.delete(c.dataset.rtcancel); refreshReviewedToday(); }
  });
  const RQ = { again: 0, hard: 0.5, good: 0.9, easy: 1 };
  const VQ = { solo: 0.85, hint: 0.45, editorial: 0.2 };
  function quality(it) { const h = srsOf(it).history; return h.length ? RQ[h[h.length - 1].r] : (VQ[verdictOf(it)] ?? 0.5); }
  function risk(it) { const s = srsOf(it); const late = Math.max(0, daysBetween(s.due, today())); return (late + 1) / Math.max(1, s.interval) + (1 - quality(it)); }

  // ================= next topics =================
  function nextTopics() {
    const out = [];
    const tagsOf = (plat) => { const set = new Set(); items.filter(it => it.platform === plat).forEach(it => (it.tags || []).forEach(t => set.add(t.toLowerCase().trim()))); return set; };
    if (items.some(it => it.platform === "lc")) {
      const seen = tagsOf("lc");
      const r = ROADMAP.find(([, al]) => !al.some(a => seen.has(a)));
      if (r) out.push({ label: r[0], href: "https://leetcode.com/problem-list/" + r[2] + "/", plat: "LeetCode" });
    }
    if (items.some(it => it.platform === "cses")) {
      const seen = new Set(items.filter(it => it.platform === "cses").map(it => it.difficulty));
      const s = PLAT.cses.diffs.find(d => !seen.has(d));
      if (s) out.push({ label: s, href: "https://cses.fi/problemset/", plat: "CSES" });
    }
    if (items.some(it => it.platform === "qt")) {
      const seen = tagsOf("qt");
      const c = QUANT_CATS.find(([, al]) => !al.some(a => seen.has(a)));
      if (c) out.push({ label: c[0], href: "", plat: "Quant" });
    }
    return out;
  }

  // ================= front page =================
  const FKEYS = ["fSearch","fPlat","fDiff","fTag","fSort","fGreat","fDue"];
  let savedTag = "";
  try {
    const o = JSON.parse(localStorage.getItem("solvelog-v3-filters") || "{}");
    FKEYS.forEach(k => { if (k in o) { const el = $(k); if (el.type === "checkbox") el.checked = !!o[k]; else el.value = o[k]; } });
    savedTag = o.fTag || "";
  } catch (e) {}
  function saveFilters() { try { const o = {}; FKEYS.forEach(k => { const el = $(k); o[k] = el.type === "checkbox" ? el.checked : el.value; }); localStorage.setItem("solvelog-v3-filters", JSON.stringify(o)); } catch (e) {} }
  function filtered() {
    const q = $("fSearch").value.trim().toLowerCase(), plat = $("fPlat").value, diff = $("fDiff").value, tag = $("fTag").value, sort = $("fSort").value;
    const out = items.filter(it => {
      if (plat && it.platform !== plat) return false;
      if ($("fGreat").checked && !it.great) return false;
      if ($("fDue").checked && !isDue(it)) return false;
      if (tag && !(it.tags || []).includes(tag)) return false;
      if (diff) { const [lo, hi] = diff.split("-").map(Number); const n = Number(it.norm); if (!n || n < lo || n > hi) return false; }
      if (q) { const hay = [it.title, it.num, it.summary, it.source, it.difficulty, (it.tags || []).join(" "), (it.methods || []).map(m => m.name).join(" ")].join(" ").toLowerCase(); if (!hay.includes(q)) return false; }
      return true;
    });
    const key = (it) => (it.solvedAt || "") + String(it.createdAt || 0).padStart(15, "0");
    const dkey = (it) => srsOf(it).mastered ? "9" : srsOf(it).due;
    out.sort((a, b) => {
      if (sort === "old") return key(a) < key(b) ? -1 : 1;
      if (sort === "due") return dkey(a) < dkey(b) ? -1 : dkey(a) > dkey(b) ? 1 : 0;
      if (sort === "hard") return (Number(b.norm) || 0) - (Number(a.norm) || 0);
      if (sort === "easy") return (Number(a.norm) || 99) - (Number(b.norm) || 99);
      return key(a) < key(b) ? 1 : -1;
    });
    return out;
  }
  function markHTML(it) {
    const s = srsOf(it);
    if (isDue(it)) return `<span class="mark due">review today</span>`;
    if (s.mastered) return `<span class="mark">mastered</span>`;
    return `<span class="mark">review ${esc(fmtDate(s.due))}</span>`;
  }
  const joinList = (arr) => arr.length < 2 ? arr.join("") : arr.slice(0, -1).join(", ") + (arr.length > 2 ? "," : "") + " and " + arr[arr.length - 1];
  function metaText(it) {
    const p = PLAT[it.platform] || PLAT.lc;
    const parts = [it.platform === "qt" ? "Quant" : p.name];
    if (it.difficulty) parts.push(it.difficulty);
    if (it.norm) parts.push(it.norm + "/10");
    if (it.platform === "qt" && it.source) parts.push(it.source);
    return parts.join(", ");
  }
  function rowHTML(it) {
    const methods = it.methods || [];
    const lab = probLabel(it);
    let h = `<li class="prob"><div class="pnum">${lab ? esc(lab) + "." : ""}</div><div class="pbody">
      <div class="pl1"><span><a class="pt" href="#p-${esc(it.id)}">${esc(it.title || "Untitled")}</a>${it.great ? `<span class="great">great</span>` : ""}${it.example ? ` <span class="paren">(example)</span>` : ""}</span>${markHTML(it)}</div>
      <p class="pm math"><i>${esc(metaText(it))}.</i>${it.summary ? " " + esc(it.summary) : ""}</p>`;
    const ms = methods.map((m, i) => `(${letter(i)}) <span class="mname">${esc(m.name || "Untitled")}</span>${m.best ? ` <span class="best">(best)</span>` : ""}`);
    const tags = (it.tags || []).map(t => `<button type="button" class="tag" data-tag="${esc(t)}">${esc(t)}</button>`);
    if (ms.length || tags.length) h += `<p class="meth">${ms.length ? ms.join("&ensp;") + (tags.length ? ".&ensp;" : ".") : ""}${tags.length ? `<i>Techniques:</i> ${joinList(tags)}.` : ""}</p>`;
    const rt = reviewedTodayHTML(it);
    if (rt) h += `<p class="rtrow">${rt}</p>`;
    return h + `</div></li>`;
  }
  function renderList() {
    const counts = { lc: 0, cf: 0, cses: 0, qt: 0 };
    items.forEach(it => { if (counts[it.platform] != null) counts[it.platform]++; });
    const total = items.length;
    const plats = Object.keys(PLAT).filter(k => counts[k]).map(k => `${counts[k]} ${k === "qt" ? "quant" : PLAT[k].name}`);
    $("tally").textContent = loaded ? `${total} problem${total === 1 ? "" : "s"}${plats.length ? ": " + joinList(plats) : ""}` : "";
    $("adds").hidden = !canWrite;

    const sel = $("fTag"); const cur = sel.value || savedTag;
    const tc = {}; items.forEach(it => (it.tags || []).forEach(t => tc[t] = (tc[t] || 0) + 1));
    const tags = Object.keys(tc).sort((a, b) => tc[b] - tc[a] || a.localeCompare(b));
    sel.innerHTML = `<option value="">all techniques</option>` + tags.map(t => `<option value="${esc(t)}">${esc(t)} (${tc[t]})</option>`).join("");
    if (cur && tc[cur]) sel.value = cur; savedTag = "";
    fitSelects();
    $("tagList").innerHTML = [...new Set(SUGGESTED_TAGS.concat(tags))].map(t => `<option value="${esc(t)}"></option>`).join("");

    if (!loaded) return;
    const due = items.filter(isDue).length;
    const topics = nextTopics();
    let ag = `<p><b>Due today.</b> ` + (due ? `<span class="due">${due} problem${due === 1 ? "" : "s"}.</span> <a href="#review">Start review</a>` : `None.`) + `</p>`;
    if (topics.length) {
      const tp = topics.map(t => `${t.href ? `<a href="${esc(t.href)}" target="_blank" rel="noopener">${esc(t.label)}</a>` : esc(t.label)} ${t.plat === "Quant" ? "in quant" : "on " + esc(t.plat)}`);
      ag += `<p><b>Next to try.</b> ${joinList(tp)}.</p>`;
    }
    $("agenda").innerHTML = ag;

    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / PAGE));
    if (listPage >= pages) listPage = pages - 1;
    const slice = list.slice(listPage * PAGE, listPage * PAGE + PAGE);
    const pl = $("plist");
    if (!items.length) pl.innerHTML = `<li class="empty"><h2>No problems yet</h2><p>Add one from LeetCode, Codeforces, CSES, or a quant source above. Paste the link and the title fills in.</p></li>`;
    else if (!list.length) pl.innerHTML = `<li class="empty"><h2>No matches</h2><p>Clear a filter or the search to see more problems.</p></li>`;
    else { pl.innerHTML = slice.map(rowHTML).join(""); typeset(pl); }
    $("pager").innerHTML = pages > 1
      ? `<button type="button" class="link" data-pg="prev" ${listPage === 0 ? "disabled" : ""}>Previous</button><span>${listPage + 1}</span><button type="button" class="link" data-pg="next" ${listPage >= pages - 1 ? "disabled" : ""}>Next</button>`
      : (list.length ? `<span>${listPage + 1}</span>` : "");
  }
  const sizer = document.createElement("span");
  sizer.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font:16px var(--f-serif)";
  document.body.appendChild(sizer);
  function fitSelects() {
    document.querySelectorAll(".filt select").forEach(sel => {
      const o = sel.options[sel.selectedIndex]; sizer.textContent = o ? o.text : "";
      sel.style.width = Math.ceil(sizer.getBoundingClientRect().width + 4) + "px";
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSelects);
  FKEYS.forEach(k => $(k).addEventListener(k === "fSearch" ? "input" : "change", () => { listPage = 0; saveFilters(); renderList(); }));
  $("pager").addEventListener("click", (e) => { const b = e.target.closest("[data-pg]"); if (!b) return; listPage += b.dataset.pg === "next" ? 1 : -1; renderList(); window.scrollTo({ top: 0 }); });
  $("plist").addEventListener("click", (e) => { const t = e.target.closest("[data-tag]"); if (t) { $("fTag").value = t.dataset.tag; listPage = 0; saveFilters(); renderList(); } });

  // ================= add / edit =================
  function fillDiff(plat, val) {
    const p = PLAT[plat];
    $("iDiffLabel").textContent = p.diffLabel;
    $("iDiff").innerHTML = `<option value="">Not set</option>` + p.diffs.map(d => `<option>${esc(d)}</option>`).join("");
    if (val && !p.diffs.includes(val)) $("iDiff").insertAdjacentHTML("beforeend", `<option>${esc(val)}</option>`);
    $("iDiff").value = val || "";
    $("srcField").hidden = plat !== "qt";
    $("iUrl").placeholder = { lc: "https://leetcode.com/problems/two-sum/", cf: "https://codeforces.com/problemset/problem/1899/C", cses: "https://cses.fi/problemset/task/1068", qt: "Optional" }[plat];
  }
  function titleFromSlug(slug) {
    const small = new Set(["a","an","and","of","the","in","on","to","for","with","by","or","at","from","into"]);
    return slug.split("-").filter(Boolean).map((w, i) => /^(i|ii|iii|iv|v)$/.test(w) ? w.toUpperCase() : (i && small.has(w)) ? w : w[0].toUpperCase() + w.slice(1)).join(" ");
  }
  function parseUrl(u) {
    let m;
    if ((m = u.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i))) return { platform: "lc", title: titleFromSlug(m[1].toLowerCase()) };
    if ((m = u.match(/codeforces\.com\/(?:problemset\/problem|contest|gym)\/(\d+)\/(?:problem\/)?([A-Z]\d?)/i))) return { platform: "cf", num: m[1] + m[2].toUpperCase() };
    if ((m = u.match(/cses\.fi\/problemset\/task\/(\d+)/i))) return { platform: "cses", num: m[1] };
    return null;
  }
  $("iUrl").addEventListener("input", () => {
    const r = parseUrl($("iUrl").value.trim()); if (!r) return;
    if ($("iPlat").value !== r.platform) { $("iPlat").value = r.platform; fillDiff(r.platform, ""); }
    if (r.title && !$("iTitle").value) $("iTitle").value = r.title;
    if (r.num && !$("iNum").value) $("iNum").value = r.num;
  });
  $("iPlat").onchange = () => fillDiff($("iPlat").value, "");
  function openForm(plat, it) {
    editingId = it ? it.id : null;
    $("mTitle").textContent = it ? "Edit details" : "Add " + PLAT[plat].name + " problem";
    $("iPlat").value = plat; fillDiff(plat, it ? it.difficulty : "");
    $("iUrl").value = it?.url || ""; $("iTitle").value = it?.title || ""; $("iNum").value = it?.num || "";
    $("iNorm").value = it?.norm || ""; $("iSummary").value = it?.summary || ""; $("iTags").value = (it?.tags || []).join(", ");
    $("iStatus").value = it ? verdictOf(it) : "solo"; $("iDate").value = it?.solvedAt || today(); $("iSrc").value = it?.source || "";
    $("mSaveOpen").hidden = !!it; $("mSave").classList.toggle("primary", !!it);
    $("mErr").textContent = ""; $("overlay").hidden = false;
    (it ? $("iTitle") : $("iUrl")).focus();
  }
  function closeForm() { $("overlay").hidden = true; editingId = null; }
  $("mCancel").onclick = closeForm;
  $("adds").addEventListener("click", (e) => { const b = e.target.closest("[data-add]"); if (b) openForm(b.dataset.add); });
  async function submitForm(openAfter) {
    const title = $("iTitle").value.trim();
    if (!title) { $("mErr").textContent = "Add a title before saving."; $("iTitle").focus(); return; }
    const url = $("iUrl").value.trim();
    if (url && !safeUrl(url)) { $("mErr").textContent = "Links need to start with http:// or https://."; $("iUrl").focus(); return; }
    const norm = $("iNorm").value ? Math.round(Number($("iNorm").value)) : null;
    if (norm != null && (norm < 1 || norm > 10)) { $("mErr").textContent = "Normalized difficulty runs from 1 to 10."; $("iNorm").focus(); return; }
    if (!probCol) { $("mErr").textContent = "Saving isn't available right now. Reopen the page and try again."; return; }
    const prev = editingId ? items.find(x => x.id === editingId) : null;
    const data = {
      platform: $("iPlat").value, num: $("iNum").value.trim(), title, url, difficulty: $("iDiff").value, norm,
      status: $("iStatus").value, solvedAt: $("iDate").value || today(), source: $("iPlat").value === "qt" ? $("iSrc").value.trim() : "",
      summary: $("iSummary").value.trim(), tags: [...new Set($("iTags").value.split(",").map(s => s.trim()).filter(Boolean))]
    };
    $("mSave").disabled = $("mSaveOpen").disabled = true;
    try {
      if (prev) {
        if (!prev.due || prev.status === "wip") Object.assign(data, initSrs(data.status, data.solvedAt));
        await probCol.doc(prev.id).update(data); closeForm();
      } else {
        const id = "p" + rid();
        Object.assign(data, initSrs(data.status, data.solvedAt), { great: false, revisit: false, methods: [], createdAt: Date.now() });
        await probCol.doc(id).set(data); closeForm();
        if (openAfter) location.hash = "p-" + id; else toast("Problem added", "Write it up", () => { location.hash = "p-" + id; });
      }
    } catch (err) {
      $("mErr").textContent = err && err.code === "quota_exceeded" ? "Your log is full. Delete some old entries to make room." : err && err.code === "permission-denied" ? "Only the owner can edit this log." : "Couldn't save. Check your connection and try again.";
    }
    $("mSave").disabled = $("mSaveOpen").disabled = false;
  }
  $("form").addEventListener("submit", (e) => { e.preventDefault(); submitForm(false); });
  $("mSaveOpen").onclick = () => submitForm(true);
  function handleWriteError(err) {
    if (err && err.code === "permission-denied") { showNotice("Only the owner can edit this log. Sign in with the owner's Google account."); }
    else toast("Couldn't save that change. Check your connection and try again.");
  }

  // ================= Editor.js custom tools =================
  function lastLang() { try { return localStorage.getItem("solvelog-lang") || "python"; } catch (e) { return "python"; } }
  function stopKeys(el) { ["keydown","keyup","paste","input","cut","copy"].forEach(ev => el.addEventListener(ev, (e) => e.stopPropagation())); }
  function autoGrow(ta) { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; }
  const BLANK_ICON = '<svg width="1" height="1"></svg>';

  class CodeTool {
    static get toolbox() { return { title: "Code", icon: BLANK_ICON }; }
    static get enableLineBreaks() { return true; }
    static get isReadOnlySupported() { return true; }
    constructor({ data, api, readOnly, block }) { this.data = { lang: data.lang || lastLang(), code: data.code || "" }; this.api = api; this.ro = readOnly; this.block = block; }
    render() {
      const w = document.createElement("div"); w.className = "xcode";
      w.innerHTML = `<div class="xcode-head"><select aria-label="Language" ${this.ro ? "disabled" : ""}>${LANGS.map(([v, l]) => `<option value="${v}" ${v === this.data.lang ? "selected" : ""}>${l}</option>`).join("")}</select><button type="button">copy</button></div>
        <div class="xeditor"><pre aria-hidden="true"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code" placeholder="Your code" ${this.ro ? "readonly" : ""}></textarea></div>`;
      const sel = w.querySelector("select"), ta = w.querySelector("textarea"), pre = w.querySelector("pre"), copy = w.querySelector("button");
      ta.value = this.data.code;
      const paint = () => { pre.innerHTML = hl(ta.value, this.data.lang) + "\n"; };
      paint();
      stopKeys(ta);
      ta.addEventListener("input", () => { this.data.code = ta.value; paint(); try { this.block && this.block.dispatchChange(); } catch (e) {} });
      sel.addEventListener("change", () => { this.data.lang = sel.value; try { localStorage.setItem("solvelog-lang", sel.value); } catch (e) {} paint(); try { this.block && this.block.dispatchChange(); } catch (e) {} });
      ta.addEventListener("keydown", (e) => {
        if (this.ro) return;
        const s = ta.selectionStart, en = ta.selectionEnd, val = ta.value;
        if (e.key === "Tab") {
          e.preventDefault();
          if (s === en && !e.shiftKey) ta.setRangeText("    ", s, en, "end");
          else { const ls = val.lastIndexOf("\n", s - 1) + 1; const blk = val.slice(ls, en); ta.setRangeText(e.shiftKey ? blk.replace(/^ {1,4}/gm, "") : blk.replace(/^/gm, "    "), ls, en, "select"); }
          ta.dispatchEvent(new Event("input"));
        } else if (e.key === "Enter" && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          const line = val.slice(val.lastIndexOf("\n", s - 1) + 1, s);
          let ind = (line.match(/^\s*/) || [""])[0]; if (/[:{(\[]\s*$/.test(line)) ind += "    ";
          ta.setRangeText("\n" + ind, s, en, "end"); ta.dispatchEvent(new Event("input"));
        }
      });
      copy.addEventListener("click", () => {
        const done = () => { copy.textContent = "copied"; setTimeout(() => copy.textContent = "copy", 1400); };
        try { navigator.clipboard.writeText(ta.value).then(done, () => { ta.focus(); ta.select(); }); } catch (e) { ta.focus(); ta.select(); }
      });
      return w;
    }
    save() { return { lang: this.data.lang, code: this.data.code }; }
  }

  class MathTool {
    static get toolbox() { return { title: "Math", icon: BLANK_ICON }; }
    static get enableLineBreaks() { return true; }
    static get isReadOnlySupported() { return true; }
    constructor({ data, readOnly, block }) { this.data = { tex: data.tex || "" }; this.ro = readOnly; this.block = block; }
    render() {
      const w = document.createElement("div"); w.className = "xmath";
      const ta = document.createElement("textarea"); ta.rows = 1; ta.placeholder = "LaTeX, for example E[N] = \\sum_{k \\ge 1} P(N \\ge k)"; ta.spellcheck = false; ta.value = this.data.tex; ta.setAttribute("aria-label", "LaTeX");
      const prev = document.createElement("div"); prev.className = "prev";
      if (this.ro) ta.hidden = true;
      w.append(ta, prev);
      stopKeys(ta);
      let t = null;
      ta.addEventListener("input", () => { this.data.tex = ta.value; autoGrow(ta); clearTimeout(t); t = setTimeout(() => renderTex(prev, this.data.tex), 250); try { this.block && this.block.dispatchChange(); } catch (e) {} });
      requestAnimationFrame(() => autoGrow(ta));
      renderTex(prev, this.data.tex);
      return w;
    }
    save() { return { tex: this.data.tex }; }
  }

  class ImageTool {
    static get toolbox() { return { title: "Image", icon: BLANK_ICON }; }
    static get isReadOnlySupported() { return true; }
    static get pasteConfig() { return { files: { mimeTypes: ["image/*"] } }; }
    constructor({ data, readOnly, block }) { this.data = { url: data.url || "", assetId: data.assetId || "", caption: data.caption || "" }; this.ro = readOnly; this.block = block; this.w = null; }
    render() { this.w = document.createElement("div"); this.w.className = "ximg"; this.draw(); return this.w; }
    draw(state) {
      const w = this.w;
      if (this.data.url) {
        w.innerHTML = `<img alt=""><input class="cap" placeholder="Add a caption" aria-label="Caption" ${this.ro ? "readonly" : ""}>`;
        const img = w.querySelector("img"), cap = w.querySelector("input");
        img.src = this.data.url; img.alt = this.data.caption || "Image"; cap.value = this.data.caption;
        stopKeys(cap);
        cap.addEventListener("input", () => { this.data.caption = cap.value; try { this.block && this.block.dispatchChange(); } catch (e) {} });
      } else if (state === "uploading") {
        w.innerHTML = `<div class="pick">Uploading image</div>`;
      } else {
        w.innerHTML = `<div class="pick">${this.ro ? "No image" : `<button type="button" class="link">Choose an image</button>, or paste or drop one anywhere on the page`}</div>`;
        const b = w.querySelector("button");
        if (b) b.addEventListener("click", () => {
          const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*";
          inp.onchange = () => { const f = inp.files && inp.files[0]; if (f) this.upload(f); };
          inp.click();
        });
      }
    }
    async upload(file) {
      this.draw("uploading");
      try {
        const r = await uploadImage(file);
        Object.assign(this.data, r); this.draw();
        try { this.block && this.block.dispatchChange(); } catch (e) {}
      } catch (err) { this.draw(); toast(err && err.message === "too-large" ? "That image is too large to store. Try a smaller screenshot." : "Couldn't upload that image. Try again."); }
    }
    onPaste(event) { if (event.type === "file" && event.detail && event.detail.file) this.upload(event.detail.file); }
    save() { return { url: this.data.url, assetId: this.data.assetId, caption: this.data.caption }; }
    validate(d) { return !!d.url; }
  }

  class InsightTool {
    static get toolbox() { return { title: "Key insight", icon: BLANK_ICON }; }
    static get isReadOnlySupported() { return true; }
    static get sanitize() { return { text: { b: true, strong: true, i: true, em: true, a: { href: true, target: "_blank", rel: "noopener" }, code: { class: "inline-code" }, br: true } }; }
    static get conversionConfig() { return { export: "text", import: "text" }; }
    constructor({ data, readOnly }) { this.data = { text: data.text || "" }; this.ro = readOnly; this.txt = null; }
    render() {
      const w = document.createElement("div"); w.className = "xins";
      w.innerHTML = `<div class="lab">Key insight.</div>`;
      const t = document.createElement("div"); t.className = "txt"; t.contentEditable = this.ro ? "false" : "true"; t.dataset.ph = "The idea that cracked it"; t.innerHTML = this.data.text;
      w.appendChild(t); this.txt = t; return w;
    }
    save() { return { text: this.txt ? this.txt.innerHTML : this.data.text }; }
  }

  async function fileToDataUrl(file) {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
    const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
    const c = document.createElement("canvas"); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    const ctx = c.getContext("2d"); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
    let q = 0.82, url = c.toDataURL("image/jpeg", q);
    while (url.length > 220000 && q > 0.4) { q -= 0.12; url = c.toDataURL("image/jpeg", q); }
    return url.length > 240000 ? null : url;
  }
  async function uploadImage(file) {
    const d = await fileToDataUrl(file); if (!d) throw new Error("too-large");
    return { url: d, assetId: "" };
  }

  const EDITOR_OK = () => typeof window.EditorJS === "function";
  function makeEditor(holder, blocks, placeholder, onChange) {
    if (!EDITOR_OK()) return fallbackEditor(holder, blocks, placeholder, onChange);
    const tools = {
      header: { class: window.Header, inlineToolbar: true, config: { levels: [2, 3], defaultLevel: 2, placeholder: "Heading" } },
      code: { class: CodeTool },
      image: { class: ImageTool },
      math: { class: MathTool },
      list: window.EditorjsList ? { class: window.EditorjsList, inlineToolbar: true, config: { defaultStyle: "unordered" } } : undefined,
      insight: { class: InsightTool, inlineToolbar: true },
      delimiter: window.Delimiter ? { class: window.Delimiter } : undefined,
      inlineCode: window.InlineCode ? { class: window.InlineCode, shortcut: "CMD+E" } : undefined
    };
    Object.keys(tools).forEach(k => { if (!tools[k] || !tools[k].class) delete tools[k]; });
    const ed = new window.EditorJS({
      holder, tools, minHeight: 0, readOnly: !canWrite, placeholder,
      data: { blocks: blocks || [] },
      onChange: () => onChange(),
      i18n: { messages: { toolNames: { "Text": "Text", "Heading": "Heading", "Unordered List": "List", "Ordered List": "Numbered list", "Checklist": "Checklist", "Delimiter": "Divider", "Bold": "Bold", "Italic": "Italic", "Link": "Link", "InlineCode": "Inline code" },
        blockTunes: { delete: { "Delete": "Delete", "Click to delete": "Click again to delete" }, moveUp: { "Move up": "Move up" }, moveDown: { "Move down": "Move down" } } } }
    });
    return { save: async () => { try { await ed.isReady; const out = await ed.save(); return out.blocks || []; } catch (e) { return null; } }, destroy: () => { try { ed.destroy(); } catch (e) {} } };
  }
  function fallbackEditor(holder, blocks, placeholder, onChange) {
    const el = typeof holder === "string" ? $(holder) : holder;
    const ta = document.createElement("textarea");
    ta.style.cssText = "width:100%;min-height:120px;border:0;background:transparent;font:inherit;line-height:1.65;resize:vertical;outline:none";
    ta.placeholder = placeholder; ta.readOnly = !canWrite;
    ta.value = (blocks || []).map(b => b.type === "code" ? (b.data.code || "") : b.type === "math" ? "$$" + (b.data.tex || "") + "$$" : String((b.data && (b.data.text || "")) || "").replace(/<[^>]+>/g, "")).filter(Boolean).join("\n\n");
    ta.addEventListener("input", onChange); el.appendChild(ta);
    return { save: async () => ta.value.split(/\n{2,}/).filter(s => s.trim()).map(t => ({ type: "paragraph", data: { text: esc(t).replace(/\n/g, "<br>") } })), destroy: () => ta.remove() };
  }

  // ================= read-only rendering =================
  function listHTML(d) {
    const tag = d.style === "ordered" ? "ol" : "ul";
    const item = (it) => typeof it === "string" ? `<li>${cleanInline(it)}</li>` : `<li>${d.style === "checklist" ? (it.meta && it.meta.checked ? "[x] " : "[ ] ") : ""}${cleanInline(it.content)}${it.items && it.items.length ? listHTML({ style: d.style, items: it.items }) : ""}</li>`;
    return `<${tag}>${(d.items || []).map(item).join("")}</${tag}>`;
  }
  function blocksHTML(blocks) {
    if (!blocks || !blocks.length) return `<p class="rempty">Nothing written here yet.</p>`;
    return blocks.map(b => {
      const d = b.data || {};
      switch (b.type) {
        case "paragraph": return `<p>${cleanInline(d.text)}</p>`;
        case "header": return `<h${d.level >= 3 ? 4 : 3}>${cleanInline(d.text)}</h${d.level >= 3 ? 4 : 3}>`;
        case "list": return listHTML(d);
        case "code": return `<div class="rcode"><div class="lang">${esc((LANGS.find(l => l[0] === d.lang) || [, "Code"])[1])}</div><pre><code>${hl(d.code || "", d.lang)}</code></pre></div>`;
        case "math": return `<div class="rmath" data-tex="${esc(d.tex || "")}"></div>`;
        case "image": return d.url ? `<figure><img src="${esc(d.url)}" alt="${esc(d.caption || "Image")}" loading="lazy">${d.caption ? `<figcaption>${esc(d.caption)}</figcaption>` : ""}</figure>` : "";
        case "insight": return `<div class="xins"><div class="lab">Key insight.</div><div>${cleanInline(d.text)}</div></div>`;
        case "delimiter": return `<hr>`;
        default: return d.text ? `<p>${cleanInline(d.text)}</p>` : "";
      }
    }).join("");
  }
  function finishRO(el) { el.querySelectorAll("[data-tex]").forEach(m => renderTex(m, m.dataset.tex)); typeset(el); }

  // ================= problem page =================
  const P = { id: null, page: null, eds: {}, active: 0, dirty: false, saving: false, again: false, timer: null, undo: null };
  function emptyPage() { return { problem: { blocks: [] }, thoughts: { blocks: [] }, methods: [{ id: rid(), name: "", time: "", space: "", best: false, blocks: [] }] }; }
  function legacyThoughts(it) {
    const out = [];
    if (it.insight) out.push({ type: "insight", data: { text: esc(it.insight) } });
    if (it.notes) String(it.notes).split(/\n{2,}/).filter(s => s.trim()).forEach(t => out.push({ type: "paragraph", data: { text: esc(t).replace(/\n/g, "<br>") } }));
    (it.solutions || []).filter(s => safeUrl(s.url)).forEach(s => out.push({ type: "paragraph", data: { text: `<a href="${esc(s.url)}">${esc(s.lang || "Solution")}</a>` } }));
    return out;
  }
  function destroyEditors() { Object.values(P.eds).forEach(e => e && e.destroy()); P.eds = {}; }
  async function openPage(id) {
    if (P.id === id) return;
    await flushSave();
    destroyEditors();
    Object.assign(P, { id, page: null, active: 0, dirty: false, saving: false, again: false });
    showView("pageView");
    const it = items.find(x => x.id === id);
    $("pageView").innerHTML = `<div class="bar"><a href="#">All problems</a><span class="saveState" id="saveState">Loading</span></div><div id="pHead">${pageHeadHTML(it)}</div><p class="muted"><i>Loading your write-up.</i></p>`;
    let page = null;
    try { const snap = await pageCol.doc(id).get(); if (snap.exists) page = JSON.parse(JSON.stringify(snap.data())); } catch (e) {}
    if (P.id !== id) return;
    if (!page) { page = emptyPage(); const lt = legacyThoughts(it); if (lt.length) page.thoughts.blocks = lt; }
    if (!Array.isArray(page.methods) || !page.methods.length) page.methods = emptyPage().methods;
    page.problem = page.problem || { blocks: [] }; page.thoughts = page.thoughts || { blocks: [] };
    page.methods.forEach(m => { if (!m.id) m.id = rid(); m.blocks = m.blocks || []; });
    P.page = page;
    renderPage();
  }
  function pageHeadHTML(it) {
    if (!it) return "";
    const p = PLAT[it.platform] || PLAT.lc, s = srsOf(it), url = safeUrl(it.url), lab = probLabel(it);
    let status;
    if (isDue(it)) status = `<span class="due">Review today.</span> <a href="#review">Start review</a>`;
    else if (s.mastered) status = `Mastered after ${s.reps} review${s.reps === 1 ? "" : "s"}.${canWrite ? ` <button type="button" class="link" id="pBack">Bring it back</button>` : ""}`;
    else status = `Next review ${esc(fmtDate(s.due))}${s.reps ? `, reviewed ${s.reps} time${s.reps === 1 ? "" : "s"}` : ""}.`;
    return `<h1 class="ptitle">${lab ? `<span class="muted" style="font-weight:600">${esc(lab)}.</span> ` : ""}${esc(it.title)}</h1>
      <div class="pmeta">
        <span><i>${esc(metaText(it))}.</i> ${esc(VERDICT[verdictOf(it)][0].toUpperCase() + VERDICT[verdictOf(it)].slice(1))}${it.solvedAt ? " on " + esc(fmtDate(it.solvedAt, true)) : ""}.</span>
        ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">Open problem</a>` : ""}
        ${(it.tags || []).length ? `<span><i>Techniques:</i> ${esc(joinList(it.tags))}.</span>` : ""}
      </div>
      <div class="pmeta">
        <label class="check"><input type="checkbox" id="pGreat" ${it.great ? "checked" : ""} ${canWrite ? "" : "disabled"}> Great problem</label>
        ${canWrite ? `<button type="button" class="link" id="pEdit">Edit details</button><button type="button" class="link danger" id="pDelete">Delete</button>` : ""}
      </div>
      ${it.summary ? `<p class="sum math" style="margin-top:8px">${esc(it.summary)}</p>` : ""}
      ${reviewedTodayHTML(it) ? `<p class="rtrow page">${reviewedTodayHTML(it)}</p>` : ""}
      <p class="status">${status}</p>`;
  }
  function problemCollapsed() { try { return localStorage.getItem("solvelog-collapse-" + P.id) === "1"; } catch (e) { return false; } }
  function renderPage() {
    const it = items.find(x => x.id === P.id); if (!it) return;
    const collapsed = problemCollapsed();
    $("pageView").innerHTML = `
      <div class="bar"><a href="#">All problems</a><span class="saveState" id="saveState">${canWrite ? "Saved" : "Read only"}</span></div>
      <div id="pHead">${pageHeadHTML(it)}</div>
      <section class="area">
        <div class="ahead"><span class="label">Problem</span><button type="button" class="link muted" id="pCollapse">${collapsed ? "Show" : "Hide"}</button></div>
        <div class="pbox" id="pboxWrap" ${collapsed ? "hidden" : ""}><div class="ed" id="edProblem"></div></div>
      </section>
      <section class="area">
        <div class="ahead"><span class="label">My thoughts</span></div>
        <div class="ed" id="edThoughts"></div>
      </section>
      <section class="area" id="methodArea"></section>`;
    typeset($("pHead"));
    P.eds.problem = makeEditor("edProblem", P.page.problem.blocks, "Paste the statement, examples, and constraints", () => markDirty());
    P.eds.thoughts = makeEditor("edThoughts", P.page.thoughts.blocks, "First reactions, dead ends, and what unlocked it", () => markDirty());
    renderMethods();
  }
  function renderMethods() {
    const ms = P.page.methods; if (P.active >= ms.length) P.active = ms.length - 1;
    const m = ms[P.active];
    const area = $("methodArea");
    area.innerHTML = `
      <div class="ahead" style="border:0;margin-bottom:0"><span class="label">Methods</span></div>
      <div class="tabs" role="tablist">
        ${ms.map((x, i) => `<button type="button" class="tab" role="tab" aria-selected="${i === P.active}" data-tab="${i}">(${letter(i)}) ${esc(x.name || "Untitled")}${x.best ? ` <span class="best">(best)</span>` : ""}</button>`).join("")}
        ${canWrite ? `<button type="button" class="tab add" data-addm>Add method</button>` : ""}
      </div>
      <div class="mhead">
        <input class="mname" id="mName" placeholder="Name this method" value="${esc(m.name)}" ${canWrite ? "" : "readonly"} aria-label="Method name">
        <button type="button" class="bestBtn" id="mBest" aria-pressed="${!!m.best}" ${canWrite ? "" : "disabled"}>best</button>
      </div>
      <div class="cx">
        <label>Time <input id="mTime" value="${esc(m.time)}" placeholder="O(n log n)" ${canWrite ? "" : "readonly"}></label>
        <label>Space <input id="mSpace" value="${esc(m.space)}" placeholder="O(n)" ${canWrite ? "" : "readonly"}></label>
      </div>
      ${canWrite ? `<div class="mtools"><button type="button" class="link muted" data-mv="-1" ${P.active === 0 ? "disabled" : ""}>Move left</button><button type="button" class="link muted" data-mv="1" ${P.active === ms.length - 1 ? "disabled" : ""}>Move right</button><button type="button" class="link danger" data-mdel>Delete method</button></div>` : ""}
      <div class="ed" id="edMethod"></div>`;
    if (P.eds.method) P.eds.method.destroy();
    P.eds.method = makeEditor("edMethod", m.blocks, "Explain the method. On an empty line, use insert for code, math, or images.", () => markDirty());
  }
  async function captureMethod() { if (!P.eds.method || !P.page) return; const b = await P.eds.method.save(); if (b) P.page.methods[P.active].blocks = b; }
  async function switchMethod(i) { await captureMethod(); P.active = i; renderMethods(); }
  function syncTabLabel() {
    const t = document.querySelector(`.tab[data-tab="${P.active}"]`); const m = P.page.methods[P.active];
    if (t) t.innerHTML = `(${letter(P.active)}) ${esc(m.name || "Untitled")}${m.best ? ` <span class="best">(best)</span>` : ""}`;
  }

  const pv = $("pageView");
  pv.addEventListener("click", async (e) => {
    if (!P.page && !e.target.closest("#pHead")) return;
    const it = items.find(x => x.id === P.id);
    const tgt = e.target;
    if (tgt.id === "pEdit" && it) return openForm(it.platform, it);
    if (tgt.id === "pDelete" && it) { pendingDelete = it; $("delText").textContent = `“${it.title}” and its write-up will be removed.`; $("delOverlay").hidden = false; $("delCancel").focus(); return; }
    if (tgt.id === "pBack" && it) { try { await probCol.doc(it.id).update({ mastered: false, interval: 1, due: today() }); } catch (err) { handleWriteError(err); } return; }
    if (tgt.id === "pCollapse") {
      const w = $("pboxWrap"); w.hidden = !w.hidden; tgt.textContent = w.hidden ? "Show" : "Hide";
      try { localStorage.setItem("solvelog-collapse-" + P.id, w.hidden ? "1" : "0"); } catch (err) {}
      return;
    }
    const tab = tgt.closest("[data-tab]");
    if (tab) { const i = +tab.dataset.tab; if (i !== P.active) switchMethod(i); return; }
    if (tgt.closest("[data-addm]")) {
      await captureMethod();
      P.page.methods.push({ id: rid(), name: "", time: "", space: "", best: false, blocks: [] });
      P.active = P.page.methods.length - 1; renderMethods(); markDirty(); $("mName").focus(); return;
    }
    if (tgt.id === "mBest") {
      const m = P.page.methods[P.active]; const on = !m.best;
      P.page.methods.forEach(x => x.best = false); m.best = on;
      await captureMethod(); renderMethods(); markDirty(); return;
    }
    const mv = tgt.closest("[data-mv]");
    if (mv) {
      await captureMethod();
      const i = P.active, j = i + Number(mv.dataset.mv), ms = P.page.methods;
      if (j < 0 || j >= ms.length) return;
      [ms[i], ms[j]] = [ms[j], ms[i]]; P.active = j; renderMethods(); markDirty(); return;
    }
    if (tgt.closest("[data-mdel]")) {
      await captureMethod();
      const ms = P.page.methods, i = P.active;
      const [gone] = ms.splice(i, 1);
      if (!ms.length) ms.push({ id: rid(), name: "", time: "", space: "", best: false, blocks: [] });
      P.active = Math.max(0, i - 1); renderMethods(); markDirty();
      toast(`Method (${letter(i)}) deleted`, "Undo", async () => { await captureMethod(); ms.splice(i, 0, gone); P.active = i; renderMethods(); markDirty(); });
      return;
    }
  });
  pv.addEventListener("change", async (e) => {
    if (e.target.id === "pGreat") { try { await probCol.doc(P.id).update({ great: e.target.checked }); } catch (err) { handleWriteError(err); } }
  });
  pv.addEventListener("input", (e) => {
    if (!P.page) return;
    const m = P.page.methods[P.active];
    if (e.target.id === "mName") { m.name = e.target.value; syncTabLabel(); markDirty(); }
    if (e.target.id === "mTime") { m.time = e.target.value; markDirty(); }
    if (e.target.id === "mSpace") { m.space = e.target.value; markDirty(); }
  });

  function setSave(msg, err) { const s = $("saveState"); if (!s) return; s.textContent = msg; s.classList.toggle("err", !!err); }
  function markDirty() { if (!canWrite) return; P.dirty = true; setSave("Unsaved changes"); clearTimeout(P.timer); P.timer = setTimeout(save, 700); }
  async function flushSave() { if (P.dirty) { clearTimeout(P.timer); await save(); } }
  async function save() {
    if (!P.id || !P.page || !pageCol || !canWrite) return;
    if (P.saving) { P.again = true; return; }
    const id = P.id; P.saving = true; P.dirty = false; setSave("Saving");
    try {
      const [pb, tb] = await Promise.all([P.eds.problem ? P.eds.problem.save() : null, P.eds.thoughts ? P.eds.thoughts.save() : null]);
      if (pb) P.page.problem.blocks = pb; if (tb) P.page.thoughts.blocks = tb;
      await captureMethod();
      const body = { problem: P.page.problem, thoughts: P.page.thoughts, methods: P.page.methods, updatedAt: Date.now() };
      if (JSON.stringify(body).length > 900000) { setSave("This write-up is too large to save. Remove an image or shorten some code.", true); P.saving = false; return; }
      await pageCol.doc(id).set(body);
      const it = items.find(x => x.id === id);
      const methods = P.page.methods.map(m => ({ name: m.name || "Untitled", best: !!m.best }));
      const hasAny = P.page.methods.some(m => m.name || m.blocks.length);
      const summary = hasAny ? methods : [];
      if (it && JSON.stringify(it.methods || []) !== JSON.stringify(summary)) await probCol.doc(id).update({ methods: summary });
      if (P.id === id) setSave("Saved");
    } catch (err) {
      P.dirty = true;
      if (P.id === id) setSave(err && err.code === "permission-denied" ? "Only the owner can edit this write-up." : "Couldn't save. Trying again shortly.", true);
      if (!(err && err.code === "permission-denied")) { clearTimeout(P.timer); P.timer = setTimeout(save, 5000); }
    }
    P.saving = false;
    if (P.again) { P.again = false; if (P.dirty) save(); }
  }

  // ================= review session =================
  const R = { queue: [], i: 0, revealed: false, tally: { again: 0, hard: 0, good: 0, easy: 0 }, page: null, tab: 0, busy: false };
  function startReview() {
    R.queue = items.filter(isDue).sort((a, b) => risk(b) - risk(a)).map(it => it.id);
    R.i = 0; R.tally = { again: 0, hard: 0, good: 0, easy: 0 };
    showView("reviewView"); renderCard();
  }
  async function renderCard() {
    const v = $("reviewView");
    if (!R.queue.length) { v.innerHTML = `<div class="bar"><a href="#">All problems</a></div><h1 class="ptitle">Nothing due.</h1><p class="muted" style="margin-top:8px">Every problem is scheduled for later. ${nextDueLine()}</p>`; return; }
    if (R.i >= R.queue.length) return renderSummary();
    const it = items.find(x => x.id === R.queue[R.i]);
    if (!it) { R.i++; return renderCard(); }
    R.revealed = false; R.tab = 0; R.page = null;
    const p = PLAT[it.platform] || PLAT.lc, s = srsOf(it), lab = probLabel(it);
    const last = s.reps ? `last reviewed ${Math.max(0, daysBetween(s.history.length ? s.history[s.history.length - 1].d : s.due, today()))} days ago` : "first review";
    v.innerHTML = `
      <div class="bar"><span class="muted"><i>Review ${R.i + 1} of ${R.queue.length}</i></span><a href="#">End session</a></div>
      <div class="progress"><i style="width:${Math.round((R.i / R.queue.length) * 100)}%"></i></div>
      <h1 class="ptitle">${lab ? `<span class="muted" style="font-weight:600">${esc(lab)}.</span> ` : ""}${esc(it.title)}</h1>
      <div class="pmeta"><span><i>${esc(metaText(it))}.</i> ${last[0].toUpperCase() + last.slice(1)}.</span>${safeUrl(it.url) ? `<a href="${esc(it.url)}" target="_blank" rel="noopener">Open problem</a>` : ""}</div>
      <section class="area"><div class="ahead"><span class="label">Problem</span></div><div class="pbox ro" id="rProblem"><p class="rempty">Loading.</p></div></section>
      <p class="prompt">Explain your approach out loud: the key idea, each method, and its complexity.</p>
      <div id="rBody"><button type="button" class="btn primary" id="rReveal">Reveal my write-up</button></div>`;
    try { const snap = await pageCol.doc(it.id).get(); R.page = snap.exists ? snap.data() : null; } catch (e) { R.page = null; }
    if (R.queue[R.i] !== it.id || !$("rProblem")) return;
    const pb = R.page && R.page.problem && R.page.problem.blocks;
    $("rProblem").innerHTML = pb && pb.length ? blocksHTML(pb) : `<p class="rempty">No statement saved.${it.summary ? " Summary: " + esc(it.summary) : ""}</p>`;
    finishRO($("rProblem"));
  }
  function revealHTML() {
    const it = items.find(x => x.id === R.queue[R.i]);
    const pg = R.page || {};
    let thoughts = (pg.thoughts && pg.thoughts.blocks) || [];
    if (!R.page && it) thoughts = legacyThoughts(it);
    const ms = (pg.methods && pg.methods.length) ? pg.methods : [];
    const m = ms[R.tab];
    const s = srsOf(it);
    return `
      <section class="area" style="margin-top:6px"><div class="ahead"><span class="label">My thoughts</span></div><div class="ro">${blocksHTML(thoughts)}</div></section>
      ${ms.length ? `<section class="area"><div class="tabs" role="tablist">${ms.map((x, i) => `<button type="button" class="tab" role="tab" aria-selected="${i === R.tab}" data-rtab="${i}">(${letter(i)}) ${esc(x.name || "Untitled")}${x.best ? ` <span class="best">(best)</span>` : ""}</button>`).join("")}</div>
        ${m && (m.time || m.space) ? `<p class="cx" style="margin:0 0 6px">${m.time ? `Time <span style="font-family:var(--f-mono)">${esc(m.time)}</span>` : ""}${m.space ? ` Space <span style="font-family:var(--f-mono)">${esc(m.space)}</span>` : ""}</p>` : ""}
        <div class="ro">${blocksHTML(m ? m.blocks : [])}</div></section>` : ""}
      <hr class="thick" style="margin-top:26px">
      <p style="margin:0;font-size:18px">How well did you remember it?</p>
      <div class="rates">${["again","hard","good","easy"].map((r, k) => `<button type="button" class="rate ${r}" data-rate="${r}">${r[0].toUpperCase() + r.slice(1)}<small>${nextGap(s, r)} day${nextGap(s, r) === 1 ? "" : "s"}</small></button>`).join("")}</div>
      <p class="keys">Keys 1 to 4 work too. Rating moves to the next problem.</p>`;
  }
  function drawReveal() { const b = $("rBody"); if (!b) return; b.innerHTML = revealHTML(); finishRO(b); }
  async function rate(r) {
    if (R.busy) return;
    const it = items.find(x => x.id === R.queue[R.i]); if (!it || !probCol) return;
    if (!canWrite) { toast("Sign in as the owner to record reviews."); return; }
    R.busy = true;
    const s0 = srsOf(it), patch = schedule(s0, r);
    patch.preReview = { interval: s0.interval, ease: s0.ease, reps: s0.reps, lapses: s0.lapses, due: s0.due, mastered: s0.mastered, history: s0.history, revisit: !!it.revisit, on: today() };
    try { await probCol.doc(it.id).update(patch); R.tally[r]++; R.i++; renderCard(); window.scrollTo({ top: 0 }); }
    catch (err) { handleWriteError(err); }
    R.busy = false;
  }
  function nextDueLine() {
    const upcoming = items.filter(it => !srsOf(it).mastered).map(it => srsOf(it).due).filter(d => d > today()).sort();
    if (!upcoming.length) return "";
    const d = upcoming[0], n = upcoming.filter(x => x === d).length;
    return `Next review: ${fmtDate(d)}, ${n} problem${n === 1 ? "" : "s"}.`;
  }
  function renderSummary() {
    const t = R.tally, n = t.again + t.hard + t.good + t.easy;
    const parts = ["again","hard","good","easy"].filter(k => t[k]).map(k => `${t[k]} ${k}`);
    $("reviewView").innerHTML = `
      <div class="progress"><i style="width:100%"></i></div>
      <h1 class="ptitle">Done for today.</h1>
      <p style="margin:10px 0 0;font-size:18px">${n} reviewed${parts.length ? ": " + parts.join(", ") : ""}.</p>
      <p class="muted" style="margin:6px 0 18px">${esc(nextDueLine())}</p>
      <a href="#">Back to all problems</a>`;
  }
  $("reviewView").addEventListener("click", (e) => {
    if (e.target.id === "rReveal") { R.revealed = true; drawReveal(); return; }
    const t = e.target.closest("[data-rtab]"); if (t) { R.tab = +t.dataset.rtab; drawReveal(); return; }
    const r = e.target.closest("[data-rate]"); if (r) rate(r.dataset.rate);
  });
  document.addEventListener("keydown", (e) => {
    if ($("reviewView").hidden || !R.revealed || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName)) return;
    const map = { "1": "again", "2": "hard", "3": "good", "4": "easy" };
    if (map[e.key]) { e.preventDefault(); rate(map[e.key]); }
  });

  // ================= routing =================
  function showView(id) { ["listView","pageView","reviewView"].forEach(v => $(v).hidden = v !== id); window.scrollTo({ top: 0 }); }
  async function route() {
    const h = location.hash.slice(1);
    if (!loaded) { if (h) { showView(h === "review" ? "reviewView" : "pageView"); $(h === "review" ? "reviewView" : "pageView").innerHTML = `<p class="muted"><i>Loading.</i></p>`; } return; }
    if (h.startsWith("p-")) {
      const id = h.slice(2);
      if (!items.some(x => x.id === id)) { location.hash = ""; showNotice("That problem isn't in your log anymore."); return; }
      return openPage(id);
    }
    if (P.id) { await flushSave(); destroyEditors(); P.id = null; P.page = null; }
    if (h === "review") return startReview();
    showView("listView"); renderList();
  }
  window.addEventListener("hashchange", route);
  function refreshOpenViews() {
    if (P.id && $("pHead")) {
      const it = items.find(x => x.id === P.id);
      if (!it) { location.hash = ""; return; }
      $("pHead").innerHTML = pageHeadHTML(it); typeset($("pHead"));
    }
    if (!$("listView").hidden) renderList();
  }

  // ================= delete =================
  $("delCancel").onclick = () => { $("delOverlay").hidden = true; pendingDelete = null; };
  $("delOk").onclick = async () => {
    if (!pendingDelete || !probCol) return;
    $("delOk").disabled = true;
    const id = pendingDelete.id;
    try {
      if (P.id === id) { P.dirty = false; clearTimeout(P.timer); }
      await probCol.doc(id).delete();
      try { await pageCol.doc(id).delete(); } catch (e) {}
      $("delOverlay").hidden = true; pendingDelete = null;
      if (P.id === id) location.hash = "";
      toast("Problem deleted");
    } catch (err) { handleWriteError(err); $("delOverlay").hidden = true; }
    $("delOk").disabled = false;
  };
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!$("overlay").hidden) closeForm();
    if (!$("delOverlay").hidden) $("delCancel").click();
  });
  window.addEventListener("pagehide", () => { flushSave(); });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushSave(); });

  // ================= data (Firebase) =================
  const CFG = window.SOLVE_LOG_CONFIG || {};
  let fbAuth = null, me = null;
  function renderAuthLine() {
    const el = $("authLine"); if (!el) return;
    if (!fbAuth) { el.innerHTML = ""; return; }
    if (me && canWrite) el.innerHTML = `Signed in as ${esc(me.email || "you")}. <button type="button" class="link muted" id="signOut">Sign out</button>`;
    else if (me) el.innerHTML = `Signed in as ${esc(me.email || "someone")}, who can read but not edit this log. <button type="button" class="link muted" id="signOut">Sign out</button>`;
    else el.innerHTML = `<button type="button" class="link muted" id="signIn">Sign in to edit</button>`;
  }
  document.addEventListener("click", async (e) => {
    if (!fbAuth) return;
    if (e.target.id === "signIn") {
      try { await fbAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); }
      catch (err) { if (!/popup-closed|cancelled-popup/.test(err && err.code || "")) toast("Couldn't sign in. Allow pop-ups for this site and try again."); }
    }
    if (e.target.id === "signOut") { await flushSave(); fbAuth.signOut(); }
  });
  function applyAuth(user) {
    me = user;
    const owner = (CFG.ownerEmail || "").toLowerCase();
    const was = canWrite;
    canWrite = !!(user && user.email && user.email.toLowerCase() === owner && user.emailVerified !== false);
    renderAuthLine();
    if (was === canWrite) return;
    if (P.id && P.page) { destroyEditors(); renderPage(); }
    refreshOpenViews();
  }

  canWrite = false;
  renderList(); route();
  (async () => {
    if (!window.firebase || !CFG.firebase || !CFG.firebase.apiKey) { loaded = true; showNotice("This site isn't connected to its database yet. Add the Firebase settings to firebase-config.js."); renderList(); return; }
    try { firebase.initializeApp(CFG.firebase); } catch (e) {}
    const db = firebase.firestore();
    fbAuth = firebase.auth();
    fbAuth.onAuthStateChanged(applyAuth);
    probCol = db.collection("problems"); pageCol = db.collection("pages");
    let live = false;
    const timer = setTimeout(() => { if (!live) showNotice("Can't reach your saved problems yet. What you see may be out of date."); }, 10000);
    probCol.onSnapshot((snap) => {
      items = snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
      if (!snap.metadata.fromCache && !live) { live = true; clearTimeout(timer); showNotice(""); }
      const first = !loaded; loaded = true;
      if (first) route(); else refreshOpenViews();
    }, (err) => {
      clearTimeout(timer); loaded = true;
      showNotice("Couldn't load the problem log. Check your connection and reload the page.");
      renderList();
    });
  })();
})();
