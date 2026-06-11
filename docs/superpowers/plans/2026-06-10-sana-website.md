# SANA Benchmark Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 3-page static companion website for the SANA paper, modeled on the LakeQA benchmark site, with an interactive read-only ablation-results explorer.

**Architecture:** Vanilla HTML/CSS/JS, no build step, served from repo root on GitHub Pages (`.nojekyll`). Result data lives in JSON under `assets/data/` and renders client-side. CSS is forked from the LakeQA reference stylesheet with a SANA purple palette. One `assets/js/app.js` handles benchmark tabs, model toggle, column sort, and a diagram↔explorer-row highlight.

**Tech Stack:** HTML5, CSS (custom properties), vanilla ES module JS, Source Serif 4 (Google Fonts), GitHub Pages. Local preview via `python3 -m http.server`. Optional Playwright MCP for visual QA.

**Source of truth for all numbers:** `docs/superpowers/specs/2026-06-10-sana-website-design.md` → "Data Appendix". Every result value in the JSON files below is transcribed from that appendix. Do not invent or round numbers.

**Verification note:** This is a static marketing/benchmark site, not application logic — there is no unit-test runner. "Verify" steps mean: serve the site and confirm the described behavior in a browser (and/or via Playwright MCP). The one piece of pure logic (table sort) gets an inline assertion you can run in the browser console.

---

## File structure

Created at repo root (siblings of the existing `reference/` and `assets/daplab-h.png`):

- `index.html` — Home: hero, framework diagram, "What is SANA?", results explorer, key findings, links + citation.
- `method.html` — Method: EQA task anatomy, SANA profile worked example, idealized tools, condition table, metrics, findings (end-to-end, deltas, failure taxonomy, trajectory audit).
- `get-started.html` — Get started: run SANA on your own agent.
- `.nojekyll` — disables Jekyll so `assets/` paths resolve.
- `README.md` — replace the current stub with site README (run/deploy/structure).
- `assets/css/style.css` — forked LakeQA stylesheet + SANA palette.
- `assets/js/app.js` — explorer (tabs/toggle/sort) + diagram highlight + chart/table renderers.
- `assets/data/lakeqa_ablation.json` — Table 3 matrix, keyed by model.
- `assets/data/kramabench_ablation.json` — Table 7 matrix, keyed by model.
- `assets/data/endtoend.json` — Tables 4 & 8.
- `assets/data/deltas.json` — Figs 5 & 7.
- `assets/data/failures.json` — Table 6 + Table 5.
- `assets/daplab-h.png` — already present; reused.

Untouched: `reference/lakeqa-bench-site/**`, `SANA_VLDB_DASHSYS.pdf`.

---

## Task 1: Scaffold + SANA stylesheet

**Files:**
- Create: `.nojekyll`
- Create: `assets/css/style.css`
- Reference (read, do not modify): `reference/lakeqa-bench-site/assets/css/style.css`

- [ ] **Step 1: Create `.nojekyll`** (empty file)

```bash
touch .nojekyll
```

- [ ] **Step 2: Fork the LakeQA stylesheet**

Copy `reference/lakeqa-bench-site/assets/css/style.css` to `assets/css/style.css` as the starting point (keeps the card layout, nav, footer, `.container-wide`, `.bibtex`, `.json-viewer`, `.table-wrap`, `.pipeline`, `.challenge-grid`, `.metric-groups` classes the pages rely on).

```bash
cp reference/lakeqa-bench-site/assets/css/style.css assets/css/style.css
```

- [ ] **Step 3: Swap the LakeQA blue for the SANA palette**

At the top of `assets/css/style.css`, locate the `:root` custom properties (the accent/link color, currently a blue). Set the SANA palette. Add these (overriding the originals — keep ink text and muted gray):

```css
:root {
  /* SANA palette — muted amethyst, deliberately NOT the #8b5cf6 AI-default violet */
  --accent: #5e4b8b;
  --accent-deep: #3f2d63;
  --accent-soft: #ece8f4;   /* tint for highlighted rows / active chips */
  --ink: #1a1a1f;
  --muted: #6b6b76;
  /* keep the rest of LakeQA's tokens (background, borders, radius, etc.) */
}
```

Then find every place the original stylesheet used the LakeQA blue (links `a`, `.tab.active`, `.pipeline .node` borders, header brand, etc.) and point them at `var(--accent)` / `var(--accent-deep)`. Use editor search for the old hex value(s) and replace with the variables.

- [ ] **Step 4: Add SANA-specific classes** (append to end of `assets/css/style.css`)

These support components built in later tasks. Add now so styling is centralized:

```css
/* --- Framework diagram (Home hero) --- */
.framework { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 8px 0 4px; }
.fw-col { border: 1px solid var(--border, #e4e4ea); border-radius: 12px; padding: 14px 14px 10px; background: #fff; }
.fw-col > h4 { margin: 0 0 10px; font-size: 15px; letter-spacing: .02em; }
.fw-modes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.fw-mode { display: flex; align-items: center; gap: 8px; font-size: 14px; padding: 6px 8px; border-radius: 8px; cursor: pointer; color: var(--muted); }
.fw-mode .dot { width: 9px; height: 9px; border-radius: 50%; border: 2px solid var(--accent); flex: none; }
.fw-mode.is-active { color: var(--ink); }
.fw-mode.is-active .dot { background: var(--accent); }
.fw-mode:hover, .fw-mode.is-hot { background: var(--accent-soft); color: var(--accent-deep); }

/* --- Results explorer --- */
.explorer-controls { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; margin: 6px 0 14px; }
.toggle { display: inline-flex; border: 1px solid var(--border, #e4e4ea); border-radius: 999px; overflow: hidden; }
.toggle button { border: 0; background: #fff; padding: 6px 14px; font: inherit; cursor: pointer; color: var(--muted); }
.toggle button.active { background: var(--accent); color: #fff; }
table.matrix th[data-sort] { cursor: pointer; user-select: none; white-space: nowrap; }
table.matrix th[data-sort].sorted-asc::after  { content: " \25B2"; font-size: 10px; }
table.matrix th[data-sort].sorted-desc::after { content: " \25BC"; font-size: 10px; }
table.matrix tr.is-hot { background: var(--accent-soft); }
.mode-chip { font-size: 12px; padding: 1px 7px; border-radius: 999px; background: #f3f3f6; color: var(--ink); }
.mode-chip.ideal { background: var(--accent-soft); color: var(--accent-deep); }

/* --- Key findings strip --- */
.findings { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 18px; }
.finding { border-left: 3px solid var(--accent); padding: 6px 0 6px 14px; }
.finding h4 { margin: 0 0 4px; font-size: 15px; }
.finding p { margin: 0; font-size: 14px; color: var(--muted); }

/* --- Delta bar charts (Method) --- */
.delta-group { margin: 14px 0 22px; }
.delta-row { display: grid; grid-template-columns: 120px 1fr 86px; align-items: center; gap: 10px; margin: 5px 0; font-size: 13px; }
.delta-bar { height: 16px; background: var(--accent); border-radius: 4px; min-width: 2px; }
.delta-bar.zero { background: #c9c9d2; }
.delta-val { text-align: right; color: var(--muted); font-variant-numeric: tabular-nums; }

/* --- Header logo --- */
.site-header .brand-row { display: flex; align-items: center; gap: 14px; }
.lab-logo { height: 26px; width: auto; opacity: .9; }
@media (max-width: 760px) {
  .framework, .findings { grid-template-columns: 1fr; }
}
```

