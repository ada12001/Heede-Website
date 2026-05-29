/* =============================================================================
   HEEDE CRANES — Homepage logic (vanilla recreation of the website UI kit)
   Ports data.js + the kit's components into plain DOM rendering. No framework.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- DATA ---------------------------------------------------------------- */
  const A = 'assets/photos/';
  const PHOTOS = {
    hero: A + 'tower-crane.jpg',
    sunrise: A + 'sunrise-aerial.jpg',
    houstonPano: A + 'houston-pano.jpg',
    lc750: A + 'lc750.jpg',
    lc500: A + 'lc500.jpg',
    cityCrane: A + 'city-crane.jpg',
    luffing: A + 'luffing.jpg',
    cltAirport: A + 'clt-airport.jpg',
    toronto: A + 'toronto-550.jpg',
    independent: A + 'the-independent.jpg',
    harborBridge: A + 'harbor-bridge.png',
  };

  // Build a plausible decreasing load-vs-radius capacity curve.
  function curve(maxLoad, maxRadius, tipLoad) {
    const pts = [];
    const steps = 7;
    for (let i = 0; i <= steps; i++) {
      const r = Math.round((maxRadius / steps) * i);
      const t = i / steps;
      const load = +(maxLoad * Math.pow(tipLoad / maxLoad, t)).toFixed(1);
      pts.push({ r: Math.max(r, 2.5), load });
    }
    return pts;
  }

  const FLEET = [
    { id: 'lc290', series: '300', cat: 'Flat-Top', name: 'LC 290', maxCap: 18, maxJib: 71.5, tipLoad: 2.0, freeHeight: 51.7, status: 'in-service',
      blurb: 'Compact flat-top for tight urban infill and mid-rise concrete.' },
    { id: 'lc335', series: '300', cat: 'Flat-Top', name: 'LC 335', maxCap: 24, maxJib: 75, tipLoad: 2.4, freeHeight: 54.3, status: 'in-service',
      blurb: 'Workhorse of the 300 line — versatile reach for commercial builds.' },
    { id: 'lc400', series: '400', cat: 'Flat-Top', name: 'LC 400', maxCap: 24, maxJib: 80, tipLoad: 3.0, freeHeight: 60.1, status: 'reserved',
      blurb: 'Long-jib flat-top with strong tip loads for sprawling footprints.' },
    { id: 'lc450', series: '400', cat: 'Flat-Top', name: 'LC 450', maxCap: 32, maxJib: 80, tipLoad: 3.6, freeHeight: 61.4, status: 'in-service',
      blurb: 'Heavier picks without sacrificing the 400-series reach.' },
    { id: 'lc550', series: '500', cat: 'Flat-Top', name: 'LC 550', maxCap: 64, maxJib: 80, tipLoad: 12.5, freeHeight: 65.0, status: 'in-service',
      blurb: 'High-capacity flat-top for heavy precast and structural steel.' },
    { id: 'lc750', series: '700', cat: 'Flat-Top', name: 'LC 750', maxCap: 64, maxJib: 85, tipLoad: 13.2, freeHeight: 69.2, status: 'in-transit',
      blurb: 'Top of the range — maximum capacity for the most demanding lifts.' },
    { id: 'lc140', series: 'City', cat: 'City', name: 'LC 140', maxCap: 8, maxJib: 50, tipLoad: 1.3, freeHeight: 33.4, status: 'in-service',
      blurb: 'Quick-erect city crane for low-rise and renovation jobsites.' },
    { id: 'lc1060', series: 'City', cat: 'City', name: 'LC 1060', maxCap: 10, maxJib: 55, tipLoad: 1.6, freeHeight: 40.8, status: 'in-service',
      blurb: 'Fast assembly, small footprint, ideal for downtown lots.' },
    { id: 'lcl310', series: 'Luffing', cat: 'Luffing', name: 'LCL 310', maxCap: 18, maxJib: 55, tipLoad: 3.1, freeHeight: 48.0, status: 'reserved',
      blurb: 'Luffing jib for restricted airspace and over-sailing constraints.' },
    { id: 'lcl700', series: 'Luffing', cat: 'Luffing', name: 'LCL 700', maxCap: 48, maxJib: 60, tipLoad: 7.0, freeHeight: 55.5, status: 'in-service',
      blurb: 'Heavy luffer for dense city centers with tight slew radii.' },
  ].map(m => ({
    ...m,
    curve: curve(m.maxCap, m.maxJib, m.tipLoad),
    photo: ({ lc290: 'lc750', lc335: 'toronto', lc400: 'lc750', lc450: 'toronto', lc550: 'hero', lc750: 'lc750',
      lc140: 'cityCrane', lc1060: 'cityCrane', lcl310: 'luffing', lcl700: 'luffing' })[m.id],
  }));

  const SERIES = ['All', '300', '400', '500', '700', 'City', 'Luffing'];

  const STATUS = {
    'in-service': { label: 'In Service', color: '#2E9E5B' },
    'reserved':   { label: 'Reserved',   color: '#E08A1E' },
    'in-transit': { label: 'In Transit', color: '#C5402F' },
  };

  const CAPABILITIES = [
    { icon: 'hard-hat', title: 'Erection', text: 'Heede crews assemble every crane on your site — climbing, jumping, and tie-ins included.' },
    { icon: 'wrench', title: 'Service & Parts', text: 'Factory-trained technicians and a stocked parts inventory keep the fleet turning, on call.' },
    { icon: 'truck', title: 'Freight', text: 'We coordinate the heavy haul in and out, permits and routing handled end to end.' },
    { icon: 'arrow-down', title: 'Dismantle', text: 'Safe, scheduled tear-down and demob the moment your structure tops out.' },
    { icon: 'shield-check', title: 'Safety', text: 'A safety-first mindset on every lift, led by a dedicated Director of Safety.' },
    { icon: 'users', title: 'Operators', text: 'Certified tower crane operators — Heede employees, not subcontractors.' },
  ];

  const PROJECTS = [
    { title: 'The Independent', loc: 'Austin, TX', crane: 'LCL 310', photo: 'independent', tag: 'Residential' },
    { title: 'CLT Airport Expansion', loc: 'Charlotte, NC', crane: 'LC 550', photo: 'cltAirport', tag: 'Aviation' },
    { title: 'New Harbor Bridge', loc: 'Corpus Christi, TX', crane: 'LC 750', photo: 'harborBridge', tag: 'Infrastructure' },
    { title: 'Waterfront Residences', loc: 'Toronto, ON', crane: 'LC 550', photo: 'toronto', tag: 'Residential' },
    { title: 'Montrose Mid-Rise', loc: 'Houston, TX', crane: 'LC 290', photo: 'sunrise', tag: 'Mixed-Use' },
    { title: 'Museum District Tower', loc: 'Houston, TX', crane: 'LC 550', photo: 'houstonPano', tag: 'Commercial' },
  ];

  const TIMELINE = [
    { year: '1958', text: 'Thomas Kenna buys his first tower crane — a Linden L30/60 — for his concrete formwork business.' },
    { year: '1962', text: 'Becomes the dealer for B.M. Heede in the Southeast.' },
    { year: '1980s', text: 'First tower crane company in the U.S. to offer fully turnkey rental packages.' },
    { year: '1990s', text: 'Forms its distributor relationship with Linden Comansa of Spain.' },
    { year: 'Today', text: 'A Kenna-family business and one of the largest tower crane fleets in the Southeast, with a Texas (Lonestar) division.' },
  ];

  const TEAM = [
    { name: 'Dennis Kenna', role: 'President', bio: 'Has led Heede for two decades, with 40+ years of international industry experience guiding the company’s growth across the Southeast.' },
    { name: 'Mike Kenna', role: 'Director of Operations', bio: '20+ years following the family legacy on tower cranes worldwide; hands-on leadership driving top-quality workmanship and a safety-first mindset.' },
    { name: 'Jason Kenna', role: 'VP — National Sales', bio: 'A proven leader on complex projects, delivering on-time, below-budget solutions and consistent market growth over 15+ years.' },
    { name: 'Paul Kenna', role: 'Division Manager — Lonestar', bio: 'Began in operations and moved to sales; delivers cost-effective, turnkey tower crane solutions across the Texas market.' },
    { name: 'Drew Schlegel', role: 'Sales Manager — Lonestar', bio: 'Spearheaded Heede’s Texas expansion over a decade ago; unmatched familiarity with the market means sharp problem-solving for customers.' },
    { name: 'Kellye Dailey', role: 'Director of Safety', bio: 'Twenty years across safety, risk, compliance and claims in construction and utilities, keeping every Heede jobsite safe.' },
    { name: 'Mickey Chandler', role: 'Ops Manager / Operator Coordinator', bio: '15+ years at Heede — began as a tower crane operator before moving into management, giving a practical, field-tested perspective.' },
  ];

  const STATS = [
    { v: '65', suffix: '+', k: 'Years Operating' },
    { v: '200', suffix: '+', k: 'Cranes in Fleet' },
    { v: '4', suffix: '', k: 'Kenna Generations' },
    { v: '2', suffix: '', k: 'Regional Divisions' },
  ];

  // Linear-interpolate a model's safe load (t) at a working radius (m).
  function capAtRadius(model, r) {
    const c = model.curve;
    if (r > model.maxJib) return 0;
    if (r <= c[0].r) return c[0].load;
    for (let i = 1; i < c.length; i++) {
      if (r <= c[i].r) {
        const a = c[i - 1], b = c[i];
        const t = (r - a.r) / (b.r - a.r);
        return a.load + t * (b.load - a.load);
      }
    }
    return c[c.length - 1].load;
  }

  /* ---- helpers ------------------------------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const icons = () => { if (window.lucide) window.lucide.createIcons(); };
  const IMG_ERR = 'onerror="this.style.display=\'none\'"';

  function statusChip(status, onDark) {
    const s = STATUS[status];
    const bg = onDark ? 'rgba(255,255,255,.10)' : s.color + '1a';
    const col = onDark ? '#fff' : s.color;
    return `<span class="hd-status" style="background:${bg};color:${col}">
      <span class="hd-status__dot" style="background:${s.color}"></span>${s.label}</span>`;
  }

  function initials(name) { return name.split(' ').map(w => w[0]).slice(0, 2).join(''); }
  function monogram(name, size) {
    return `<div class="hd-monogram" style="width:${size}px;height:${size}px">
      <span style="font-size:${Math.round(size * 0.42)}px">${initials(name)}</span></div>`;
  }

  /* ---- fleet --------------------------------------------------------------- */
  let fleetFilter = 'All';

  function spec(k, v, u) {
    return `<div><div class="hd-spec__k">${k}</div><div class="hd-spec__v">${v}<span class="u">${u}</span></div></div>`;
  }
  function craneCard(m) {
    return `<button class="hd-crane" data-crane="${m.id}">
      <div class="hd-crane__media">
        <img class="hd-crane__img" src="${PHOTOS[m.photo]}" alt="${m.name}" loading="lazy" ${IMG_ERR} />
        <div class="hd-crane__scrim"></div>
        <div class="hd-crane__edge"></div>
        <div class="hd-crane__status">${statusChip(m.status, true)}</div>
        <div class="hd-crane__cat">${m.cat}</div>
      </div>
      <div class="hd-crane__body">
        <div class="hd-crane__series">${m.series} Series</div>
        <div class="hd-crane__name">${m.name}</div>
        <div class="hd-crane__specs">
          ${spec('Max Cap', m.maxCap, 't')}${spec('Jib', m.maxJib, 'm')}${spec('Tip', m.tipLoad, 't')}
        </div>
      </div>
    </button>`;
  }
  function renderFleetFilters() {
    $('[data-fleet-filters]').innerHTML = SERIES.map(s =>
      `<button class="hd-fleet__filter${s === fleetFilter ? ' is-active' : ''}" data-filter="${s}">${s}</button>`).join('');
  }
  function renderFleetGrid() {
    const shown = fleetFilter === 'All' ? FLEET : FLEET.filter(m => m.series === fleetFilter);
    $('[data-fleet-grid]').innerHTML = shown.map(craneCard).join('');
  }

  /* ---- lift planner -------------------------------------------------------- */
  const lp = { load: 12, radius: 45, height: 40 };
  let currentBest = null;
  let currentLiftSummary = '';

  function renderPlanner() {
    const ranked = FLEET.map(m => {
      const cap = capAtRadius(m, lp.radius);
      return { m, cap, ok: cap >= lp.load && lp.radius <= m.maxJib, tieIns: lp.height > m.freeHeight };
    }).sort((a, b) => {
      if (a.ok !== b.ok) return a.ok ? -1 : 1;
      if (a.ok) return a.m.maxCap - b.m.maxCap;
      return b.cap - a.cap;
    });

    const matches = ranked.filter(r => r.ok);
    const best = matches[0] || null;
    const maxCapInView = Math.max(lp.load, ...ranked.map(r => r.cap), 1);
    currentBest = best;
    currentLiftSummary = `Lift plan — ${lp.load.toFixed(1)} t at ${lp.radius} m radius, ${lp.height} m under-hook height.` +
      (best ? ` Recommended crane: ${best.m.name}.` : '');

    $('[data-lp-rows]').innerHTML = ranked.map(({ m, cap, ok, tieIns }) => {
      const pct = Math.min(100, (cap / maxCapInView) * 100);
      const reqPct = Math.min(100, (lp.load / maxCapInView) * 100);
      const outOfReach = lp.radius > m.maxJib;
      const col = outOfReach ? 'var(--fg-on-dark-subtle)'
        : ok ? (tieIns ? 'var(--amber)' : 'var(--signal-go)') : 'var(--fg-on-dark-subtle)';
      const txt = outOfReach ? 'out of reach' : ok ? (tieIns ? '✓ lift · tie-ins' : '✓ can lift') : 'over capacity';
      return `<button class="hd-planner__row${ok ? ' ok' : ''}${best && best.m.id === m.id ? ' best' : ''}" data-crane="${m.id}">
        <div>
          <div class="hd-planner__row-name">${m.name}</div>
          <div class="hd-planner__row-cat">${m.series} · ${m.cat}</div>
        </div>
        <div class="hd-planner__bar">
          <div class="hd-planner__bar-fill${ok ? ' ok' : ''}" style="width:${pct}%"></div>
          <div class="hd-planner__bar-marker" style="left:${reqPct}%" title="Required load"></div>
        </div>
        <div class="hd-planner__cap">
          <div class="hd-planner__cap-n${ok ? '' : ' miss'}">${cap > 0 ? cap.toFixed(1) : '—'}${cap > 0 ? '<span class="u"> t</span>' : ''}</div>
          <div class="hd-planner__cap-status" style="color:${col}">${txt}</div>
        </div>
      </button>`;
    }).join('');

    $('[data-lp-result]').innerHTML = `
      <div class="hd-planner__result-label">Result</div>
      <div class="hd-planner__count"><span class="n${matches.length ? '' : ' none'}">${matches.length}</span> of ${FLEET.length}</div>
      <div class="hd-planner__msg">${matches.length
        ? `cranes can place <b>${lp.load.toFixed(1)} t</b> at <b>${lp.radius} m</b>.`
        : `No single crane covers <b>${lp.load.toFixed(1)} t</b> at <b>${lp.radius} m</b> — talk to an estimator about a larger model or tandem lift.`}</div>
      ${best ? `<button class="hd-planner__rec" data-crane="${best.m.id}">
        <span><span class="hd-planner__rec-k">Recommended · right-sized</span><span class="hd-planner__rec-name">${best.m.name}</span></span>
        <span class="hd-icon" data-lucide="arrow-right" style="width:20px;height:20px"></span></button>` : ''}
      ${best
        ? `<button class="hd-planner__quote" data-quote-lift>Quote this lift <span class="hd-icon" data-lucide="arrow-right" style="width:15px;height:15px"></span></button>`
        : `<button class="hd-planner__quote solo" data-quote-lift>Talk to an estimator <span class="hd-icon" data-lucide="arrow-right" style="width:15px;height:15px"></span></button>`}`;
    icons();
  }

  /* ---- capabilities / projects / heritage / team -------------------------- */
  function renderCapabilities() {
    $('[data-cap-grid]').innerHTML = CAPABILITIES.map((c, i) => `
      <div class="hd-cap__card">
        <div class="hd-cap__num">0${i + 1}</div>
        <div class="hd-cap__icon"><span class="hd-icon" data-lucide="${c.icon}" style="width:24px;height:24px"></span></div>
        <h3 class="hd-cap__title">${c.title}</h3>
        <p class="hd-cap__text">${c.text}</p>
      </div>`).join('');
  }
  function renderProjects() {
    $('[data-proj-grid]').innerHTML = PROJECTS.map((p, i) => `
      <button class="hd-proj" data-project="${i}">
        <img class="hd-proj-img" src="${PHOTOS[p.photo]}" alt="${p.title}" loading="lazy" ${IMG_ERR} />
        <div class="hd-proj__scrim"></div>
        <div class="hd-proj__meta">
          <div>
            <div class="hd-proj__loc">${p.loc}</div>
            <div class="hd-proj__title">${p.title}</div>
          </div>
          <span class="hd-proj__crane">${p.crane}</span>
        </div>
      </button>`).join('');
  }
  function renderHeritage() {
    $('[data-stat-strip]').innerHTML = STATS.map(s => `
      <div class="hd-stat">
        <div class="hd-stat__v">${s.v}<span class="suffix">${s.suffix}</span></div>
        <div class="hd-stat__k">${s.k}</div>
      </div>`).join('');
    $('[data-timeline]').innerHTML = TIMELINE.map(t => `
      <div class="hd-tl"><div class="hd-tl__tick"></div>
        <div class="hd-tl__year">${t.year}</div>
        <p class="hd-tl__text">${t.text}</p></div>`).join('');
  }
  function renderTeam() {
    const lead = TEAM[0], rest = TEAM.slice(1);
    $('[data-team-lead]').innerHTML = `
      <div class="hd-lead-card">
        <div class="hd-lead-card__bar"></div>
        <div class="hd-lead-card__body">
          ${monogram(lead.name, 92)}
          <div class="hd-lead-card__info">
            <div class="hd-lead-card__name">${lead.name}</div>
            <div class="hd-lead-card__role">${lead.role}</div>
            <p class="hd-lead-card__bio">${lead.bio}</p>
          </div>
        </div>
      </div>`;
    $('[data-team-grid]').innerHTML = rest.map(p => `
      <div class="hd-member">
        <div class="hd-member__head">
          ${monogram(p.name, 52)}
          <div>
            <div class="hd-member__name">${p.name}</div>
            <div class="hd-member__role">${p.role}</div>
          </div>
        </div>
        <p class="hd-member__bio">${p.bio}</p>
      </div>`).join('');
  }

  /* ---- model detail overlay (with load chart) ----------------------------- */
  const detailOverlay = $('[data-detail-overlay]');
  const lightboxOverlay = $('[data-lightbox-overlay]');
  const quoteOverlay = $('[data-quote-overlay]');

  function chartSvg(data, maxJib, maxCap) {
    const W = 560, H = 240, padL = 46, padR = 16, padT = 16, padB = 38;
    const xmax = maxJib, ymax = Math.ceil(maxCap / 8) * 8;
    const x = r => padL + (r / xmax) * (W - padL - padR);
    const y = v => H - padB - (v / ymax) * (H - padT - padB);
    const pts = data.map(d => [x(d.r), y(d.load)]);
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const area = line + ` L${x(data[data.length - 1].r).toFixed(1)} ${H - padB} L${padL} ${H - padB} Z`;
    const yticks = [0, ymax / 4, ymax / 2, ymax * 3 / 4, ymax];
    const xticks = data.filter((_, i) => i % 2 === 0);
    const mono = "500 11px 'IBM Plex Mono', monospace";
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">
      <defs><linearGradient id="capfill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F2B705" stop-opacity=".32"/>
        <stop offset="100%" stop-color="#F2B705" stop-opacity="0"/></linearGradient></defs>
      ${yticks.map((t, i) => `<line x1="${padL}" x2="${W - padR}" y1="${y(t)}" y2="${y(t)}" stroke="rgba(255,255,255,.12)" stroke-width="1"${i ? ' stroke-dasharray="2 4"' : ''}/>
        <text x="${padL - 8}" y="${y(t) + 4}" text-anchor="end" fill="#AEB6C8" style="font:${mono}">${t}</text>`).join('')}
      ${xticks.map(d => `<text x="${x(d.r)}" y="${H - padB + 18}" text-anchor="middle" fill="#AEB6C8" style="font:${mono}">${d.r}</text>`).join('')}
      <path d="${area}" fill="url(#capfill)"/>
      <path d="${line}" fill="none" stroke="#F2B705" stroke-width="2.5" stroke-linejoin="round"/>
      ${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#09163A" stroke="#F2B705" stroke-width="2"/>`).join('')}
      <text x="${W - padR}" y="${H - 6}" text-anchor="end" fill="#7E8696" style="font:500 10px 'IBM Plex Mono',monospace;letter-spacing:.1em">RADIUS (m) →</text>
      <text x="${padL - 38}" y="${padT + 6}" fill="#7E8696" style="font:500 10px 'IBM Plex Mono',monospace;letter-spacing:.1em">↑ LOAD (t)</text>
    </svg>`;
  }

  function detailHtml(m) {
    const rows = [['Series', m.series + ' Series'], ['Configuration', m.cat], ['Max Capacity', m.maxCap + ' t'],
      ['Max Jib Length', m.maxJib + ' m'], ['Tip Load', m.tipLoad + ' t'], ['Max Free-Standing Height', m.freeHeight + ' m']];
    return `<div class="hd-detail">
      <div class="hd-hazard"></div>
      <div class="hd-detail__grid">
        <div class="hd-detail__left">
          <div class="hd-detail__idrow">
            <div>
              <div class="hd-detail__series">${m.series} Series · ${m.cat}</div>
              <div class="hd-detail__name">${m.name}</div>
            </div>
            ${statusChip(m.status, false)}
          </div>
          <p class="hd-detail__blurb">${m.blurb}</p>
          <div class="hd-detail__specs">
            ${rows.map(([k, v]) => `<div class="hd-detail__spec"><span class="hd-detail__spec-k">${k}</span><span class="hd-detail__spec-v">${v}</span></div>`).join('')}
          </div>
        </div>
        <div class="hd-detail__right">
          <button class="hd-detail__close" data-close-detail aria-label="Close"><span class="hd-icon" data-lucide="x" style="width:24px;height:24px"></span></button>
          <div class="hd-detail__charthead">Load Chart</div>
          ${chartSvg(m.curve, m.maxJib, m.maxCap)}
          <p class="hd-detail__chartnote">Illustrative curve. Refer to the official Comansa data sheet for certified lift values.</p>
          <div class="hd-detail__actions">
            <button class="hd-btn hd-btn--primary" style="flex:1;justify-content:center" data-quote-crane="${m.id}">Quote This Crane <span class="hd-icon" data-lucide="arrow-right"></span></button>
            <button class="hd-btn hd-btn--outline-light" style="padding:14px 16px"><span class="hd-icon" data-lucide="download"></span> Spec Sheet</button>
          </div>
        </div>
      </div>
    </div>`;
  }
  function openDetail(m) {
    if (!m) return;
    detailOverlay.innerHTML = detailHtml(m);
    detailOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    icons();
  }
  function closeDetail() { detailOverlay.hidden = true; detailOverlay.innerHTML = ''; document.body.style.overflow = ''; }

  /* ---- projects lightbox --------------------------------------------------- */
  function lightboxHtml(p) {
    return `<button class="hd-lightbox__close" data-close-lightbox aria-label="Close"><span class="hd-icon" data-lucide="x" style="width:30px;height:30px"></span></button>
      <div class="hd-lightbox">
        <img class="hd-lightbox__img" src="${PHOTOS[p.photo]}" alt="${p.title}" ${IMG_ERR} />
        <div class="hd-lightbox__bar">
          <div>
            <div class="hd-lightbox__loc">${p.loc}</div>
            <div class="hd-lightbox__title">${p.title}</div>
          </div>
          <span class="hd-tag">${p.crane}</span>
        </div>
      </div>`;
  }
  function openLightbox(p) {
    if (!p) return;
    lightboxOverlay.innerHTML = lightboxHtml(p);
    lightboxOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    icons();
  }
  function closeLightbox() { lightboxOverlay.hidden = true; lightboxOverlay.innerHTML = ''; document.body.style.overflow = ''; }

  /* ---- quote modal --------------------------------------------------------- */
  function field(label, inner) {
    return `<label class="hd-field"><span class="hd-field__label">${label}</span>${inner}</label>`;
  }
  function quoteFormHtml(prefill) {
    const opts = FLEET.map(m => `<option value="${m.name}"${prefill && prefill.name === m.name ? ' selected' : ''}>${m.name} — ${m.series} Series</option>`).join('');
    const notes = prefill && prefill.details ? prefill.details : '';
    return `<div class="hd-quote">
      <div class="hd-hazard"></div>
      <div class="hd-quote__body">
        <div class="hd-quote__top">
          <span class="hd-eyebrow"><span class="hd-eyebrow-bar"></span>Request a Quote</span>
          <button class="hd-quote__close" data-close-quote aria-label="Close"><span class="hd-icon" data-lucide="x" style="width:22px;height:22px"></span></button>
        </div>
        <form data-quote-form>
          <h3 class="hd-quote__title">Plan your lift</h3>
          <div class="hd-quote__grid">
            ${field('Name', '<input class="hd-field__input" required placeholder="Full name" />')}
            ${field('Company', '<input class="hd-field__input" required placeholder="Company" />')}
            ${field('Email', '<input type="email" class="hd-field__input" required placeholder="you@company.com" />')}
            ${field('Phone', '<input class="hd-field__input" placeholder="(000) 000-0000" />')}
            ${field('Project Location', '<input class="hd-field__input" placeholder="City, State" />')}
            ${field('Crane of Interest', `<select class="hd-field__input"><option value="">Not sure yet</option>${opts}</select>`)}
          </div>
          <div class="hd-quote__full">${field('Project Details', `<textarea class="hd-field__input" style="min-height:84px;resize:vertical" placeholder="Structure type, height, timeline, lift requirements…">${notes}</textarea>`)}</div>
          <div class="hd-quote__actions">
            <button type="submit" class="hd-btn hd-btn--primary">Submit Request <span class="hd-icon" data-lucide="arrow-right"></span></button>
            <span class="hd-quote__phone">or call 800.295.5858</span>
          </div>
        </form>
      </div>
    </div>`;
  }
  function quoteSuccessHtml() {
    return `<div class="hd-quote">
      <div class="hd-hazard"></div>
      <div class="hd-quote__body">
        <div class="hd-quote__top">
          <span class="hd-eyebrow"><span class="hd-eyebrow-bar"></span>Request a Quote</span>
          <button class="hd-quote__close" data-close-quote aria-label="Close"><span class="hd-icon" data-lucide="x" style="width:22px;height:22px"></span></button>
        </div>
        <div class="hd-quote__success">
          <div class="hd-quote__check"><span class="hd-icon" data-lucide="check" style="width:30px;height:30px"></span></div>
          <h3 class="hd-quote__success-title">Request received</h3>
          <p class="hd-quote__success-text">An estimator will reach out within one business day. For urgent lifts, call <span class="hd-mono" style="color:var(--fg);font-weight:600">800.295.5858</span>.</p>
          <button class="hd-btn hd-btn--dark" data-close-quote>Close</button>
        </div>
      </div>
    </div>`;
  }
  function openQuote(prefill) {
    quoteOverlay.innerHTML = quoteFormHtml(prefill);
    quoteOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    icons();
  }
  function closeQuote() { quoteOverlay.hidden = true; quoteOverlay.innerHTML = ''; document.body.style.overflow = ''; }

  /* ---- header / nav / scroll ---------------------------------------------- */
  const header = $('[data-header]');
  const mobileNav = $('[data-mobile-nav]');

  function doScroll(id) {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' });
    }
    if (mobileNav) mobileNav.hidden = true;
  }

  /* ---- event wiring -------------------------------------------------------- */
  function wire() {
    // header background on scroll
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // burger toggle
    $('[data-burger]').addEventListener('click', () => { mobileNav.hidden = !mobileNav.hidden; });

    // sliders
    const loadEl = $('[data-lp-load]'), radEl = $('[data-lp-radius]'), htEl = $('[data-lp-height]');
    loadEl.addEventListener('input', e => { lp.load = parseFloat(e.target.value); $('[data-lp-load-v]').textContent = lp.load.toFixed(1); renderPlanner(); });
    radEl.addEventListener('input', e => { lp.radius = parseInt(e.target.value, 10); $('[data-lp-radius-v]').textContent = lp.radius; renderPlanner(); });
    htEl.addEventListener('input', e => { lp.height = parseInt(e.target.value, 10); $('[data-lp-height-v]').textContent = lp.height; renderPlanner(); });

    // global delegated clicks
    document.addEventListener('click', e => {
      const filterBtn = e.target.closest('[data-filter]');
      if (filterBtn) { fleetFilter = filterBtn.getAttribute('data-filter'); renderFleetFilters(); renderFleetGrid(); return; }

      const craneBtn = e.target.closest('[data-crane]');
      if (craneBtn) { openDetail(FLEET.find(m => m.id === craneBtn.getAttribute('data-crane'))); return; }

      const projBtn = e.target.closest('[data-project]');
      if (projBtn) { openLightbox(PROJECTS[+projBtn.getAttribute('data-project')]); return; }

      const quoteLift = e.target.closest('[data-quote-lift]');
      if (quoteLift) { openQuote(currentBest ? { name: currentBest.m.name, details: currentLiftSummary } : { details: currentLiftSummary }); return; }

      const quoteBtn = e.target.closest('[data-quote]');
      if (quoteBtn) { openQuote(null); return; }

      const scrollBtn = e.target.closest('[data-scroll]');
      if (scrollBtn) { e.preventDefault(); doScroll(scrollBtn.getAttribute('data-scroll')); return; }
    });

    // detail overlay
    detailOverlay.addEventListener('click', e => {
      if (e.target === detailOverlay || e.target.closest('[data-close-detail]')) { closeDetail(); return; }
      const qc = e.target.closest('[data-quote-crane]');
      if (qc) { const m = FLEET.find(x => x.id === qc.getAttribute('data-quote-crane')); closeDetail(); openQuote(m); }
    });

    // lightbox overlay
    lightboxOverlay.addEventListener('click', e => {
      if (e.target === lightboxOverlay || e.target.closest('[data-close-lightbox]')) closeLightbox();
    });

    // quote overlay
    quoteOverlay.addEventListener('click', e => {
      if (e.target === quoteOverlay || e.target.closest('[data-close-quote]')) closeQuote();
    });
    quoteOverlay.addEventListener('submit', e => {
      e.preventDefault();
      quoteOverlay.innerHTML = quoteSuccessHtml();
      icons();
    });

    // escape closes overlays
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if (!detailOverlay.hidden) closeDetail();
      if (!lightboxOverlay.hidden) closeLightbox();
      if (!quoteOverlay.hidden) closeQuote();
    });
  }

  /* ---- init ---------------------------------------------------------------- */
  renderFleetFilters();
  renderFleetGrid();
  renderPlanner();
  renderCapabilities();
  renderProjects();
  renderHeritage();
  renderTeam();
  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  wire();
  icons();
})();
