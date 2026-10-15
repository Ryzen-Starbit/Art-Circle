(function(){
var c=[75,97,109,98,97,113,116];
var s=String.fromCharCode.apply(null,c);
console.log('%c %c '+s+' %c ','font-size:24px;','background:linear-gradient(90deg,#ff6b5b,#f3c14b,#2de0ca);color:#07050f;font-size:26px;font-weight:900;padding:14px 26px;border-radius:8px;letter-spacing:6px;text-shadow:0 2px 0 rgba(255,255,255,.35);','font-size:24px;');
})();
(() => {
  "use strict";
  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const CLUBS = Object.fromEntries(S.clubs.map(c => [c.id, c]));
  const AC = { id: "artcircle", name: "Art Circle", color: "#e88a2e" };
  const club = id => CLUBS[id] || (id === "artcircle" ? AC : { id: "", name: "Other", color: "#dfb64e" });
  const insta = h => h ? (/^https?:/.test(h) ? h : `https://www.instagram.com/${h.replace(/^@/, "")}/`) : "";
  const handle = h => h ? "@" + h.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/+$/, "") : "";
  const initials = n => (n || "").replace(/^(Prof|Dr|Mr|Mrs|Ms)\.?\s+/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "?";
  const fmtDate = (d, opt = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", opt) : "";
  const to12 = t => { if (!t) return ""; let [h, m] = t.split(":").map(Number); const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return `${h}:${String(m).padStart(2, "0")} ${ap}`; };

  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 1800); }
  function copy(text, label) {
    const ok = () => toast(`${label || "Text"} copied`);
    const fallback = () => { const ta = document.createElement("textarea"); ta.value = text; ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); ok(); } catch (e) { toast(text); } ta.remove(); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(ok).catch(fallback); else fallback();
  }
  document.addEventListener("click", e => { const b = e.target.closest("[data-copy]"); if (b) { e.preventDefault(); copy(b.dataset.copy, b.dataset.label); } });
  $("#toTop").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  const LB = { list: [], i: 0 };
  function lbShow(i) { LB.i = (i + LB.list.length) % LB.list.length; const it = LB.list[LB.i]; $("#lbImg").src = it.src; $("#lbImg").alt = it.title; $("#lbTitle").textContent = it.title; $("#lbMeta").textContent = it.meta || ""; const multi = LB.list.length > 1; $("#lbPrev").hidden = !multi; $("#lbNext").hidden = !multi; }
  function lbOpen(list, i) { LB.list = list; LB.last = document.activeElement; lbShow(i); $("#lightbox").hidden = false; document.body.style.overflow = "hidden"; $("#lbClose").focus(); }
  function lbClose() { $("#lightbox").hidden = true; document.body.style.overflow = ""; LB.last?.focus?.(); }
  $("#lbClose").addEventListener("click", lbClose);
  $("#lbPrev").addEventListener("click", () => lbShow(LB.i - 1));
  $("#lbNext").addEventListener("click", () => lbShow(LB.i + 1));
  $("#lightbox").addEventListener("click", e => { if (e.target.id === "lightbox" || e.target.tagName === "FIGURE") lbClose(); });
  let tsx = 0; $("#lightbox").addEventListener("touchstart", e => tsx = e.touches[0].clientX, { passive: true });
  $("#lightbox").addEventListener("touchend", e => { const dx = e.changedTouches[0].clientX - tsx; if (Math.abs(dx) > 50 && LB.list.length > 1) lbShow(LB.i + (dx < 0 ? 1 : -1)); });
  addEventListener("keydown", e => { if ($("#lightbox").hidden) return; if (e.key === "Escape") lbClose(); if (e.key === "ArrowRight") lbShow(LB.i + 1); if (e.key === "ArrowLeft") lbShow(LB.i - 1); });
  document.addEventListener("click", e => { const z = e.target.closest("[data-zoom]"); if (z) lbOpen([{ src: z.dataset.zoom, title: z.dataset.title || "", meta: z.dataset.meta || "" }], 0); });

  const PAGES = ["home", "about", "clubs", "bharatiyam", "schedule", "team", "gallery", "contact"];
  const TITLES = { home: "Art Circle BVCOE", about: "About", clubs: "Clubs", bharatiyam: "Bharatiyam", schedule: "Schedule", team: "Core Team", gallery: "Gallery", contact: "Contact" };
  const DARK_HEAD_CLUBS = ["malang", "raqs", "rhapsody", "vaaqif"];
  const rendered = {};
  let current = null, currentClub = null;

  function parse(hash) {
    const h = (hash || "").replace(/^#/, "");
    if (h.startsWith("club-") && CLUBS[h.slice(5)]) return { page: "club", id: h.slice(5) };
    return { page: PAGES.includes(h) ? h : "home" };
  }
  function swap(route) {
    $$(".page").forEach(p => p.classList.toggle("on", p.dataset.page === route.page));
    current = route.page;
    if (route.page === "club") renderClub(route.id);
    else if (!rendered[route.page]) { RENDER[route.page]?.(); rendered[route.page] = true; }
    currentClub = route.page === "club" ? route.id : null;
    nav.classList.toggle("on-dark", route.page === "club" && DARK_HEAD_CLUBS.includes(route.id));
    document.title = route.page === "club" ? `${CLUBS[route.id].name} · Art Circle` : (route.page === "home" ? TITLES.home : `${TITLES[route.page]} · Art Circle`);
    $$("[data-nav]").forEach(a => a.classList.toggle("on", a.dataset.nav === (route.page === "club" ? "clubs" : route.page)));
    window.scrollTo(0, 0);
    onScroll();
  }
  function go(first) {
    const route = parse(location.hash);
    closeMenu();
    if (first || reduce) { swap(route); return; }
    const w = $("#wipe");
    w.classList.remove("out"); w.classList.add("in");
    setTimeout(() => { swap(route); w.classList.remove("in"); w.classList.add("out"); setTimeout(() => w.classList.remove("out"), 500); }, 470);
  }
  addEventListener("hashchange", () => go(false));

  const nav = $("#nav");
  function onScroll() { nav.classList.toggle("dark", scrollY > 60); }
  addEventListener("scroll", onScroll, { passive: true });
  function closeMenu() { $("#navLinks").classList.remove("open"); $("#menuBtn").setAttribute("aria-expanded", "false"); nav.classList.remove("menu-open"); document.body.style.overflow = ""; }
  $("#menuBtn").addEventListener("click", () => {
    const open = !$("#navLinks").classList.contains("open");
    $("#navLinks").classList.toggle("open", open); $("#menuBtn").setAttribute("aria-expanded", open); nav.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("#navLinks a, .brand").forEach(a => a.addEventListener("click", () => { if (a.getAttribute("href") === location.hash || (!location.hash && a.getAttribute("href") === "#home")) { closeMenu(); scrollTo({ top: 0, behavior: "smooth" }); } }));

  function eventCard(ev) {
    const c = club(ev.club);
    const meta = [fmtDate(ev.date, { day: "numeric", month: "short", year: "numeric" }), to12(ev.time), ev.venue].filter(Boolean).join(" · ");
    const poster = ev.poster
      ? `<button class="ev-poster" data-zoom="${esc(ev.poster)}" data-title="${esc(ev.title)}" data-meta="${esc(meta)}" aria-label="View ${esc(ev.title)} poster"><img src="${esc(ev.poster)}" alt="${esc(ev.title)} poster" loading="lazy"></button>`
      : `<div class="ev-poster noimg"><div><b>${esc(ev.title)}</b><span>${esc(ev.subtitle)}</span></div></div>`;
    return `<article class="ev-card" style="--c:${c.color}">${poster}
      <div class="ev-info"><span class="club-tag">${esc(c.name)}</span><h4>${esc(ev.title)}</h4>
      ${ev.subtitle ? `<small>${esc(ev.subtitle)}</small>` : ""}<small>${esc(meta || "Date to be confirmed")}</small>
      ${ev.link ? `<a class="mini" href="${esc(ev.link)}" target="_blank" rel="noopener" style="margin-top:6px;justify-self:start">Event post ↗</a>` : ""}</div></article>`;
  }
  const CLUB_ALIASES = { malang: ["malang"], lc: ["lc", "literary council", "the literary council", "literally council", "literary"], raqs: ["raqs", "raq", "raks"], rhapsody: ["rhapsody", "rapsody", "drama"], malhaar: ["malhaar", "malhar", "music"], vaaqif: ["vaaqif", "vaqif", "wakif", "waqif", "band"] };
  const COLS = { club: ["club"], tenure: ["tenure", "session", "academic year", "ay", "batch"], name: ["name", "student name", "full name", "name of student"], branch: ["branch", "department", "dept", "course"], year: ["year", "class", "year of study", "study year"], designation: ["designation", "position", "post", "role"], domain: ["domain", "team", "wing", "vertical"], instagram: ["instagram", "insta"], photo: ["photo", "image"] };
  const norm = v => String(v ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  const clubIdFrom = v => { const n = norm(v); return Object.keys(CLUB_ALIASES).find(id => CLUB_ALIASES[id].includes(n)) || ""; };
  let membersCache = null;
  function loadMembers() {
    if (membersCache) return membersCache;
    membersCache = (async () => {
      if (!S.membersFile || !window.XLSX) throw new Error("unavailable");
      const res = await fetch(S.membersFile);
      if (!res.ok) throw new Error("missing");
      const wb = XLSX.read(await res.arrayBuffer(), { type: "array" });
      const rows = [];
      wb.SheetNames.forEach(sheet => {
        const table = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: "", raw: false });
        table.forEach(r => {
          const get = key => { const k = Object.keys(r).find(h => COLS[key].includes(norm(h))); return k ? String(r[k]).trim() : ""; };
          const name = get("name"); if (!name) return;
          rows.push({ club: clubIdFrom(get("club")) || clubIdFrom(sheet), tenure: get("tenure") || "Current", name, branch: get("branch"), year: get("year"), designation: get("designation") || "Member", domain: get("domain"), instagram: get("instagram"), photo: get("photo") });
        });
      });
      return rows;
    })();
    return membersCache;
  }
  async function renderMembers(id) {
    const box = $("#clubMembers"); if (!box) return;
    box.innerHTML = `<p class="eyebrow" style="margin-bottom:16px">Members</p><p class="empty-note">Loading the member list…</p>`;
    let all;
    try { all = await loadMembers(); } catch (e) { membersCache = null; box.innerHTML = `<p class="eyebrow" style="margin-bottom:16px">Members</p><p class="empty-note">The member list will appear here once <b>${esc(S.membersFile || "data/members.xlsx")}</b> is added.</p>`; return; }
    if (currentClub !== id) return;
    const list = all.filter(r => r.club === id);
    if (!list.length) { box.innerHTML = `<p class="eyebrow" style="margin-bottom:16px">Members</p><p class="empty-note">No members listed for this club yet.</p>`; return; }
    const tenures = [...new Set(list.map(r => r.tenure))].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    let t = tenures[0], q = "";
    box.innerHTML = `
      <div class="mem-head"><div><p class="eyebrow">Members</p><h3 class="sub-h" style="margin:8px 0 0">The ${esc(CLUBS[id].name)} team</h3></div>
        <input class="mem-search" id="memSearch" type="search" placeholder="Search name, branch, domain…" aria-label="Search members"></div>
      <div class="past-tabs" id="memTabs">${tenures.map((x, i) => `<button class="chip ${i === 0 ? "on" : ""}" data-t="${esc(x)}">${esc(x)}</button>`).join("")}</div>
      <div id="memHeads"></div>
      <div class="mem-table-wrap"><table class="mem-table"><thead><tr><th>Name</th><th>Branch</th><th>Year</th><th>Designation</th><th>Domain</th></tr></thead><tbody id="memRows"></tbody></table></div>
      <p class="mem-count" id="memCount"></p>`;
    const rank = d => { const n = norm(d); return n.includes("co") && n.includes("head") ? 1 : n.includes("domain") ? 2 : n.includes("head") || n.includes("lead") || n.includes("captain") ? 0 : n.includes("coordinator") ? 3 : 4; };
    const draw = () => {
      const rows = list.filter(r => r.tenure === t).filter(r => !q || [r.name, r.branch, r.year, r.designation, r.domain].some(v => norm(v).includes(q))).sort((a, b) => rank(a.designation) - rank(b.designation) || a.name.localeCompare(b.name));
      const heads = rows.filter(r => rank(r.designation) < 3);
      $("#memHeads").innerHTML = heads.length ? `<div class="people" style="margin-bottom:22px">${heads.map(h => personCard({ name: h.name, role: [h.designation, h.domain].filter(Boolean).join(" · "), instagram: h.instagram, photo: h.photo })).join("")}</div>` : "";
      $("#memRows").innerHTML = rows.map(r => `<tr><td><b>${esc(r.name)}</b></td><td>${esc(r.branch)}</td><td>${esc(r.year)}</td><td>${esc(r.designation)}</td><td>${esc(r.domain)}</td></tr>`).join("") || `<tr><td colspan="5" class="tba">No match</td></tr>`;
      $("#memCount").textContent = `${rows.length} ${rows.length === 1 ? "member" : "members"} · ${t}`;
    };
    $("#memTabs").addEventListener("click", e => { const b = e.target.closest("[data-t]"); if (!b) return; t = b.dataset.t; $$("#memTabs .chip").forEach(x => x.classList.toggle("on", x === b)); draw(); });
    $("#memSearch").addEventListener("input", e => { q = norm(e.target.value); draw(); });
    draw();
  }
  function fanCards() {
    const posters = (S.bharatiyam.posters || []).slice(0, 5);
    const k = posters.length, mid = (k - 1) / 2;
    return posters.map((p, i) => {
      const r = (i - mid) * 9, x = (i - mid) * 52, y = Math.abs(i - mid) * 14;
      return `<button class="fan-card" data-zoom="${esc(p)}" data-title="Bharatiyam ${esc(S.bharatiyam.lastEdition)}" style="--r:${r}deg;--x:${x}%;--y:${y}px;z-index:${i + 1}" aria-label="View poster ${i + 1}"><img src="${esc(p)}" alt="" loading="lazy"></button>`;
    }).join("");
  }
  function personCard(p, links) {
    const btns = [];
    if (p.phone) btns.push(`<button class="mini" data-copy="${esc(p.phone)}" data-label="Number">${esc(p.phone)}</button>`);
    if (p.instagram) btns.push(`<a class="mini" href="${esc(insta(p.instagram))}" target="_blank" rel="noopener">${esc(handle(p.instagram))}</a>`);
    if (links?.instagram) btns.push(`<a class="mini" href="${esc(insta(links.instagram))}" target="_blank" rel="noopener">Club Instagram ↗</a>`);
    if (links?.website) btns.push(`<a class="mini" href="${esc(links.website)}" target="_blank" rel="noopener">Website ↗</a>`);
    return `<div class="person"><div class="avatar">${p.photo ? `<img src="${esc(p.photo)}" alt="">` : esc(p.name ? initials(p.name) : "?")}</div>
      <div><b class="${p.name ? "" : "tba"}">${esc(p.name || "Name to be added")}</b><small>${esc(p.role)}</small>
      ${btns.length ? `<div class="links">${btns.join("")}</div>` : ""}</div></div>`;
  }
  function photoBlock(m) {
    return `<div class="r-photo">${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}" draggable="false">` : `<span class="ini">${esc(m.name ? initials(m.name) : m.short)}</span>`}</div>`;
  }

  const RENDER = {
    home() {
      const items = S.clubs.map(c => c.fullName || c.name).concat(["Bharatiyam"]);
      const m = items.map(n => `<span>${esc(n)}</span>`).join("");
      $("#marquee").innerHTML = m + m + m + m;
      $("#homeClubs").innerHTML = S.clubs.map(c => `
        <a class="cs-item" href="#club-${c.id}" style="--c:${c.color}">
          <div class="cs-logo" style="background:${c.logoBg}"><img src="${esc(c.logo)}" alt="${esc(c.name)} logo" loading="lazy"></div>
          <div><b>${esc(c.fullName || c.name)}</b><small>${esc(c.kind)}</small></div></a>`).join("");
      $("#homeBhText").textContent = S.bharatiyam.about;
      $("#posterFan").innerHTML = fanCards();
      initMandala();
    },

    about() {
      const A = S.about, C = S.core.current;
      $("#aboutBody").innerHTML = `
        <div class="block about-grid">
          <div>
            <p class="eyebrow">Art Circle</p>
            <h2 class="sub-h" style="margin-top:14px">${esc(A.headline)}</h2>
            <div class="about-text">${A.paragraphs.map(p => `<p>${esc(p)}</p>`).join("")}</div>
          </div>
          <div><p class="eyebrow" style="margin-bottom:12px">Faculty</p><div class="people" style="grid-template-columns:1fr">${A.faculty.map(p => personCard(p)).join("")}</div></div>
        </div>
        <div class="block">
          <div class="sec-head"><p class="eyebrow">Student council · ${esc(C.tenure)}</p><h2>The core</h2></div>
          <div class="core-links">${C.members.map(m => `
            <a class="person" href="#team"><div class="avatar">${m.photo ? `<img src="${esc(m.photo)}" alt="">` : esc(initials(m.name))}</div>
            <div><b>${esc(m.name || "To be added")}</b><small>${esc(m.role)}</small></div><span class="go" aria-hidden="true">→</span></a>`).join("")}</div>
          <div class="hero-cta"><a class="btn btn-gold" href="#team">Meet the full team</a></div>
        </div>`;
    },
    clubs() {
      $("#clubsGrid").innerHTML = S.clubs.map(c => `
        <a class="club-card" href="#club-${c.id}" style="--c:${c.color}">
          <div class="cc-logo" style="background:${c.logoBg}"><img src="${esc(c.logo)}" alt="${esc(c.name)} logo" loading="lazy"></div>
          <div class="cc-body"><span class="eyebrow">${esc(c.kind)}</span><h3>${esc(c.fullName || c.name)}</h3>
            <p>${esc(c.about)}</p>
            <div class="cc-foot"><span>${esc(handle(c.instagram))}</span><span>View club →</span></div></div>
        </a>`).join("");
    },

    bharatiyam() {
      const B = S.bharatiyam;
      const hl = S.events.filter(e => e.highlight);
      $("#bhBody").innerHTML = `
        ${B.banner ? `<button class="bh-banner" data-zoom="${esc(B.banner)}" data-title="Art Circle × Bharatiyam ${esc(B.lastEdition)}"><img src="${esc(B.banner)}" alt="Art Circle at Bharatiyam ${esc(B.lastEdition)}"></button>` : ""}
        <div class="block bh-intro">
          <div>
            <p class="eyebrow">Conducted by Art Circle</p>
            <h2 class="sub-h" style="margin-top:12px">The fest that takes over the campus</h2>
            <p class="lead">${esc(B.about)}</p>
            <div class="countdown"><p class="eyebrow">Bharatiyam ${esc(B.nextEdition)}</p>
              <div class="cd-grid"><div><b id="cdD">--</b><span>Days</span></div><div><b id="cdH">--</b><span>Hrs</span></div><div><b id="cdM">--</b><span>Min</span></div><div><b id="cdS">--</b><span>Sec</span></div></div>
              <p class="cd-note" id="cdNote"></p></div>
            <div class="hero-cta"><a class="btn btn-gold" href="#schedule">Bharatiyam ${esc(B.lastEdition)} schedule</a><a class="btn btn-ghost" href="#gallery">Gallery</a></div>
          </div>
          <div class="poster-fan">${fanCards()}</div>
        </div>
        <div class="block">
          <div class="sec-head"><p class="eyebrow">Bharatiyam ${esc(B.lastEdition)}</p><h2>Highlights</h2></div>
          <div class="hl-grid">${hl.map(e => { const c = club(e.club);
            const meta = [fmtDate(e.date, { day: "numeric", month: "short" }), e.venue].filter(Boolean).join(" · ");
            const inner = `<div class="hl-body"><span class="club-tag" style="--c:${c.color}">${esc(c.name)}</span><h3>${esc(e.title)}</h3>${e.subtitle ? `<span class="hand">${esc(e.subtitle)}</span>` : ""}<small>${esc(e.note || meta)}</small></div>`;
            return e.poster
              ? `<button class="hl" data-zoom="${esc(e.poster)}" data-title="${esc(e.title)}" data-meta="${esc(meta)}"><img src="${esc(e.poster)}" alt="" loading="lazy">${inner}</button>`
              : `<div class="hl noimg">${inner}</div>`; }).join("")}</div>
        </div>
        <div class="block">
          <div class="sec-head"><p class="eyebrow">Bharatiyam ${esc(B.nextEdition)}</p><h2>Organising committee</h2></div>
          <div class="people">${B.committee.map(p => personCard(p)).join("")}</div>
          <div class="hero-cta"><a class="btn btn-ghost" href="#team">Art Circle core team →</a></div>
        </div>`;
      const note = $("#cdNote");
      if (!B.nextStart) { note.textContent = "Dates will be announced on our Instagram."; return; }
      const target = new Date(B.nextStart).getTime(); const pad = n => String(n).padStart(2, "0");
      const tick = () => { const d = Math.max(0, target - Date.now());
        $("#cdD").textContent = pad(Math.floor(d / 864e5)); $("#cdH").textContent = pad(Math.floor(d / 36e5) % 24); $("#cdM").textContent = pad(Math.floor(d / 6e4) % 60); $("#cdS").textContent = pad(Math.floor(d / 1e3) % 60);
        note.textContent = d ? `until Bharatiyam begins on ${new Date(B.nextStart).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}` : "Bharatiyam is on. See you there!"; };
      tick(); setInterval(tick, 1000);
    },

    schedule() {
      const E = S.events;
      $("#schedEyebrow").textContent = `Bharatiyam ${S.bharatiyam.lastEdition} calendar`;
      const dates = [...new Set(E.filter(e => e.date).map(e => e.date))].sort();
      const days = dates.map((d, i) => ({ key: d, label: `Day ${i + 1}`, sub: fmtDate(d, { weekday: "short", day: "numeric", month: "short" }) }));
      if (E.some(e => !e.date)) days.push({ key: "", label: "More events", sub: "Date to be confirmed" });
      let day = days[0]?.key ?? ""; const active = new Set();
      $("#dayTabs").innerHTML = days.map((d, i) => `<button class="day-tab ${i === 0 ? "on" : ""}" role="tab" aria-selected="${i === 0}" data-day="${esc(d.key)}"><b>${esc(d.label)}</b><small>${esc(d.sub)}</small></button>`).join("");
      const used = [...new Set(E.map(e => e.club))];
      $("#clubFilters").innerHTML = used.map(id => { const c = club(id); return `<button class="chip" data-f="${esc(id)}" style="--c:${c.color}" aria-pressed="false"><i></i>${esc(c.name)}</button>`; }).join("");
      const gcal = e => { if (!e.date) return ""; const ds = e.date.replace(/-/g, ""); let dates;
        if (e.time) { const st = ds + "T" + e.time.replace(":", "") + "00"; const [h, m] = e.time.split(":").map(Number); const endT = e.end || `${String(Math.min(h + 2, 23)).padStart(2, "0")}:${String(m).padStart(2, "0")}`; dates = `${st}/${ds}T${endT.replace(":", "")}00`; }
        else { const n = new Date(e.date + "T00:00:00"); n.setDate(n.getDate() + 1); dates = `${ds}/${n.getFullYear()}${String(n.getMonth() + 1).padStart(2, "0")}${String(n.getDate()).padStart(2, "0")}`; }
        return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(e.title + " · Bharatiyam") + "&dates=" + dates + "&ctz=Asia/Kolkata&location=" + encodeURIComponent((e.venue ? e.venue + ", " : "") + "BV(DU) COE Pune") + "&details=" + encodeURIComponent((e.subtitle || "") + (e.note ? "\n" + e.note : "")); };
      function render() {
        const list = E.filter(e => (e.date || "") === day && (!active.size || active.has(e.club)))
          .sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
        $("#timeline").innerHTML = list.length ? list.map(e => { const c = club(e.club); const g = gcal(e);
          const meta = [fmtDate(e.date), to12(e.time), e.venue].filter(Boolean).join(" · ");
          return `<article class="slot" style="--c:${c.color}">
            <time>${e.time ? to12(e.time) : "Time TBC"}<small>${e.end ? "to " + to12(e.end) : (e.date ? fmtDate(e.date, { day: "numeric", month: "short" }) : "Date TBC")}</small></time>
            ${e.poster ? `<button class="slot-thumb" data-zoom="${esc(e.poster)}" data-title="${esc(e.title)}" data-meta="${esc(meta)}" aria-label="View ${esc(e.title)} poster"><img src="${esc(e.poster)}" alt="" loading="lazy"></button>` : `<div class="slot-thumb noimg" aria-hidden="true">✺</div>`}
            <div style="min-width:0"><h4>${esc(e.title)} ${e.highlight ? '<span class="star">★ highlight</span>' : ""}</h4>
              ${e.subtitle ? `<p class="sub">${esc(e.subtitle)}</p>` : ""}
              <div class="meta"><span class="club-tag">${esc(c.name)}</span>${e.venue ? `<span>📍 ${esc(e.venue)}</span>` : ""}${e.note ? `<span>${esc(e.note)}</span>` : ""}</div></div>
            <div class="acts">${e.link ? `<a class="mini" href="${esc(e.link)}" target="_blank" rel="noopener">Event post ↗</a>` : ""}${e.register ? `<a class="mini" href="${esc(e.register)}" target="_blank" rel="noopener">Register ↗</a>` : ""}${g ? `<a class="mini" href="${g}" target="_blank" rel="noopener">+ Calendar</a>` : ""}</div>
          </article>`; }).join("") : `<p class="empty-note">No events from these clubs on this day.</p>`;
      }
      $("#dayTabs").addEventListener("click", e => { const b = e.target.closest(".day-tab"); if (!b) return; day = b.dataset.day; $$(".day-tab").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); }); render(); });
      $("#clubFilters").addEventListener("click", e => { const b = e.target.closest("[data-f]"); if (!b) return; const f = b.dataset.f; active.has(f) ? active.delete(f) : active.add(f); b.classList.toggle("on", active.has(f)); b.setAttribute("aria-pressed", active.has(f)); render(); });
      render();
    },

    team() {
      const C = S.core; const M = C.current.members;
      const past = C.past.slice(0, 2);
      $("#teamBody").innerHTML = `
        <div class="block">
          <div class="sec-head"><p class="eyebrow">Current core · ${esc(C.current.tenure)}</p><h2>The wheel turns, the circle stays</h2><p style="color:var(--muted)">Move your cursor across the wheel to turn it. Hover over a member to read about them.</p></div>
          <div class="ring-stage" id="ringStage"><div class="ring" id="ring">${M.map((m, i) => `
            <div class="r-card" data-i="${i}" tabindex="0" aria-label="${esc(m.name)}, ${esc(m.role)}">${photoBlock(m)}
              <div class="r-meta"><b class="${m.name ? "" : "tba"}">${esc(m.name || "To be added")}</b><small>${esc(m.short || m.role)}</small></div>
              <div class="r-over"><span class="role">${esc(m.role)}</span><b>${esc(m.name || "To be added")}</b>
                <p>${esc(m.intro || "A short intro about this member will appear here.")}</p>
                ${m.instagram ? `<a class="mini" style="align-self:flex-start" href="${esc(insta(m.instagram))}" target="_blank" rel="noopener">${esc(handle(m.instagram))}</a>` : ""}</div>
            </div>`).join("")}</div>
            <p class="ring-hint">${finePointer ? "move the cursor to turn the wheel" : "swipe to turn · tap a member"}</p>
          </div>
        </div>
        <div class="block">
          <div class="sec-head"><p class="eyebrow">Legacy</p><h2>Previous cores</h2></div>
          <div class="past-tabs" id="pastTabs">${past.map((p, i) => `<button class="chip ${i === 0 ? "on" : ""}" data-p="${i}">${esc(p.tenure)}</button>`).join("")}</div>
          <div class="past-grid" id="pastGrid"></div>
        </div>`;
      ring3d($("#ringStage"), M.length);
      const showPast = i => { $("#pastGrid").innerHTML = past[i].members.map(m => `
        <article class="p-card">${photoBlock(m)}<div class="p-body"><span class="eyebrow">${esc(m.role)}</span><h3 style="font-size:1.7rem" class="${m.name ? "" : "tba"}">${esc(m.name || "To be added")}</h3><p>${esc(m.intro || "Intro to be added.")}</p>
        ${m.instagram ? `<a class="mini" style="justify-self:start" href="${esc(insta(m.instagram))}" target="_blank" rel="noopener">${esc(handle(m.instagram))}</a>` : ""}</div></article>`).join(""); };
      $("#pastTabs").addEventListener("click", e => { const b = e.target.closest("[data-p]"); if (!b) return; $$("#pastTabs .chip").forEach(x => x.classList.toggle("on", x === b)); showPast(+b.dataset.p); });
      if (past.length) showPast(0);
    },

    gallery() {
      const G = S.gallery; let f = "All";
      const tags = ["All", ...new Set(G.map(g => g.tag).filter(Boolean))];
      $("#galFilters").innerHTML = tags.map((t, i) => `<button class="chip ${i === 0 ? "on" : ""}" data-g="${esc(t)}">${esc(t)}</button>`).join("");
      let view = [];
      const render = () => { view = G.filter(g => f === "All" || g.tag === f);
        $("#masonry").innerHTML = view.map((g, i) => `<figure class="tile" tabindex="0" role="button" data-i="${i}" aria-label="Open ${esc(g.title)}"><img src="${esc(g.src)}" alt="${esc(g.title)}" loading="lazy"><figcaption><span>${esc(g.tag)}</span><b>${esc(g.title)}</b></figcaption></figure>`).join(""); };
      const list = () => view.map(g => ({ src: g.src, title: g.title, meta: g.tag }));
      $("#galFilters").addEventListener("click", e => { const b = e.target.closest("[data-g]"); if (!b) return; f = b.dataset.g; $$("#galFilters .chip").forEach(x => x.classList.toggle("on", x === b)); render(); });
      $("#masonry").addEventListener("click", e => { const t = e.target.closest(".tile"); if (t) lbOpen(list(), +t.dataset.i); });
      $("#masonry").addEventListener("keydown", e => { const t = e.target.closest(".tile"); if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); lbOpen(list(), +t.dataset.i); } });
      render();
    },

    contact() {
      const K = S.committee;
      $("#contactBody").innerHTML = `
        <div class="contact-grid">
          <div>
            <h2 class="sub-h">Reach Art Circle</h2>
            <div class="c-card">
              <div class="c-row"><span>Instagram</span><a href="${esc(insta(K.instagram))}" target="_blank" rel="noopener">${esc(handle(K.instagram))} ↗</a></div>
              <div class="c-row"><span>Email</span>${K.email ? `<button class="mini" data-copy="${esc(K.email)}" data-label="Email">${esc(K.email)} · copy</button>` : `<b class="tba">To be added</b>`}</div>
              <div class="c-row"><span>Address</span><a href="${esc(K.mapLink)}" target="_blank" rel="noopener" style="max-width:34ch">${esc(K.address)} ↗</a></div>
            </div>
            <h3 class="eyebrow" style="margin:34px 0 14px">Council</h3>
            <div class="people">${S.core.current.members.map(p => personCard(p)).join("")}</div>
          </div>
          <div>
            <h2 class="sub-h">Find the clubs</h2>
            <div class="handles">${S.clubs.map(c => `
              <a class="handle" href="${esc(insta(c.instagram))}" target="_blank" rel="noopener" style="--c:${c.color}">
                <img src="${esc(c.logo)}" alt="" style="background:${c.logoBg}"><div><b>${esc(c.fullName || c.name)}</b><small>${esc(handle(c.instagram))}</small></div></a>`).join("")}</div>
          </div>
        </div>`;
    }
  };

  function renderClub(id) {
    const c = CLUBS[id]; const i = S.clubs.indexOf(c);
    const prev = S.clubs[(i - 1 + S.clubs.length) % S.clubs.length], next = S.clubs[(i + 1) % S.clubs.length];
    const evs = S.events.filter(e => e.club === id);
    const page = $("#page-club");
    page.className = `page club-page theme-${id} on`;
    page.style.setProperty("--c", c.color);
    $("#clubHeadIn").innerHTML = `
      <div class="cl-logo" style="background:${c.logoBg}"><img src="${esc(c.logo)}" alt="${esc(c.name)} logo"></div>
      <div><a class="back" href="#clubs">← All clubs</a><h1>${esc(c.fullName || c.name)}</h1><p class="cl-kind">${esc(c.kind)}</p></div>`;
    $("#clubBody").innerHTML = `
      <div class="club-layout">
        <div>
          <div class="block"><p class="eyebrow">About</p><p class="lead" style="margin-top:12px;max-width:60ch">${esc(c.about)}</p>
            <div class="club-btns">
              ${c.instagram ? `<a class="btn btn-club" href="${esc(insta(c.instagram))}" target="_blank" rel="noopener">Instagram · ${esc(handle(c.instagram))} ↗</a>` : ""}
              ${c.website ? `<a class="btn btn-club-line" href="${esc(c.website)}" target="_blank" rel="noopener">Website · ${esc(c.website.replace(/^https?:\/\//, "").replace(/\/$/, ""))} ↗</a>` : ""}
            </div></div>
          <div class="block"><p class="eyebrow" style="margin-bottom:16px">Events at Bharatiyam ${esc(S.bharatiyam.lastEdition)}</p>
            ${evs.length ? `<div class="ev-grid">${evs.map(eventCard).join("")}</div>` : `<p class="empty-note">Events will be listed here.</p>`}</div>
          <div class="block"><p class="eyebrow" style="margin-bottom:16px">Faculty</p><div class="people">${(c.faculty || []).map(p => personCard(p)).join("")}</div></div>
          <div class="block"><p class="eyebrow" style="margin-bottom:16px">Club heads</p><div class="people">${c.heads.map(h => personCard(h)).join("")}</div></div>
        </div>
        <aside class="side-card">
          <h3>Connect with ${esc(c.name)}</h3>
          <div class="side-row"><span>Instagram</span>${c.instagram ? `<a href="${esc(insta(c.instagram))}" target="_blank" rel="noopener">${esc(handle(c.instagram))} ↗</a>` : `<b class="tba">To be added</b>`}</div>
          ${c.website ? `<div class="side-row"><span>Website</span><a href="${esc(c.website)}" target="_blank" rel="noopener">${esc(c.website.replace(/^https?:\/\//, "").replace(/\/$/, ""))} ↗</a></div>` : ""}
          <div class="side-row"><span>Email</span>${c.email ? `<button class="mini" data-copy="${esc(c.email)}" data-label="Email">${esc(c.email)}</button>` : `<b class="tba">To be added</b>`}</div>
          <div class="side-row"><span>Part of</span><a href="#about">Art Circle</a></div>
        </aside>
      </div>
      <div class="block members-block" id="clubMembers"></div>
      <nav class="club-nav" aria-label="Other clubs"><a href="#club-${prev.id}"><small>← Previous</small><b>${esc(prev.fullName || prev.name)}</b></a><a href="#club-${next.id}"><small>Next →</small><b>${esc(next.fullName || next.name)}</b></a></nav>`;
    clubFx.start(id, c.color);
    renderMembers(id);
  }

  const clubFx = (() => {
    const cv = $("#clubFx"), x = cv.getContext("2d"), head = $("#clubHead");
    let W = 0, H = 0, dpr = 1, theme = null, items = [], t0 = 0, mouse = { x: .5, y: .5 };
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = head.clientWidth; H = head.clientHeight; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
    new ResizeObserver(() => { size(); if (theme) seed(); }).observe(head);
    head.addEventListener("pointermove", e => { const r = head.getBoundingClientRect(); mouse.x = (e.clientX - r.left) / r.width; mouse.y = (e.clientY - r.top) / r.height; head.style.setProperty("--sx", (mouse.x * 100) + "%"); });
    const R = (a, b) => a + Math.random() * (b - a);
    function seed() {
      items = [];
      if (theme === "malang") { for (let i = 0; i < Math.round(W * H / 2600); i++) items.push({ x: R(0, W), y: R(0, H), r: R(.3, 1.6), p: R(0, 6.3), s: R(.6, 2) }); }
      if (theme === "lc") { const ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZअआकखगशब्दकविता&?!;"; for (let i = 0; i < 34; i++) items.push({ x: R(0, W), y: R(0, H), ch: ch[Math.floor(Math.random() * ch.length)], s: R(14, 34), v: R(.15, .45), a: R(-.4, .4), o: R(.08, .22) }); }
      if (theme === "raqs") { for (let i = 0; i < 60; i++) items.push({ x: R(0, W), y: R(0, H), r: R(1, 3), v: R(.2, .7), p: R(0, 6.3) }); }
      if (theme === "rhapsody") { for (let i = 0; i < 40; i++) items.push({ x: R(0, W), y: R(0, H), r: R(.5, 1.8), v: R(.05, .2), p: R(0, 6.3) }); }
      if (theme === "malhaar") { for (let i = 0; i < 9; i++) items.push({ y: H * (.25 + i * .07), amp: 0, ph: R(0, 6.3) }); items.notes = []; }
      if (theme === "vaaqif") { items.bars = Array.from({ length: Math.ceil(W / 18) }, () => R(.1, .5)); items.hit = 0; }
    }
    function frame(now) {
      if (current === "club" && theme) {
        const t = (now - t0) / 1000; x.clearRect(0, 0, W, H);
        if (theme === "malang") {
          items.forEach(s => { const a = .35 + .65 * Math.abs(Math.sin(t * s.s + s.p)); x.globalAlpha = a; x.fillStyle = "#fff"; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 7); x.fill(); });
          const near = items.filter(s => Math.hypot(s.x - mouse.x * W, s.y - mouse.y * H) < 140).slice(0, 7);
          x.globalAlpha = .35; x.strokeStyle = "#e8338a"; x.lineWidth = 1; x.beginPath(); near.forEach((s, i) => i ? x.lineTo(s.x, s.y) : x.moveTo(s.x, s.y)); x.stroke();
          const sp = (t % 7) / 1.2; if (sp < 1 && !reduce) { const sx = W * .2 + sp * W * .5, sy = H * .1 + sp * H * .3; const g = x.createLinearGradient(sx - 120, sy - 50, sx, sy); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(255,255,255,.9)"); x.globalAlpha = 1 - sp; x.strokeStyle = g; x.lineWidth = 2; x.beginPath(); x.moveTo(sx - 120, sy - 50); x.lineTo(sx, sy); x.stroke(); }
        }
        if (theme === "lc") {
          x.fillStyle = "#16110c";
          items.forEach(l => { l.y -= reduce ? 0 : l.v; if (l.y < -40) { l.y = H + 40; l.x = R(0, W); } x.save(); x.globalAlpha = l.o; x.translate(l.x, l.y); x.rotate(l.a); x.font = `${l.s}px 'Special Elite', 'Courier New', monospace`; x.fillText(l.ch, 0, 0); x.restore(); });
          const yy = H * .82, len = (t * 60) % (W * .6); x.globalAlpha = .5; x.strokeStyle = "#16110c"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(W * .2, yy); x.lineTo(W * .2 + len, yy); x.stroke();
        }
        if (theme === "raqs") {
          for (let b = 0; b < 4; b++) { const ang = Math.sin(t * .6 + b * 1.7) * .5; const bx = W * (.15 + b * .23); x.save(); x.translate(bx, H + 20); x.rotate(ang); const g = x.createLinearGradient(0, 0, 0, -H * 1.2); g.addColorStop(0, "rgba(226,201,154,.32)"); g.addColorStop(1, "rgba(155,93,229,0)"); x.fillStyle = g; x.globalAlpha = 1; x.beginPath(); x.moveTo(-18, 0); x.lineTo(18, 0); x.lineTo(110, -H * 1.2); x.lineTo(-110, -H * 1.2); x.closePath(); x.fill(); x.restore(); }
          items.forEach(s => { s.y -= reduce ? 0 : s.v; if (s.y < -10) { s.y = H + 10; s.x = R(0, W); } const a = .4 + .6 * Math.abs(Math.sin(t * 2 + s.p)); x.globalAlpha = a; x.fillStyle = "#e2c99a"; star4(s.x, s.y, s.r * 2.2); });
        }
        if (theme === "rhapsody") {
          items.forEach(d => { d.y += reduce ? 0 : d.v; d.x += Math.sin(t + d.p) * .2; if (d.y > H) { d.y = 0; d.x = R(0, W); } const dist = Math.hypot(d.x - mouse.x * W, d.y - H * .7); x.globalAlpha = Math.max(0, .7 - dist / 400); x.fillStyle = "#ffe6be"; x.beginPath(); x.arc(d.x, d.y, d.r, 0, 7); x.fill(); });
        }
        if (theme === "malhaar") {
          items.forEach((s, i) => { const my = mouse.y * H; if (Math.abs(my - s.y) < 10) s.amp = Math.min(14, s.amp + 4); s.amp *= .96;
            x.globalAlpha = .55; x.strokeStyle = i % 3 === 0 ? "#1fb5a8" : "#121212"; x.lineWidth = i % 3 === 0 ? 1.6 : 1; x.beginPath();
            for (let px = 0; px <= W; px += 8) { const env = Math.sin(px / W * Math.PI); const yv = s.y + Math.sin(px * .05 + t * 18 + s.ph) * s.amp * env + Math.sin(px * .01 + t + i) * 1.5; px ? x.lineTo(px, yv) : x.moveTo(px, yv); } x.stroke(); });
          if (!reduce && Math.random() < .03) items.notes.push({ x: R(W * .4, W), y: H, v: R(.4, 1), ch: Math.random() < .5 ? "♪" : "♫", o: 1 });
          items.notes.forEach(n => { n.y -= n.v; n.o -= .003; x.globalAlpha = Math.max(0, n.o) * .5; x.fillStyle = "#121212"; x.font = "26px serif"; x.fillText(n.ch, n.x, n.y); }); items.notes = items.notes.filter(n => n.o > 0);
        }
        if (theme === "vaaqif") {
          const beat = (t * 2) % 1; const kick = Math.pow(1 - beat, 3);
          const cx = W * .78, cy = H * .5; for (let r = 1; r <= 5; r++) { x.globalAlpha = .12 + kick * .25 / r; x.strokeStyle = "#9fb4bd"; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, r * Math.min(W, H) * .09 * (1 + kick * .05), 0, 7); x.stroke(); }
          const bw = 18; items.bars.forEach((v, i) => { const target = .08 + Math.abs(Math.sin(i * .35 + t * 3)) * .25 + kick * .3 * Math.random(); items.bars[i] += (target - v) * .25; const h = items.bars[i] * H * .5; x.globalAlpha = .35; x.fillStyle = i % 7 === 0 ? "#ffffff" : "#9fb4bd"; x.fillRect(i * bw + 3, H - h, bw - 6, h); });
        }
        x.globalAlpha = 1;
      }
      requestAnimationFrame(frame);
    }
    function star4(px, py, r) { x.beginPath(); x.moveTo(px, py - r); x.quadraticCurveTo(px, py, px + r, py); x.quadraticCurveTo(px, py, px, py + r); x.quadraticCurveTo(px, py, px - r, py); x.quadraticCurveTo(px, py, px, py - r); x.fill(); }
    requestAnimationFrame(frame);
    return { start(id) { theme = null; size(); theme = id; seed(); t0 = performance.now(); } };
  })();

  let mandalaOn = false;
  function initMandala() {
    if (mandalaOn) return; mandalaOn = true;
    const wrap = $("#mandalaWrap"), cv = $("#mandala"), x = cv.getContext("2d"), orbit = $("#orbit"), logo = $("#logo3d");
    orbit.innerHTML = S.clubs.map(c => `<a class="orb" href="#club-${c.id}" style="background:${c.logoBg}" aria-label="${esc(c.fullName || c.name)}" data-name="${esc(c.fullName || c.name)}"><img src="${esc(c.badge || c.logo)}" alt=""${c.badgeFit === "cover" ? ' style="object-fit:cover;padding:0"' : ""}></a>`).join("") + `<span class="orb-label" id="orbLabel"></span>`;
    const orbs = $$(".orb", orbit), label = $("#orbLabel");
    let W = 0, dpr = 1, paused = false, hoverI = -1, t0 = performance.now(), tilt = { x: 0, y: 0 };
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = wrap.clientWidth; cv.width = W * dpr; cv.height = W * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); new ResizeObserver(size).observe(wrap);
    const showL = (o, i) => { paused = true; hoverI = i; label.textContent = o.dataset.name; label.classList.add("show"); };
    const hideL = () => { paused = false; hoverI = -1; label.classList.remove("show"); };
    orbs.forEach((o, i) => { o.addEventListener("pointerenter", () => showL(o, i)); o.addEventListener("pointerleave", hideL); o.addEventListener("focus", () => showL(o, i)); o.addEventListener("blur", hideL); });
    $(".hero").addEventListener("pointermove", e => { const r = wrap.getBoundingClientRect(); tilt.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - .5) * 2)); tilt.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - .5) * 2));
      logo.style.setProperty("--ry", (tilt.x * 16) + "deg"); logo.style.setProperty("--rx", (-tilt.y * 16) + "deg"); logo.style.setProperty("--gx", (30 + tilt.x * 30) + "%"); logo.style.setProperty("--gy", (18 + tilt.y * 30) + "%"); });
    $(".hero").addEventListener("pointerleave", () => { tilt.x = tilt.y = 0; ["--rx", "--ry"].forEach(v => logo.style.setProperty(v, "0deg")); });

    const COL = { petal: "#e88a2e", petal2: "#efab4a", deep: "#cf4a1f", line: "#8a3a10", dark: "#1b1006" };
    function petals(R, n, len, wid, rot, fill, stroke, inner) {
      x.save(); x.rotate(rot);
      for (let i = 0; i < n; i++) {
        x.rotate(Math.PI * 2 / n);
        x.beginPath(); x.moveTo(R, -wid); x.quadraticCurveTo(R + len * .55, -wid * 1.15, R + len, 0); x.quadraticCurveTo(R + len * .55, wid * 1.15, R, wid); x.closePath();
        x.fillStyle = fill; x.fill(); x.lineWidth = 1.4; x.strokeStyle = stroke; x.stroke();
        if (inner) { x.beginPath(); x.moveTo(R + len * .12, 0); x.quadraticCurveTo(R + len * .5, -wid * .55, R + len * .82, 0); x.quadraticCurveTo(R + len * .5, wid * .55, R + len * .12, 0); x.strokeStyle = stroke; x.lineWidth = 1; x.stroke(); }
      }
      x.restore();
    }
    function dots(R, n, r, col, rot) { x.save(); x.rotate(rot); x.fillStyle = col; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; x.beginPath(); x.arc(Math.cos(a) * R, Math.sin(a) * R, r, 0, 7); x.fill(); } x.restore(); }
    function ring(R, w, col) { x.beginPath(); x.arc(0, 0, R, 0, 7); x.lineWidth = w; x.strokeStyle = col; x.stroke(); }
    let orbitA = 0, last = performance.now();
    function frame(now) {
      if (current === "home") {
        const dt = Math.min(50, now - last); const t = (now - t0) / 1000;
        const bloom = reduce ? 1 : Math.max(.001, Math.min(1, t / 1.6)); const e = 1 - Math.pow(1 - bloom, 3);
        const c = W / 2, R = W * .42 * e, spin = reduce ? 0 : t * .04;
        x.clearRect(0, 0, W, W); x.save(); x.translate(c + tilt.x * 6, c + tilt.y * 6);
        petals(R * .78, 20, R * .26, R * .095, spin, COL.petal, COL.line, true);
        petals(R * .70, 20, R * .22, R * .07, spin + Math.PI / 20, COL.petal2, COL.line, false);
        ring(R * .70, 2, COL.line);
        dots(R * .655, 48, R * .012, COL.deep, -spin);
        petals(R * .50, 16, R * .16, R * .07, -spin * 1.4, COL.deep, COL.line, true);
        ring(R * .50, 2, COL.line);
        dots(R * 1.08, 60, R * .014, COL.deep, spin * .6);
        x.beginPath(); x.arc(0, 0, R * .48, 0, 7); x.fillStyle = COL.dark; x.fill();
        x.restore();
        if (!paused && !reduce) orbitA += dt * .00012;
        const oR = W * .43, bw = orbs[0]?.offsetWidth || 0;
        orbs.forEach((o, i) => { const a = orbitA + i / orbs.length * Math.PI * 2 - Math.PI / 2; const ox = c + Math.cos(a) * oR * e - bw / 2, oy = c + Math.sin(a) * oR * e - bw / 2;
          o.style.transform = `translate(${ox}px,${oy}px) scale(${hoverI === i ? 1.15 : 1})`; o.style.opacity = e;
          if (hoverI === i) { label.style.left = (ox + bw / 2) + "px"; label.style.top = oy + "px"; } });
      }
      last = now; requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function ring3d(stage, n) {
    const ring = $(".ring", stage), cards = $$(".r-card", ring), step = 360 / n;
    let rot = 0, vel = 0, R = 300, lastX = null, hovering = null, front = -1;
    // cards orbit on a tilted ellipse and always face the viewer, so every member stays readable
    const layout = () => { const w = cards[0].offsetWidth; R = Math.min(stage.clientWidth * .36, Math.max(w * 1.25, n * w * .32)); };
    layout(); new ResizeObserver(layout).observe(stage);
    stage.addEventListener("pointermove", e => {
      if (e.pointerType === "mouse" || e.pointerType === "pen") {
        if (lastX !== null && !hovering) vel += (e.clientX - lastX) * .05;
        lastX = e.clientX;
      }
    });
    stage.addEventListener("pointerleave", () => { lastX = null; });
    let tx = null;
    stage.addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchmove", e => { if (tx === null) return; const nx = e.touches[0].clientX; vel += (nx - tx) * .1; tx = nx; }, { passive: true });
    stage.addEventListener("touchend", () => { tx = null; });
    cards.forEach(c => {
      c.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") hovering = c; });
      c.addEventListener("pointerleave", () => { if (hovering === c) hovering = null; });
      c.addEventListener("click", () => { const on = !c.classList.contains("show"); cards.forEach(k => k.classList.remove("show")); c.classList.toggle("show", on); });
      c.addEventListener("focus", () => { hovering = c; c.classList.add("show"); });
      c.addEventListener("blur", () => { hovering = null; c.classList.remove("show"); });
    });
    (function frame() {
      if (current === "team") {
        if (hovering) vel *= .8;
        else { rot += vel; vel *= .92; if (!reduce && Math.abs(vel) < .02) rot += .08; }
        let best = 0, bestZ = -9;
        cards.forEach((c, i) => {
          const a = (i * step + rot) * Math.PI / 180;
          const px = Math.sin(a) * R, pz = Math.cos(a);           
          const sc = .62 + .38 * (pz + 1) / 2;
          const py = -pz * 64;                                    
          c.style.transform = `translate3d(${px}px, ${py}px, ${pz * 120}px) rotateY(${-Math.sin(a) * 18}deg) scale(${sc})`;
          c.style.zIndex = Math.round((pz + 1) * 100);
          c.style.opacity = (.45 + .55 * (pz + 1) / 2).toFixed(3);
          c.style.filter = pz < 0 ? `brightness(${(.55 + .45 * (pz + 1)).toFixed(2)})` : "";
          if (pz > bestZ) { bestZ = pz; best = i; }
        });
        if (best !== front) { if (front >= 0) cards[front].classList.remove("front"); cards[best].classList.add("front"); front = best; }
      }
      requestAnimationFrame(frame);
    })();
  }

  (function ambient() {
    const cs = $("#fxStars"), xs = cs.getContext("2d"); let W, H, dpr, stars = [];
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cs.width = W * dpr; cs.height = H * dpr; xs.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.round(W * H / 9000) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + .3, p: Math.random() * 6.3, s: Math.random() * 1.5 + .4, warm: Math.random() < .3 })); };
    size(); addEventListener("resize", size);
    const cp = $("#fxSparks"), xp = cp.getContext("2d"); let sparks = [];
    const sizeP = () => { cp.width = innerWidth * dpr; cp.height = innerHeight * dpr; xp.setTransform(dpr, 0, 0, dpr, 0, 0); };
    sizeP(); addEventListener("resize", sizeP);
    if (finePointer && !reduce) {
      let lt = 0;
      addEventListener("pointermove", e => { const now = performance.now(); if (now - lt < 28) return; lt = now;
        sparks.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - .5) * .8, vy: Math.random() * .6 + .2, life: 1, r: Math.random() * 2 + 1.2, c: Math.random() < .5 ? "#f0c75a" : "#e88a2e" });
        if (sparks.length > 60) sparks.shift(); }, { passive: true });
    }
    function star4(x, px, py, r) { x.beginPath(); x.moveTo(px, py - r); x.quadraticCurveTo(px, py, px + r, py); x.quadraticCurveTo(px, py, px, py + r); x.quadraticCurveTo(px, py, px - r, py); x.quadraticCurveTo(px, py, px, py - r); x.fill(); }
    (function frame(now) {
      const t = (now || 0) / 1000;
      xs.clearRect(0, 0, W, H);
      stars.forEach(s => { xs.globalAlpha = (reduce ? .5 : .2 + .6 * Math.abs(Math.sin(t * s.s + s.p))) * .8; xs.fillStyle = s.warm ? "#f0c75a" : "#fff4dc"; xs.beginPath(); xs.arc(s.x, s.y, s.r, 0, 7); xs.fill(); });
      xp.clearRect(0, 0, innerWidth, innerHeight);
      sparks.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= .025; xp.globalAlpha = Math.max(0, p.life); xp.fillStyle = p.c; star4(xp, p.x, p.y, p.r * (1 + p.life)); });
      sparks = sparks.filter(p => p.life > 0);
      requestAnimationFrame(frame);
    })();
  })();

  (function footer() {
    const K = S.committee;
    $("#footer").innerHTML = `
      <div class="foot-brand"><a class="brand" href="#home"><img src="assets/logo.png" alt=""><span>Art Circle</span></a>
        <p>The cultural committee of ${esc(K.college)}. Conducting Bharatiyam, the annual techno-cultural fest.</p>
        <a class="mini" style="justify-self:start" href="${esc(insta(K.instagram))}" target="_blank" rel="noopener">${esc(handle(K.instagram))} ↗</a></div>
      <div class="foot-col"><h4>Explore</h4><ul>${PAGES.filter(p => p !== "home").map(p => `<li><a href="#${p}">${esc(TITLES[p])}</a></li>`).join("")}</ul></div>
      <div class="foot-col"><h4>Clubs</h4><ul>${S.clubs.map(c => `<li><a href="${esc(insta(c.instagram))}" target="_blank" rel="noopener">${esc(c.fullName || c.name)}</a></li>`).join("")}</ul></div>
      <div class="foot-col"><h4>Contact</h4><ul>
        <li>${K.email ? `<button class="mini" data-copy="${esc(K.email)}" data-label="Email">${esc(K.email)}</button>` : `<span>Email to be added</span>`}</li>
        <li><a href="${esc(K.mapLink)}" target="_blank" rel="noopener">${esc(K.address)}</a></li></ul></div>`;
    $("#footCopy").textContent = `© ${new Date().getFullYear()} Art Circle · ${K.shortCollege}`;
  })();
  document.addEventListener("error", e => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    const tile = img.closest(".tile, .fan-card");
    if (tile) { tile.remove(); return; }
    const thumb = img.closest(".slot-thumb");
    if (thumb) { thumb.removeAttribute("data-zoom"); thumb.classList.add("noimg"); thumb.innerHTML = "✺"; return; }
    const ev = img.closest(".ev-poster");
    if (ev) { const card = ev.closest(".ev-card"); const t = card?.querySelector("h4")?.textContent || ""; const sub = card?.querySelector("small")?.textContent || ""; const box = document.createElement("div"); box.className = "ev-poster noimg"; box.innerHTML = `<div><b>${esc(t)}</b><span>${esc(sub)}</span></div>`; ev.replaceWith(box); return; }
    const hl = img.closest(".hl");
    if (hl) { hl.removeAttribute("data-zoom"); hl.classList.add("noimg"); img.remove(); return; }
    if (img.classList.contains("bh-poster")) { img.closest("button")?.remove(); }
  }, true);

  go(true);
})();