- [ ] **Step 5: Verify CSS loads** — defer visual check to Task 3 (no HTML yet). Commit.

```bash
git checkout -b sana-website
git add .nojekyll assets/css/style.css
git commit -m "chore: scaffold SANA site stylesheet (forked from LakeQA, purple palette)"
```

---

## Task 2: Data JSON files

**Files:**
- Create: `assets/data/lakeqa_ablation.json`
- Create: `assets/data/kramabench_ablation.json`
- Create: `assets/data/endtoend.json`
- Create: `assets/data/deltas.json`
- Create: `assets/data/failures.json`
- Source: spec Data Appendix (Tables 1–8, Figs 5/7).

- [ ] **Step 1: Write `lakeqa_ablation.json`** — transcribe spec Table 3 exactly. Shape:

```json
{
  "benchmark": "LakeQA",
  "tasks_per_cell": 135,
  "models": {
    "gpt-5.4-nano": [
      {"plan":"Naive","search":"Ideal","data_an":"Ideal","sm":34.1,"dacc":46.5,"dret":56.5,"ret_call":3.2,"acc_call":11.6},
      {"plan":"Standard","search":"Ideal","data_an":"Ideal","sm":31.1,"dacc":47.0,"dret":57.6,"ret_call":4.1,"acc_call":13.2},
      {"plan":"Ideal","search":"Naive","data_an":"Ideal","sm":23.0,"dacc":39.0,"dret":50.8,"ret_call":5.8,"acc_call":12.3},
      {"plan":"Ideal","search":"Standard","data_an":"Ideal","sm":26.7,"dacc":43.4,"dret":55.4,"ret_call":4.7,"acc_call":13.2},
      {"plan":"Ideal","search":"Ideal","data_an":"Standard","sm":28.9,"dacc":44.0,"dret":56.9,"ret_call":3.8,"acc_call":13.6},
      {"plan":"Ideal","search":"Ideal","data_an":"Ideal","sm":37.0,"dacc":47.1,"dret":58.1,"ret_call":4.1,"acc_call":12.5},
      {"plan":"Ideal","search":"Preloaded","data_an":"Ideal","sm":51.8,"dacc":59.2,"dret":null,"ret_call":0.0,"acc_call":17.1}
    ],
    "gpt-5-mini": [
      {"plan":"Naive","search":"Ideal","data_an":"Ideal","sm":66.7,"dacc":55.1,"dret":59.0,"ret_call":5.8,"acc_call":13.1},
      {"plan":"Standard","search":"Ideal","data_an":"Ideal","sm":66.7,"dacc":56.2,"dret":58.8,"ret_call":5.8,"acc_call":14.4},
      {"plan":"Ideal","search":"Naive","data_an":"Ideal","sm":63.0,"dacc":50.7,"dret":56.5,"ret_call":5.9,"acc_call":15.4},
      {"plan":"Ideal","search":"Standard","data_an":"Ideal","sm":61.5,"dacc":52.4,"dret":58.0,"ret_call":5.8,"acc_call":15.9},
      {"plan":"Ideal","search":"Ideal","data_an":"Standard","sm":57.8,"dacc":53.8,"dret":58.7,"ret_call":5.7,"acc_call":12.9},
      {"plan":"Ideal","search":"Ideal","data_an":"Ideal","sm":76.3,"dacc":56.5,"dret":60.2,"ret_call":5.9,"acc_call":14.1},
      {"plan":"Ideal","search":"Preloaded","data_an":"Ideal","sm":77.0,"dacc":61.7,"dret":null,"ret_call":0.0,"acc_call":16.8}
    ]
  }
}
```

- [ ] **Step 2: Write `kramabench_ablation.json`** — same shape, `"benchmark":"KramaBench"`, `"tasks_per_cell":83`, values from spec Table 7:

```json
{
  "benchmark": "KramaBench",
  "tasks_per_cell": 83,
  "models": {
    "gpt-5.4-nano": [
      {"plan":"Naive","search":"Ideal","data_an":"Ideal","sm":75.9,"dacc":81.7,"dret":89.9,"ret_call":1.7,"acc_call":3.2},
      {"plan":"Standard","search":"Ideal","data_an":"Ideal","sm":85.5,"dacc":89.3,"dret":91.0,"ret_call":1.4,"acc_call":3.7},
      {"plan":"Ideal","search":"Naive","data_an":"Ideal","sm":85.5,"dacc":50.1,"dret":78.9,"ret_call":2.9,"acc_call":4.0},
      {"plan":"Ideal","search":"Standard","data_an":"Ideal","sm":90.4,"dacc":43.5,"dret":77.1,"ret_call":2.1,"acc_call":4.0},
      {"plan":"Ideal","search":"Ideal","data_an":"Standard","sm":63.9,"dacc":92.9,"dret":93.9,"ret_call":1.3,"acc_call":2.9},
      {"plan":"Ideal","search":"Ideal","data_an":"Ideal","sm":87.9,"dacc":92.3,"dret":95.8,"ret_call":1.6,"acc_call":3.5},
      {"plan":"Ideal","search":"Preloaded","data_an":"Ideal","sm":91.6,"dacc":98.4,"dret":null,"ret_call":0.0,"acc_call":3.7}
    ],
    "gpt-5-mini": [
      {"plan":"Naive","search":"Ideal","data_an":"Ideal","sm":86.8,"dacc":93.9,"dret":95.8,"ret_call":1.4,"acc_call":4.6},
      {"plan":"Standard","search":"Ideal","data_an":"Ideal","sm":89.2,"dacc":93.7,"dret":94.3,"ret_call":1.4,"acc_call":4.6},
      {"plan":"Ideal","search":"Naive","data_an":"Ideal","sm":84.3,"dacc":51.6,"dret":82.0,"ret_call":2.7,"acc_call":4.2},
      {"plan":"Ideal","search":"Standard","data_an":"Ideal","sm":90.4,"dacc":50.8,"dret":78.9,"ret_call":2.0,"acc_call":4.1},
      {"plan":"Ideal","search":"Ideal","data_an":"Standard","sm":75.9,"dacc":96.7,"dret":96.7,"ret_call":1.5,"acc_call":3.4},
      {"plan":"Ideal","search":"Ideal","data_an":"Ideal","sm":90.4,"dacc":97.0,"dret":97.6,"ret_call":1.2,"acc_call":4.1},
      {"plan":"Ideal","search":"Preloaded","data_an":"Ideal","sm":92.8,"dacc":99.0,"dret":null,"ret_call":0.0,"acc_call":4.6}
    ]
  }
}
```

- [ ] **Step 3: Write `endtoend.json`** — spec Tables 4 & 8. Note column order in the paper is SM, **D_ret, D_acc** (different from the matrices). Store named fields so order can't be confused:

```json
{
  "LakeQA": {
    "n": 135,
    "gpt-5.4-nano": [
      {"mode":"Naive","sm":20.7,"dret":45.4,"dacc":30.7,"ret_call":5.0,"acc_call":11.0},
      {"mode":"Standard","sm":19.3,"dret":53.2,"dacc":39.5,"ret_call":5.2,"acc_call":14.1},
      {"mode":"Ideal","sm":37.0,"dret":58.1,"dacc":47.1,"ret_call":4.1,"acc_call":12.5}
    ],
    "gpt-5-mini": [
      {"mode":"Naive","sm":56.3,"dret":53.8,"dacc":45.5,"ret_call":7.2,"acc_call":12.1},
      {"mode":"Standard","sm":57.8,"dret":56.9,"dacc":48.5,"ret_call":6.0,"acc_call":13.2},
      {"mode":"Ideal","sm":76.3,"dret":60.2,"dacc":56.5,"ret_call":5.9,"acc_call":14.1}
    ]
  },
  "KramaBench": {
    "n": 83,
    "gpt-5.4-nano": [
      {"mode":"Naive","sm":44.6,"dret":64.2,"dacc":31.8,"ret_call":3.2,"acc_call":3.3},
      {"mode":"Standard","sm":57.8,"dret":70.6,"dacc":44.6,"ret_call":2.4,"acc_call":3.6},
      {"mode":"Ideal","sm":87.9,"dret":95.8,"dacc":92.3,"ret_call":1.6,"acc_call":3.5}
    ],
    "gpt-5-mini": [
      {"mode":"Naive","sm":62.6,"dret":64.7,"dacc":36.0,"ret_call":3.8,"acc_call":3.6},
      {"mode":"Standard","sm":66.3,"dret":68.5,"dacc":34.8,"ret_call":3.2,"acc_call":3.8},
      {"mode":"Ideal","sm":90.4,"dret":97.6,"dacc":97.0,"ret_call":1.2,"acc_call":4.1}
    ]
  }
}
```

- [ ] **Step 4: Write `deltas.json`** — spec Figs 5 & 7. `base` is the baseline SM for each component; each item has SM and delta:

```json
{
  "LakeQA": {
    "gpt-5.4-nano": {
      "Plan":      [{"label":"No Plan","sm":34.1,"delta":0.0},{"label":"Default","sm":31.1,"delta":-3.0},{"label":"Ideal","sm":37.0,"delta":3.0}],
      "Search":    [{"label":"BM25","sm":23.0,"delta":0.0},{"label":"Pneuma","sm":26.7,"delta":3.7},{"label":"Ideal","sm":37.0,"delta":14.1},{"label":"Preloaded","sm":51.8,"delta":28.9}],
      "Data An.":  [{"label":"Standard","sm":28.9,"delta":0.0},{"label":"Ideal","sm":37.0,"delta":8.2}]
    },
    "gpt-5-mini": {
      "Plan":      [{"label":"No Plan","sm":66.7,"delta":0.0},{"label":"Default","sm":66.7,"delta":0.0},{"label":"Ideal","sm":76.3,"delta":9.6}],
      "Search":    [{"label":"BM25","sm":63.0,"delta":0.0},{"label":"Pneuma","sm":61.5,"delta":-1.5},{"label":"Ideal","sm":76.3,"delta":13.3},{"label":"Preloaded","sm":77.0,"delta":14.1}],
      "Data An.":  [{"label":"Standard","sm":57.8,"delta":0.0},{"label":"Ideal","sm":76.3,"delta":18.5}]
    }
  },
  "KramaBench": {
    "gpt-5.4-nano": {
      "Plan":      [{"label":"No Plan","sm":75.9,"delta":0.0},{"label":"Default","sm":85.5,"delta":9.6},{"label":"Ideal","sm":87.9,"delta":12.0}],
      "Search":    [{"label":"BM25","sm":85.5,"delta":0.0},{"label":"Pneuma","sm":90.4,"delta":4.8},{"label":"Ideal","sm":87.9,"delta":2.4},{"label":"Preloaded","sm":91.6,"delta":6.0}],
      "Data An.":  [{"label":"Standard","sm":63.9,"delta":0.0},{"label":"Ideal","sm":87.9,"delta":24.1}]
    },
    "gpt-5-mini": {
      "Plan":      [{"label":"No Plan","sm":86.8,"delta":0.0},{"label":"Default","sm":89.2,"delta":2.4},{"label":"Ideal","sm":90.4,"delta":3.6}],
      "Search":    [{"label":"BM25","sm":84.3,"delta":0.0},{"label":"Pneuma","sm":90.4,"delta":6.0},{"label":"Ideal","sm":90.4,"delta":6.0},{"label":"Preloaded","sm":92.8,"delta":8.4}],
      "Data An.":  [{"label":"Standard","sm":75.9,"delta":0.0},{"label":"Ideal","sm":90.4,"delta":14.5}]
    }
  }
}
```

- [ ] **Step 5: Write `failures.json`** — spec Table 6 (taxonomy) + Table 5 (trajectory audit):

```json
{
  "taxonomy": {
    "note": "Event share within each model. nano: 1018 events / 586 failed runs; mini: 515 / 297.",
    "rows": [
      {"group":"Task/planning","mini":7.4,"nano":11.3,"meaning":"Reasoning-chain divergence; question-constraint misread"},
      {"group":"Wrong source target","mini":0.0,"nano":7.6,"meaning":"Chose wrong dataset / table / source family / version"},
      {"group":"Execution/computation","mini":39.6,"nano":26.2,"meaning":"Wrong scope/filter; aggregation error; extraction/parsing error"},
      {"group":"Incomplete evidence","mini":12.2,"nano":12.3,"meaning":"Ran out of budget; submitted early with incomplete evidence"},
      {"group":"Turn-waste","mini":2.1,"nano":8.8,"meaning":"Query/repair loop; schema-inspection loop; low-yield search loop"},
      {"group":"Finalization","mini":21.0,"nano":13.2,"meaning":"Correct evidence present but submitted answer wrong"},
      {"group":"Tool blocker","mini":17.7,"nano":20.6,"meaning":"Files/tools/repair/unsupported formats/runtime limits blocked progress"}
    ]
  },
  "trajectory": {
    "note": "LakeQA plan-trajectory audit: share of runs Followed and Followed+Mostly.",
    "rows": [
      {"model":"gpt-5-mini","plan":"Naive","followed":21.2,"mostly":49.6},
      {"model":"gpt-5-mini","plan":"Standard","followed":12.6,"mostly":46.4},
      {"model":"gpt-5-mini","plan":"Ideal","followed":25.9,"mostly":56.5},
      {"model":"gpt-5.4-nano","plan":"Naive","followed":5.7,"mostly":19.0},
      {"model":"gpt-5.4-nano","plan":"Standard","followed":8.4,"mostly":24.0},
      {"model":"gpt-5.4-nano","plan":"Ideal","followed":7.9,"mostly":28.1}
    ]
  }
}
```

- [ ] **Step 6: Validate JSON + commit**

Run: `for f in assets/data/*.json; do python3 -m json.tool "$f" >/dev/null && echo "OK $f"; done`
Expected: `OK` for all five files (no parse errors).

```bash
git add assets/data/*.json
git commit -m "data: add SANA ablation result JSON (Tables 3-8, Figs 5/7, taxonomy)"
```

---

## Task 3: Home page shell (header, hero, footer, logo)

**Files:**
- Create: `index.html`
- Reference: `reference/lakeqa-bench-site/index.html` (structure to mirror)

- [ ] **Step 1: Write the page shell**

Create `index.html` with the LakeQA `<head>` pattern (Source Serif 4 link, `assets/css/style.css`), then header/hero/footer. Header carries the brand + DAP Lab logo:

```html
<header class="site-header">
  <div class="container-wide">
    <div class="brand-row">
      <a class="brand" href="index.html">SANA</a>
      <img class="lab-logo" src="assets/daplab-h.png" alt="DAP Lab" />
    </div>
    <nav class="site-nav">
      <a href="index.html" class="active">Home</a>
      <a href="method.html">Method</a>
      <a href="get-started.html">Get started</a>
    </nav>
  </div>
</header>

<section class="hero">
  <div class="container-wide">
    <h1>SANA</h1>
    <p class="tagline">What matters for QA agents over massive data lakes?</p>
    <p class="subtagline">A diagnostic ablation framework that pinpoints where data-lake agents fail — search, planning, data analysis, or policy.</p>
  </div>
</section>

<!-- Sections added in Tasks 4-7 go here -->

<footer class="site-footer">
  <div class="container-wide">
    SANA · VLDB 2026 DASHSys · DAP Lab · <a href="method.html">Method</a> · <a href="get-started.html">Get started</a>
  </div>
</footer>

<script type="module" src="assets/js/app.js"></script>
```

Set `<title>` to `SANA — What Matters for QA Agents over Massive Data Lakes?` and a matching `<meta name="description">`.

- [ ] **Step 2: Verify in browser**

Run: `python3 -m http.server 8000` (from repo root), open `http://localhost:8000/`.
Expected: header with "SANA" + DAP Lab logo, purple links, hero text, footer. No console errors except possibly a 404/empty `app.js` (created in Task 5) — acceptable for now.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: home page shell (header, hero, footer, DAP Lab logo)"
```

---

## Task 4: Interactive framework diagram (Home)

**Files:**
- Modify: `index.html` (insert diagram section after hero)

- [ ] **Step 1: Add the diagram markup** (insert into `index.html` where Step 1 of Task 3 left the placeholder comment)

Each `.fw-mode` carries `data-axis` and `data-mode` so Task 6 can wire highlighting. Active modes (the all-ideal config) get `is-active`.

```html
<section class="home-section">
  <div class="container-wide">
    <h3>The SANA ablation framework</h3>
    <p style="color:var(--muted);max-width:70ch;">
      SANA turns solved EQA tasks into runtime profiles, then swaps each runtime component
      between idealized and realistic implementations. The residual gap diagnoses the agent's policy.
      Hover a mode to highlight its row in the results below.
    </p>
    <div class="framework" id="framework">
      <div class="fw-col">
        <h4>Planning</h4>
        <ul class="fw-modes">
          <li class="fw-mode" data-axis="plan" data-mode="Naive"><span class="dot"></span>Naive</li>
          <li class="fw-mode" data-axis="plan" data-mode="Standard"><span class="dot"></span>Standard</li>
          <li class="fw-mode is-active" data-axis="plan" data-mode="Ideal"><span class="dot"></span>Ideal</li>
        </ul>
      </div>
      <div class="fw-col">
        <h4>Search</h4>
        <ul class="fw-modes">
          <li class="fw-mode" data-axis="search" data-mode="Naive"><span class="dot"></span>Naive · BM25</li>
          <li class="fw-mode" data-axis="search" data-mode="Standard"><span class="dot"></span>Standard · Hybrid</li>
          <li class="fw-mode is-active" data-axis="search" data-mode="Ideal"><span class="dot"></span>Ideal</li>
          <li class="fw-mode" data-axis="search" data-mode="Preloaded"><span class="dot"></span>Preloaded</li>
        </ul>
      </div>
      <div class="fw-col">
        <h4>Data Analysis</h4>
        <ul class="fw-modes">
          <li class="fw-mode" data-axis="data_an" data-mode="Standard"><span class="dot"></span>Standard</li>
          <li class="fw-mode is-active" data-axis="data_an" data-mode="Ideal"><span class="dot"></span>Ideal</li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify** — reload `http://localhost:8000/`. Expected: three columns with mode lists; "Ideal" rows show a filled dot; hovering a mode shows the purple-tint hover state (CSS only — highlight link comes in Task 6).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: interactive framework diagram on home"
```

---

## Task 5: Results explorer (tabs, model toggle, sortable matrix)

**Files:**
- Create: `assets/js/app.js`
- Modify: `index.html` (add "What is SANA?" card + explorer container before footer)

- [ ] **Step 1: Add the explorer markup to `index.html`**

```html
<section class="home-section">
  <div class="container-wide">
    <div class="card">
      <h3>What is SANA?</h3>
      <p>
        SANA (Search Agent Navigation Ablation framework) diagnoses why LLM agents fail at
        <strong>Exploratory QA</strong> over data lakes. It converts solved tasks into
        <em>runtime profiles</em> — a gold source sequence, sanitized subquestions, and
        execution records — and uses them to build <em>idealized</em> Planning, Search, and
        Data-Analysis tools. Ablating one component at a time isolates its contribution; the
        gap that remains when everything is idealized is attributable to the agent's
        <strong>action policy</strong>. See the <a href="method.html">Method</a> page for details.
      </p>
    </div>

    <h3 style="margin-top:28px;">Ablation results</h3>
    <p style="font-size:13px;color:var(--muted);margin:0 0 6px;">
      Vary one axis while holding the others idealized. Click any numeric column to sort.
      Preloaded has no retrieval step, so D_ret is “—”.
    </p>
    <div class="explorer-controls">
      <div class="tabs" id="lb-tabs">
        <button class="tab active" data-bench="lakeqa">LakeQA (135)</button>
        <button class="tab" data-bench="kramabench">KramaBench (83)</button>
      </div>
      <div class="toggle" id="lb-model">
        <button class="active" data-model="gpt-5.4-nano">gpt-5.4-nano</button>
        <button data-model="gpt-5-mini">gpt-5-mini</button>
      </div>
    </div>
    <div class="table-wrap" id="lb-table"></div>
  </div>
</section>
```

- [ ] **Step 2: Write `assets/js/app.js`** — explorer state + render + sort. Use ES module, fetch JSON, no dependencies.

```js
// SANA site — explorer, diagram highlight, charts.
const COLS = [
  { key: "plan", label: "Plan", type: "mode" },
  { key: "search", label: "Search", type: "mode" },
  { key: "data_an", label: "Data An.", type: "mode" },
  { key: "sm", label: "SM %", type: "num" },
  { key: "dacc", label: "D_acc %", type: "num" },
  { key: "dret", label: "D_ret %", type: "num" },
  { key: "ret_call", label: "Ret calls", type: "num" },
  { key: "acc_call", label: "Acc calls", type: "num" },
];

const explorer = {
  data: {},               // { lakeqa: {...}, kramabench: {...} }
  bench: "lakeqa",
  model: "gpt-5.4-nano",
  sort: { key: "sm", dir: "desc" },
};

async function initExplorer() {
  const tableEl = document.getElementById("lb-table");
  if (!tableEl) return;
  const [lake, krama] = await Promise.all([
    fetch("assets/data/lakeqa_ablation.json").then((r) => r.json()),
    fetch("assets/data/kramabench_ablation.json").then((r) => r.json()),
  ]);
  explorer.data = { lakeqa: lake, kramabench: krama };

  document.querySelectorAll("#lb-tabs .tab").forEach((b) =>
    b.addEventListener("click", () => {
      explorer.bench = b.dataset.bench;
      setActive("#lb-tabs .tab", b);
      renderMatrix();
    }));
  document.querySelectorAll("#lb-model button").forEach((b) =>
    b.addEventListener("click", () => {
      explorer.model = b.dataset.model;
      setActive("#lb-model button", b);
      renderMatrix();
    }));
  renderMatrix();
}

function setActive(sel, el) {
  document.querySelectorAll(sel).forEach((x) => x.classList.remove("active"));
  el.classList.add("active");
}

function rows() {
  return explorer.data[explorer.bench].models[explorer.model];
}

function sortedRows() {
  const { key, dir } = explorer.sort;
  const mult = dir === "asc" ? 1 : -1;
  return [...rows()].sort((a, b) => {
    const av = a[key], bv = b[key];
    if (av === null) return 1;            // nulls (D_ret “—”) sink
    if (bv === null) return -1;
    if (typeof av === "number") return (av - bv) * mult;
    return String(av).localeCompare(String(bv)) * mult;
  });
}

function renderMatrix() {
  const el = document.getElementById("lb-table");
  const head = COLS.map((c) => {
    const sortable = `data-sort="${c.key}"`;
    const cls =
      explorer.sort.key === c.key ? `sorted-${explorer.sort.dir}` : "";
    return `<th ${sortable} class="${cls}">${c.label}</th>`;
  }).join("");

  const body = sortedRows().map((row) => {
    const tds = COLS.map((c) => {
      if (c.type === "mode") {
        const cls = row[c.key] === "Ideal" ? "mode-chip ideal" : "mode-chip";
        return `<td><span class="${cls}">${row[c.key]}</span></td>`;
      }
      const v = row[c.key];
      return `<td style="text-align:right;font-variant-numeric:tabular-nums;">${v === null ? "—" : v.toFixed(1)}</td>`;
    }).join("");
    const id = `r-${row.plan}-${row.search}-${row.data_an}`;
    return `<tr id="${id}" data-plan="${row.plan}" data-search="${row.search}" data-data_an="${row.data_an}">${tds}</tr>`;
  }).join("");

  el.innerHTML = `<table class="matrix"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;

  el.querySelectorAll("th[data-sort]").forEach((th) =>
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (explorer.sort.key === key)
        explorer.sort.dir = explorer.sort.dir === "asc" ? "desc" : "asc";
      else explorer.sort = { key, dir: "desc" };
      renderMatrix();
    }));
}

initExplorer();
```

- [ ] **Step 3: Verify behavior in browser**

Reload `http://localhost:8000/`. Expected:
- Matrix renders 7 rows for gpt-5.4-nano / LakeQA, sorted by SM descending (Preloaded 51.8 on top).
- Clicking "KramaBench" tab → 7 KramaBench rows; clicking "gpt-5-mini" → mini values.
- Clicking the "SM %" header toggles asc/desc; clicking "Ret calls" sorts by that column. Preloaded's D_ret shows "—" and sinks to the bottom when sorting D_ret.
- "Ideal" mode chips are tinted purple.

Console sort sanity check (paste in DevTools console):
```js
// after page load: SM column should be sorted desc by default
[...document.querySelectorAll('#lb-table tbody tr td:nth-child(4)')].map(td=>+td.textContent)
// Expected (nano/LakeQA): [51.8, 37, 34.1, 31.1, 28.9, 26.7, 23]
```
Expected: the array prints in non-increasing order.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/js/app.js
git commit -m "feat: interactive ablation results explorer (tabs, model toggle, sort)"
```

---

## Task 6: Diagram ↔ explorer highlight link

**Files:**
- Modify: `assets/js/app.js` (append highlight wiring)

- [ ] **Step 1: Append highlight logic to `app.js`**

When a diagram mode is hovered, highlight every visible matrix row whose corresponding axis equals that mode.

```js
function initDiagramLink() {
  const fw = document.getElementById("framework");
  const table = document.getElementById("lb-table");
  if (!fw || !table) return;

  fw.querySelectorAll(".fw-mode").forEach((modeEl) => {
    const axis = modeEl.dataset.axis;   // plan | search | data_an
    const mode = modeEl.dataset.mode;
    const on = () => {
      modeEl.classList.add("is-hot");
      table.querySelectorAll("tbody tr").forEach((tr) => {
        if (tr.dataset[axis] === mode) tr.classList.add("is-hot");
      });
    };
    const off = () => {
      modeEl.classList.remove("is-hot");
      table.querySelectorAll("tbody tr.is-hot").forEach((tr) => tr.classList.remove("is-hot"));
    };
    modeEl.addEventListener("mouseenter", on);
    modeEl.addEventListener("mouseleave", off);
    modeEl.addEventListener("focus", on);
    modeEl.addEventListener("blur", off);
  });
}
```

Then call it after the matrix first renders. Change the end of `renderMatrix`-related flow: in `initExplorer`, after `renderMatrix();`, add `initDiagramLink();`. (Re-querying rows on each hover means it tolerates re-renders; no need to re-bind on tab/model change.)

- [ ] **Step 2: Verify** — reload, hover "Naive" under Search → the `Ideal/Naive/Ideal` row highlights purple; moving away clears it. Works across tab/model switches (hover still highlights current rows).

- [ ] **Step 3: Commit**

```bash
git add assets/js/app.js
git commit -m "feat: link framework diagram hover to explorer row highlight"
```

---

## Task 7: Home — key findings + links + citation

**Files:**
- Modify: `index.html` (add findings strip + links + BibTeX before footer)

- [ ] **Step 1: Add markup**

```html
<section class="home-section">
  <div class="container-wide">
    <h3>What we found</h3>
    <div class="findings">
      <div class="finding">
        <h4>Data analysis is the consistent bottleneck</h4>
        <p>Idealizing execution gives large gains on both benchmarks (up to +24.1%), even when sources are already found.</p>
      </div>
      <div class="finding">
        <h4>Search dominates on the large lake</h4>
        <p>On LakeQA's ~40M-file lake, ideal search beats BM25 by +13–14%; on the small KramaBench it matters far less.</p>
      </div>
      <div class="finding">
        <h4>Plans are written, not followed</h4>
        <p>Agents produce near-gold decompositions (~78–82% match) yet only follow them ~28–57% of the time.</p>
      </div>
    </div>

    <div class="inline-links" style="margin-top:24px;">
      <a href="#" id="paper-link">Paper (PDF) ↗</a>
      <a href="https://github.com/Austin-Senna/exploratory-qa-eval">Code (GitHub) ↗</a>
      <a href="#" id="data-link">Dataset ↗</a>
    </div>
    <p style="font-size:12px;color:var(--muted);margin-top:6px;">
      <!-- TODO before launch: set #paper-link and #data-link hrefs; remove this note. -->
      Paper and dataset links are placeholders pending the public release.
    </p>

    <h3 style="margin-top:28px;">Citation</h3>
    <p style="font-size:14px;color:var(--muted);margin:0 0 8px;">
      To appear at the VLDB 2026 Workshop on Systems for Data-centric Agents with Human-in-the-loop (DASHSys).
    </p>
    <pre class="bibtex">@inproceedings{sana2026,
  title     = {SANA: What Matters for QA Agents over Massive Data Lakes?},
  author    = {Wijaya, Austin Senna and Liu, Jiaxiang and Wang, Haonan and Wu, Eugene},
  booktitle = {VLDB 2026 Workshop on Systems for Data-centric Agents with Human-in-the-loop (DASHSys)},
  year      = {2026}
}</pre>
  </div>
</section>
```

- [ ] **Step 2: Verify** — reload; findings strip shows three accent-bordered items; links + BibTeX render. Code link points to the real repo.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: home key findings, links, and citation"
```

---

## Task 8: Method page — task anatomy, profile example, idealized tools, conditions, metrics

**Files:**
- Create: `method.html`
- Reference: `reference/lakeqa-bench-site/details.html` (structure + `.json-viewer`/`.table-wrap`/`.metric-groups` classes)

- [ ] **Step 1: Page shell** — same `<head>`/header/footer as `index.html` but with `method.html` nav `active`, `<title>Method — SANA</title>`, and a `.page-title-strip` like LakeQA's details page (`<h1>Method</h1>` + one-line summary).

- [ ] **Step 2: "Anatomy of an EQA task" section**

```html
<section><div class="container-wide">
  <h2>Anatomy of an EQA task</h2>
  <p>An exploratory-QA task is a tuple <code>τ = (Q, D, D<sub>gold</sub>, T, A★, B)</code>:
  a question <code>Q</code>, a data lake <code>D</code> of structured and unstructured datasets,
  the minimal gold sources <code>D<sub>gold</sub></code> sufficient to answer it, a tool set
  <code>T</code>, the gold answer <code>A★</code>, and a tool-call budget <code>B</code> (we use B = 30).</p>
  <p>Answering requires decomposing <code>Q</code> into subquestions
  <code>(Q₁ … Q<sub>K</sub>)</code>, discovering each one's gold dataset, and chaining intermediate
  answers so that <code>Q<sub>i</sub>, d<sup>i</sup><sub>gold</sub>, A₁…A<sub>i−1</sub> ⊨ A<sub>i</sub></code>.
  The tools fall into two classes: dataset <strong>search</strong> <code>f(q, k)</code> over the lake,
  and <strong>data analysis</strong> <code>g(c, d)</code> that runs program <code>c</code> over dataset <code>d</code>.</p>
</div></section>
```

- [ ] **Step 3: "The SANA profile" worked example** (recreates Fig 3) — use the `.json-viewer` style from LakeQA's details page. Content = the Bronx task from the spec:

```html
<section><div class="container-wide">
  <h2>The SANA profile</h2>
  <p>SANA annotates each solved task into a profile with three parts: a <strong>source sequence</strong>,
  <strong>sanitized subquestions</strong> (rewritten to not leak which dataset to fetch), and
  <strong>execution records</strong> (dataset, intent, query, and verified answer). Example, adapted from a LakeQA task:</p>
  <pre class="json-viewer"><code>{
  "task": "Compute the 2023 ratio of top-offense complaints to shootings in NYC's northernmost borough (rounded).",
  "source_sequence": ["The_Bronx", "nypd-complaints", "nypd-shootings"],
  "sanitized_subquestions": [
    "find NYC's northernmost borough",
    "count complaints there for the top 2023 offense",
    "count 2023 shootings there; divide (2)/(3), round"
  ],
  "execution_records": [
    { "src": "nypd-complaints", "intent": "count 2023 top-offense complaints in the Bronx",
      "query": "CNT(*) WHERE BORO='BRONX' & yr=2023 GRP_BY OFNS_DESC", "answer": 18613 },
    { "src": "nypd-shootings", "intent": "node_1_ans / 2023 Bronx shooting count",
      "query": "ROUND(18613 / CNT(*)) WHERE BORO='BRONX' & yr=2023", "answer": 42 }
  ]
}</code></pre>
  <p class="json-caption">Subquestion 1 only retrieves the <code>The_Bronx</code> dataset, so it has no execution record.</p>
</div></section>
```

- [ ] **Step 4: "Idealized tools" section** (recreates Fig 4) — a short description of each, plus a flow note:

```html
<section><div class="container-wide">
  <h2>Idealized tools</h2>
  <p>SANA consumes the profile to construct one idealized tool per component. Each is a drop-in runtime tool, so the agent still decides <em>when</em> to call it.</p>
  <div class="metric-groups">
    <div class="metric-group"><h4>plan_ideal</h4><p style="font-size:14px;color:var(--muted)">Receives the sanitized subquestion sequence and writes an explicit decomposition into the agent's system prompt.</p></div>
    <div class="metric-group"><h4>search_ideal</h4><p style="font-size:14px;color:var(--muted)">Restricts the search space to <code>D<sub>gold</sub></code>; a metadata selector subagent returns only datasets matching the query intent (else “dataset not found”).</p></div>
    <div class="metric-group"><h4>execute_ideal</h4><p style="font-size:14px;color:var(--muted)">If the agent's intent matches the record (semantic judge), returns the verified answer; otherwise a stronger model generates and repairs code (≤ 2 retries) to fulfill the stated intent.</p></div>
  </div>
</div></section>
```

- [ ] **Step 5: "Condition space" table** (Table 2) — a `.table-wrap` table with three groups (Planning/Search/Data analysis) and their modes + descriptions, transcribed from spec Table 2.

```html
<section><div class="container-wide">
  <h2>Condition space</h2>
  <p>Each run picks one mode per axis. Targeted ablations vary one axis while holding the others idealized.</p>
  <div class="table-wrap"><table>
    <thead><tr><th>Axis</th><th>Mode</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td rowspan="3">Planning</td><td>Naive</td><td>No planning tool; the agent answers directly.</td></tr>
      <tr><td>Standard</td><td>Planning tool, but a self-written plan with no sanitized sequence.</td></tr>
      <tr><td>Ideal</td><td>Receives the sanitized subquestion sequence and stores a derived plan.</td></tr>
      <tr><td rowspan="4">Search</td><td>Naive</td><td>BM25 sparse lexical search over the lake.</td></tr>
      <tr><td>Standard</td><td>Hybrid search (RRF) with LLM table descriptions (Pneuma / AutoDDG).</td></tr>
      <tr><td>Ideal</td><td>Oracle search restricted to <code>D<sub>gold</sub></code>.</td></tr>
      <tr><td>Preloaded</td><td><code>D<sub>gold</sub></code> placed directly in context; no search tool.</td></tr>
      <tr><td rowspan="2">Data analysis</td><td>Standard</td><td>Writes and runs SQL / Python through ordinary execution tools.</td></tr>
      <tr><td>Ideal</td><td>Intent-based execution tool that returns verified results.</td></tr>
    </tbody>
  </table></div>
</div></section>
```

- [ ] **Step 6: "Metrics" section** — `.metric-groups` with SM, D_ret, D_acc, tool calls (transcribe from spec "Metrics"). Include the eval-setup facts (B=30, 600s, models, Strands/DuckDB, "stronger than LakeQA" caveat) as a short paragraph.

- [ ] **Step 7: Verify** — open `http://localhost:8000/method.html`. Expected: all sections render, JSON viewer styled, condition table with row spans, no console errors.

- [ ] **Step 8: Commit**

```bash
git add method.html
git commit -m "feat: method page — task anatomy, profile, idealized tools, conditions, metrics"
```

---

## Task 9: Method page — findings (end-to-end, delta charts, failure taxonomy, trajectory)

**Files:**
- Modify: `method.html` (append findings sections + chart/table containers)
- Modify: `assets/js/app.js` (append renderers for deltas, end-to-end, failures, trajectory)

- [ ] **Step 1: Add containers to `method.html`** (before footer)

```html
<section id="metrics-anchor"><div class="container-wide">
  <h2>Findings</h2>

  <h3>End-to-end mode comparison</h3>
  <p style="font-size:13px;color:var(--muted)">Naive / Standard / Ideal end-to-end, per benchmark. SM is the primary metric.</p>
  <div class="table-wrap" id="e2e-table"></div>

  <h3 style="margin-top:28px;">Per-component deltas</h3>
  <p style="font-size:13px;color:var(--muted)">Semantic-match gain from each mode (baseline = first bar).
    <span id="delta-controls"></span></p>
  <div id="delta-charts"></div>

  <h3 style="margin-top:28px;">Failure taxonomy</h3>
  <p style="font-size:13px;color:var(--muted)">Share of failure events by family (LakeQA traces).</p>
  <div class="table-wrap" id="fail-table"></div>

  <h3 style="margin-top:28px;">Plan-trajectory audit</h3>
  <p style="font-size:13px;color:var(--muted)">Agents write good plans but don't reliably follow them.</p>
  <div class="table-wrap" id="traj-table"></div>
</div></section>
```

- [ ] **Step 2: Append renderers to `assets/js/app.js`** — guarded so they no-op on the Home page (containers absent).

```js
async function initMethodFindings() {
  if (!document.getElementById("e2e-table")) return;
  const [e2e, deltas, failures] = await Promise.all([
    fetch("assets/data/endtoend.json").then((r) => r.json()),
    fetch("assets/data/deltas.json").then((r) => r.json()),
    fetch("assets/data/failures.json").then((r) => r.json()),
  ]);
  renderE2E(e2e);
  renderDeltas(deltas);
  renderFailures(failures);
}

function renderE2E(e2e) {
  const benches = ["LakeQA", "KramaBench"];
  const models = ["gpt-5.4-nano", "gpt-5-mini"];
  let html = "<table><thead><tr><th>Benchmark</th><th>Model</th><th>Mode</th>" +
    "<th>SM %</th><th>D_ret %</th><th>D_acc %</th><th>Ret</th><th>Acc</th></tr></thead><tbody>";
  for (const b of benches) for (const m of models)
    e2e[b][m].forEach((r, i) => {
      html += `<tr><td>${i === 0 ? b : ""}</td><td>${i === 0 ? m : ""}</td>` +
        `<td><span class="mode-chip${r.mode === "Ideal" ? " ideal" : ""}">${r.mode}</span></td>` +
        `<td style="text-align:right">${r.sm.toFixed(1)}</td><td style="text-align:right">${r.dret.toFixed(1)}</td>` +
        `<td style="text-align:right">${r.dacc.toFixed(1)}</td><td style="text-align:right">${r.ret_call.toFixed(1)}</td>` +
        `<td style="text-align:right">${r.acc_call.toFixed(1)}</td></tr>`;
    });
  document.getElementById("e2e-table").innerHTML = html + "</tbody></table>";
}

const deltaState = { bench: "LakeQA", model: "gpt-5.4-nano", data: null };
function renderDeltas(data) {
  if (data) deltaState.data = data;
  const ctrl = document.getElementById("delta-controls");
  ctrl.innerHTML =
    ["LakeQA", "KramaBench"].map((b) => `<button class="dchip${b === deltaState.bench ? " active" : ""}" data-b="${b}">${b}</button>`).join(" ") +
    " · " +
    ["gpt-5.4-nano", "gpt-5-mini"].map((m) => `<button class="dchip${m === deltaState.model ? " active" : ""}" data-m="${m}">${m}</button>`).join(" ");
  ctrl.querySelectorAll("button").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (btn.dataset.b) deltaState.bench = btn.dataset.b;
      if (btn.dataset.m) deltaState.model = btn.dataset.m;
      renderDeltas();
    }));

  const groups = deltaState.data[deltaState.bench][deltaState.model];
  const maxAbs = Math.max(...Object.values(groups).flat().map((d) => Math.abs(d.delta)), 1);
  let html = "";
  for (const [name, items] of Object.entries(groups)) {
    html += `<div class="delta-group"><div class="label">${name}</div>`;
    for (const it of items) {
      const w = (Math.abs(it.delta) / maxAbs) * 100;
      const z = it.delta === 0 ? " zero" : "";
      const sign = it.delta > 0 ? "+" : "";
      html += `<div class="delta-row"><span>${it.label}</span>` +
        `<span><span class="delta-bar${z}" style="width:${w}%"></span></span>` +
        `<span class="delta-val">${it.sm.toFixed(1)} (${sign}${it.delta.toFixed(1)})</span></div>`;
    }
    html += "</div>";
  }
  document.getElementById("delta-charts").innerHTML = html;
}

function renderFailures(f) {
  let t = "<table><thead><tr><th>Group</th><th>gpt-5-mini</th><th>gpt-5.4-nano</th><th>Meaning</th></tr></thead><tbody>";
  f.taxonomy.rows.forEach((r) => {
    t += `<tr><td>${r.group}</td><td style="text-align:right">${r.mini.toFixed(1)}%</td>` +
      `<td style="text-align:right">${r.nano.toFixed(1)}%</td><td style="font-size:13px;color:var(--muted)">${r.meaning}</td></tr>`;
  });
  document.getElementById("fail-table").innerHTML = t + "</tbody></table>";

  let j = "<table><thead><tr><th>Model</th><th>Plan</th><th>Followed</th><th>Followed + Mostly</th></tr></thead><tbody>";
  f.trajectory.rows.forEach((r) => {
    j += `<tr><td>${r.model}</td><td><span class="mode-chip${r.plan === "Ideal" ? " ideal" : ""}">${r.plan}</span></td>` +
      `<td style="text-align:right">${r.followed.toFixed(1)}%</td><td style="text-align:right">${r.mostly.toFixed(1)}%</td></tr>`;
  });
  document.getElementById("traj-table").innerHTML = j + "</tbody></table>";
}

initMethodFindings();
```

- [ ] **Step 3: Add `.dchip` styling** to `assets/css/style.css`:

```css
.dchip { border:1px solid var(--border,#e4e4ea); background:#fff; border-radius:999px; padding:2px 10px; font:inherit; font-size:12px; cursor:pointer; color:var(--muted); }
.dchip.active { background:var(--accent); color:#fff; border-color:var(--accent); }
.delta-group .label { font-size:13px; font-weight:600; margin-bottom:4px; }
```

- [ ] **Step 4: Verify** — open `method.html`. Expected: end-to-end table (12 data rows), delta charts with switchable bench/model chips (bars proportional, zero-baseline bars gray, signed labels), failure taxonomy table, trajectory table. Switching delta chips re-renders. No console errors. Confirm Home page still works (renderers no-op there).

- [ ] **Step 5: Commit**

```bash
git add method.html assets/js/app.js assets/css/style.css
git commit -m "feat: method findings — end-to-end, delta charts, failure taxonomy, trajectory"
```

---

## Task 10: Get started page

**Files:**
- Create: `get-started.html`
- Reference: `reference/lakeqa-bench-site/get-started.html`

- [ ] **Step 1: Page shell** — same `<head>`/header/footer, `get-started.html` nav `active`, `<title>Get started — SANA</title>`, `.page-title-strip` with `<h1>Get started</h1>` + "Run SANA on your own agent and read its diagnosis."

- [ ] **Step 2: Numbered sections** using `.bibtex` blocks for commands (mirror LakeQA's get-started). Use `[FILL IN]` only where the repo's exact CLI is unknown — and add a visible note that those are placeholders.

```html
<section><div class="container-wide">
  <h2>1. Prerequisites</h2>
  <ul>
    <li>Python <strong>3.10+</strong> and <code>git</code></li>
    <li>An OpenAI API key (the paper evaluates <code>gpt-5.4-nano</code> and <code>gpt-5-mini</code>)</li>
  </ul>
</div></section>

<section><div class="container-wide">
  <h2>2. Get the code</h2>
  <pre class="bibtex">git clone https://github.com/Austin-Senna/exploratory-qa-eval
cd exploratory-qa-eval
pip install -e .</pre>
  <p>The repo ships the SANA ablation tools (<code>plan_ideal</code>, <code>search_ideal</code>,
  <code>execute_ideal</code>), the task profiles, and the evaluation harness.</p>
</div></section>

<section><div class="container-wide">
  <h2>3. Inspect a task profile</h2>
  <p>Each profile holds the source sequence, sanitized subquestions, and execution records
  (see <a href="method.html">Method</a>). These drive the idealized tools.</p>
  <pre class="bibtex"># [FILL IN — exact path/command from the repo]
ls tasks/        # LakeQA + converted KramaBench profiles</pre>
</div></section>

<section><div class="container-wide">
  <h2>4. Run an ablation condition</h2>
  <p>Pick one mode per axis. Holding two axes at <code>Ideal</code> and varying the third
  isolates that component's contribution.</p>
  <pre class="bibtex"># [FILL IN — exact CLI from the repo]
python -m sana.run \
    --benchmark lakeqa_mini \
    --model gpt-5.4-nano \
    --plan ideal --search bm25 --data-analysis ideal \
    --budget 30 --out runs/search_bm25/</pre>
</div></section>

<section><div class="container-wide">
  <h2>5. Read the diagnosis</h2>
  <p>Compare semantic match across conditions. If idealizing an axis closes a large gap,
  that component is your bottleneck. The gap that remains when all three are idealized is
  attributable to the agent's <strong>policy</strong> — evidence tracking, source commitment,
  intermediate validation, and stopping criteria.</p>
</div></section>

<section><div class="container-wide">
  <h2>6. Cite</h2>
  <pre class="bibtex">@inproceedings{sana2026,
  title     = {SANA: What Matters for QA Agents over Massive Data Lakes?},
  author    = {Wijaya, Austin Senna and Liu, Jiaxiang and Wang, Haonan and Wu, Eugene},
  booktitle = {VLDB 2026 Workshop on Systems for Data-centric Agents with Human-in-the-loop (DASHSys)},
  year      = {2026}
}</pre>
</div></section>
```

Add a note near the top: a small muted line stating that commands marked `[FILL IN]` should be replaced with the repo's exact CLI before launch.

- [ ] **Step 3: Verify** — open `get-started.html`. Expected: six sections, code blocks styled, nav active state correct.

- [ ] **Step 4: Commit**

```bash
git add get-started.html
git commit -m "feat: get-started page (run SANA on your own agent)"
```

---

## Task 11: README + final QA

**Files:**
- Modify: `README.md`
- (no code changes; verification + docs)

- [ ] **Step 1: Replace `README.md`** with site docs:

```markdown
# SANA benchmark site

Static companion site for **SANA: What Matters for QA Agents over Massive Data Lakes?** (VLDB 2026 DASHSys workshop).

Vanilla HTML/CSS/JS — no framework, no build step. Served from the repo root on GitHub Pages.

## Layout
- `index.html` — home: framework diagram + interactive ablation explorer + findings + citation
- `method.html` — task anatomy, SANA profile, idealized tools, conditions, metrics, full findings
- `get-started.html` — run SANA on your own agent
- `assets/css/style.css`, `assets/js/app.js`, `assets/data/*.json`, `assets/daplab-h.png`
- `.nojekyll` — disables Jekyll so `assets/` paths resolve

## Run locally
```sh
python3 -m http.server 8000
```
Open http://localhost:8000/.

## Before launch
- Set the real Paper (PDF) and Dataset hrefs in `index.html` (`#paper-link`, `#data-link`).
- Replace `[FILL IN]` commands in `get-started.html` with the repo's exact CLI.
- Result numbers come from the paper; see `docs/superpowers/specs/2026-06-10-sana-website-design.md`.
```

- [ ] **Step 2: Full-site QA pass** (Playwright MCP, optional but recommended)

Use the Playwright MCP tools to:
- Navigate to each of `/`, `/method.html`, `/get-started.html`.
- Assert no console errors (`browser_console_messages`).
- Screenshot each page (`browser_take_screenshot`) and eyeball against the LakeQA reference for family resemblance + the purple accent.
- On Home: click each tab + model button, click a couple of column headers, hover a diagram mode — confirm highlight.

If Playwright isn't available, do the same checks manually in a browser.

- [ ] **Step 3: Cross-check numbers** — spot-check 4–5 rendered cells against the spec Data Appendix (e.g., LakeQA/nano Ideal/Ideal/Ideal SM = 37.0; KramaBench/mini Preloaded SM = 92.8; failure taxonomy Execution/computation mini = 39.6%).

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: site README + pre-launch checklist"
```

- [ ] **Step 5: Offer to open a PR / merge** (per finishing-a-development-branch) — do not push without the user's go-ahead.

---

## Self-review against spec

- **Stack & deployment** → Task 1 (`.nojekyll`, root, forked CSS), Task 11 (README/deploy). ✓
- **Visual identity** (Source Serif 4, amethyst `#5e4b8b`, DAP Lab logo, diagram hero) → Tasks 1, 3, 4. ✓
- **Home**: hero, diagram, "What is SANA?", explorer (tabs/toggle/sort), findings, links, citation → Tasks 3–7. ✓
- **Method**: task anatomy, profile example, idealized tools, condition table, metrics, end-to-end, deltas, failure taxonomy, trajectory → Tasks 8–9. ✓
- **Get started**: prereqs → clone → profiles → run condition → diagnosis → cite → Task 10. ✓
- **Data layer**: 5 JSON files + `app.js` renderers → Tasks 2, 5, 9. ✓
- **Read-only / no submissions** → no submission task exists by design. ✓
- **Verification** (serve, manual + Playwright, number cross-check) → each task + Task 11. ✓

No unresolved placeholders beyond the intentional, clearly-marked `[FILL IN]` paper/dataset links and repo CLI commands (flagged in-page and in the README pre-launch checklist). Method/property names are consistent across tasks (`data_an`, `dret`/`dacc`, `mode-chip`, `is-hot`, `renderMatrix`, `initDiagramLink`, `renderDeltas`).
