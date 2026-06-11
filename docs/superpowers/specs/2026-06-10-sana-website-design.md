# SANA Benchmark Site — Design

**Date:** 2026-06-10
**Author:** Austin Senna Wijaya
**Status:** Draft for review

## Context

SANA ("Search Agent Navigation Ablation framework") is a diagnostic ablation
framework for Exploratory-QA (EQA) agents over data lakes, from the paper
*"SANA: What Matters for QA Agents over Massive Data Lakes?"* (Columbia / DAP
Lab, VLDB 2026 DASHSys workshop). We want a public companion website, modeled on
the existing **LakeQA benchmark site** (`reference/lakeqa-bench-site/`), so the
two read as a family.

The key adaptation: LakeQA's site is organized around a **community submission
leaderboard** ("submit your system, we rank it"). SANA is a *diagnostic
framework*, not a competition — its centerpiece is the **ablation matrix**
(Plan × Search × Data-Analysis modes → SM / D_acc / D_ret). So the leaderboard
slot becomes a **read-only interactive results explorer**. No community
submissions.

All result numbers come directly from the paper's tables/figures — nothing is
invented. The full source-of-truth data is captured in the Data Appendix below.

## Goals

- A 3-page static site (Home / Method / Get started) that explains SANA, lets
  visitors explore the ablation results interactively, and tells them how to run
  SANA on their own agent.
- Visually a sibling of the LakeQA site (same skeleton/type) but with its own
  SANA identity (purple accent, framework-diagram hero).
- Fully data-backed from the paper; deployable to GitHub Pages with no build step.

## Non-goals

- No community submission flow / PR-a-row leaderboard.
- No backend, no build tooling, no framework.
- Not a faithful reproduction of LakeQA's numbers (SANA's baseline is stronger;
  results are SANA's own).

## Stack & deployment

Mirror LakeQA exactly:

- **Vanilla HTML/CSS/JS**, no build step.
- **GitHub Pages** from repo root, with `.nojekyll`.
- Result data in JSON under `assets/data/`, rendered client-side.
- Built at the **repo root**: `index.html`, `method.html`, `get-started.html`,
  `assets/`. `reference/lakeqa-bench-site/` is left untouched as reference.
- `assets/daplab-h.png` (already present) used for the lab logo.

## Visual identity

LakeQA's skeleton with a SANA accent:

- **Type:** Source Serif 4 (same as LakeQA).
- **Palette:** LakeQA's ink/near-black text on light background; replace LakeQA's
  blue with a **muted amethyst purple** — accent `#5e4b8b`, deeper
  `#3f2d63` for hover/headings. Deliberately *not* the electric `#8b5cf6`
  AI-default violet. Final hex tunable during implementation.
- **Logo:** DAP Lab logo (`assets/daplab-h.png`) in header (right of brand) and
  footer.
- **Hero:** distinct from LakeQA's plain text hero — features the interactive
  framework diagram.
- Reuse LakeQA's CSS variables/structure (`--muted`, card, `.container-wide`,
  nav, footer rhythm, `.bibtex`/`.json-viewer` blocks, `.table-wrap`).

## Site structure

### Home — `index.html`

1. **Header / nav:** brand "SANA" + DAP Lab logo; nav Home / Method / Get started.
2. **Hero:** title "SANA"; tagline *"What matters for QA agents over massive data
   lakes?"*; subtagline *"A diagnostic ablation framework that pinpoints where
   data-lake agents fail — search, planning, data analysis, or policy."*
3. **Interactive framework diagram** (signature visual, recreates Fig 2): three
   component columns — **Planning** (Naive · Standard · Ideal), **Search** (Naive/BM25
   · Standard/Hybrid · Ideal · Preloaded), **Data Analysis** (Standard · Ideal).
   The active mode in each column is marked. Hover/click a mode → highlights the
   matching row in the explorer below. Built in HTML/CSS (+ small SVG/JS for the
   highlight link).
4. **"What is SANA?" card:** plain-language explanation of the
   profile → idealize → ablate → diagnose idea.
5. **Interactive results explorer** (the centerpiece):
   - **Benchmark tabs:** LakeQA (135) · KramaBench (83).
   - **Model toggle:** gpt-5.4-nano · gpt-5-mini.
   - **Columns:** Plan, Search, Data-An., SM %, D_acc %, D_ret %, Ret calls, Acc calls.
   - Click any numeric column header to sort (LakeQA-style).
   - Preloaded rows show "—" for D_ret.
6. **Key findings** (callout strip, 3 items):
   - Data analysis is the consistent bottleneck across both benchmarks.
   - Search dominates on LakeQA's ~40M-file lake but matters less on KramaBench.
   - Agents *write* good plans but don't reliably *follow* them.
7. **Links + citation:** Paper (PDF) `[FILL IN — placeholder]`, Code
   `https://github.com/Austin-Senna/exploratory-qa-eval`, Data `[FILL IN]`; BibTeX
   block (authors: Wijaya, Liu, Wang, Wu — Columbia; VLDB 2026 DASHSys).
8. **Footer:** SANA · VLDB 2026 DASHSys · DAP Lab · nav links.

### Method — `method.html`

1. **Anatomy of an EQA task:** the tuple τ = (Q, D, D_gold, T, A★, B); the
   subquestion-entailment chain (eq. 1); the two tool classes (search f(q,k),
   analysis g(c,d)).
2. **The SANA profile — worked example** (recreates Fig 3), styled like LakeQA's
   `.json-viewer`: the Bronx task → **source sequence** (`The_Bronx` →
   `nypd-complaints` → `nypd-shootings`), **sanitized subquestions** (3),
   **execution records** (SQL + intent + answers `18613`, `42`).
3. **The three idealized tools** (recreates Fig 4): `plan_ideal`, `search_ideal`,
   `execute_ideal` — what each consumes from the profile and returns (incl. the
   semantic-judge + repair-subagent flow for `execute_ideal`).
4. **Condition space** (Table 2): a mode table for Planning / Search / Data analysis.
5. **Metrics:** SM (LLM-as-judge semantic match, primary), D_ret (retrieval
   recall over D_gold), D_acc (access recall over D_gold), tool-call counts.
6. **Findings** (the full diagnostic story):
   - **End-to-end mode comparison** (Naive / Standard / Ideal — Tables 4 & 8).
   - **Delta bar charts** per component (Figs 5 & 7), per benchmark + model.
   - **Failure taxonomy** table (Table 6), with the per-model event shares.
   - **Plan-trajectory audit** (Table 5) — "plans written ≠ plans followed."

### Get started — `get-started.html`

Mirrors LakeQA's flow but for *running SANA on your own agent*:

1. Prerequisites (Python, the eval repo).
2. Clone `exploratory-qa-eval`.
3. Build / inspect task profiles (source sequence, sanitized subquestions,
   execution records).
4. Run an ablation condition — pick a mode per axis (Plan / Search / Data-An.).
5. Read your diagnosis — which idealization closed the gap → which component is
   your bottleneck; residual gap = policy failure.
6. Cite (BibTeX).

Commands/paths under `[FILL IN]` where the repo's exact CLI isn't known.

## Data layer

- `assets/data/lakeqa_ablation.json` — Table 3 matrix, keyed by model.
- `assets/data/kramabench_ablation.json` — Table 7 matrix, keyed by model.
- `assets/data/endtoend.json` — Tables 4 & 8.
- `assets/data/deltas.json` — Figs 5 & 7 (component deltas, per benchmark/model).
- `assets/data/failures.json` — Table 6 taxonomy + Table 5 trajectory audit.
- `assets/js/app.js` — handles benchmark tabs, model toggle, column sort, and the
  diagram ↔ explorer-row highlight. (Analogous to LakeQA's `leaderboard.js`.)
- `assets/css/style.css` — forked from LakeQA's stylesheet with the SANA palette.

## Components (isolation/clarity)

- **Diagram** (Home): self-contained HTML/CSS block + a small JS module that emits
  "mode hovered/selected" events. Depends only on a mode→row-id map.
- **Explorer** (Home): renders a matrix JSON into a sortable table; subscribes to
  diagram events to highlight rows. Depends only on the JSON shape + a container id.
- **Delta charts** (Method): pure-CSS horizontal bars from `deltas.json` (no chart
  lib). Depends only on the JSON.
- **Tables** (Method): static-rendered from JSON (end-to-end, failures, trajectory).
- Each reads one JSON file and one container id — testable/inspectable in isolation.

## Verification

- `python3 -m http.server 8000` at repo root; open `http://localhost:8000/`.
- Manually: switch benchmark tabs and model toggle → matrix updates; click numeric
  headers → sorts; hover a diagram mode → corresponding row highlights.
- Cross-check rendered numbers against the Data Appendix below.
- (Optional) Playwright MCP smoke test: load each page, assert nav + explorer render,
  screenshot for visual QA against the LakeQA reference.
- Confirm `.nojekyll` present and `assets/` paths resolve when served from root.

---

## Data Appendix (source of truth — transcribed from the paper)

### Table 1 — Benchmark statistics
| Benchmark | Tasks | Sources | Avg \|D_gold\| | Lake size \|D\| |
|---|---|---|---|---|
| LakeQA | 135 | 499 | 6.9 | ~40 million |
| KramaBench-conv. | 83 | 187 | 2.3 | 1764 |

### Table 2 — Condition space
- **Planning:** Naive (no planning tool; answer directly) · Standard (planning
  tool, self-written plan, no sanitized sequence) · Ideal (sanitized subquestion
  sequence + planning tool).
- **Search:** Naive (BM25 sparse lexical) · Standard (Hybrid RRF + LLM table
  descriptions, Pneuma/AutoDDG) · Ideal (f_ideal over D_gold) · Preloaded (D_gold
  in context, no search tool).
- **Data analysis:** Standard (write/run SQL or Python) · Ideal (g_ideal
  intent-based execution tool).

### Table 3 — LakeQA ablation matrix (135 tasks/cell)
Columns: Plan, Search, DataAn, SM%, D_acc%, D_ret%, Ret-calls, Acc-calls

**gpt-5.4-nano**
| Plan | Search | DataAn | SM | D_acc | D_ret | Ret | Acc |
|---|---|---|---|---|---|---|---|
| Naive | Ideal | Ideal | 34.1 | 46.5 | 56.5 | 3.2 | 11.6 |
| Standard | Ideal | Ideal | 31.1 | 47.0 | 57.6 | 4.1 | 13.2 |
| Ideal | Naive | Ideal | 23.0 | 39.0 | 50.8 | 5.8 | 12.3 |
| Ideal | Standard | Ideal | 26.7 | 43.4 | 55.4 | 4.7 | 13.2 |
| Ideal | Ideal | Standard | 28.9 | 44.0 | 56.9 | 3.8 | 13.6 |
| Ideal | Ideal | Ideal | 37.0 | 47.1 | 58.1 | 4.1 | 12.5 |
| Ideal | Preloaded | Ideal | 51.8 | 59.2 | — | 0.0 | 17.1 |

**gpt-5-mini**
| Plan | Search | DataAn | SM | D_acc | D_ret | Ret | Acc |
|---|---|---|---|---|---|---|---|
| Naive | Ideal | Ideal | 66.7 | 55.1 | 59.0 | 5.8 | 13.1 |
| Standard | Ideal | Ideal | 66.7 | 56.2 | 58.8 | 5.8 | 14.4 |
| Ideal | Naive | Ideal | 63.0 | 50.7 | 56.5 | 5.9 | 15.4 |
| Ideal | Standard | Ideal | 61.5 | 52.4 | 58.0 | 5.8 | 15.9 |
| Ideal | Ideal | Standard | 57.8 | 53.8 | 58.7 | 5.7 | 12.9 |
| Ideal | Ideal | Ideal | 76.3 | 56.5 | 60.2 | 5.9 | 14.1 |
| Ideal | Preloaded | Ideal | 77.0 | 61.7 | — | 0.0 | 16.8 |

### Table 7 — KramaBench ablation matrix (83 tasks/cell)
**gpt-5.4-nano**
| Plan | Search | DataAn | SM | D_acc | D_ret | Ret | Acc |
|---|---|---|---|---|---|---|---|
| Naive | Ideal | Ideal | 75.9 | 81.7 | 89.9 | 1.7 | 3.2 |
| Standard | Ideal | Ideal | 85.5 | 89.3 | 91.0 | 1.4 | 3.7 |
| Ideal | Naive | Ideal | 85.5 | 50.1 | 78.9 | 2.9 | 4.0 |
| Ideal | Standard | Ideal | 90.4 | 43.5 | 77.1 | 2.1 | 4.0 |
| Ideal | Ideal | Standard | 63.9 | 92.9 | 93.9 | 1.3 | 2.9 |
| Ideal | Ideal | Ideal | 87.9 | 92.3 | 95.8 | 1.6 | 3.5 |
| Ideal | Preloaded | Ideal | 91.6 | 98.4 | — | 0.0 | 3.7 |

**gpt-5-mini**
| Plan | Search | DataAn | SM | D_acc | D_ret | Ret | Acc |
|---|---|---|---|---|---|---|---|
| Naive | Ideal | Ideal | 86.8 | 93.9 | 95.8 | 1.4 | 4.6 |
| Standard | Ideal | Ideal | 89.2 | 93.7 | 94.3 | 1.4 | 4.6 |
| Ideal | Naive | Ideal | 84.3 | 51.6 | 82.0 | 2.7 | 4.2 |
| Ideal | Standard | Ideal | 90.4 | 50.8 | 78.9 | 2.0 | 4.1 |
| Ideal | Ideal | Standard | 75.9 | 96.7 | 96.7 | 1.5 | 3.4 |
| Ideal | Ideal | Ideal | 90.4 | 97.0 | 97.6 | 1.2 | 4.1 |
| Ideal | Preloaded | Ideal | 92.8 | 99.0 | — | 0.0 | 4.6 |

### Table 4 — LakeQA end-to-end (n=135)
Columns: Mode, SM%, D_ret%, D_acc%, Ret, Acc  *(note: D_ret before D_acc here)*

**gpt-5.4-nano:** Naive 20.7 / 45.4 / 30.7 / 5.0 / 11.0 · Standard 19.3 / 53.2 /
39.5 / 5.2 / 14.1 · Ideal 37.0 / 58.1 / 47.1 / 4.1 / 12.5
**gpt-5-mini:** Naive 56.3 / 53.8 / 45.5 / 7.2 / 12.1 · Standard 57.8 / 56.9 /
48.5 / 6.0 / 13.2 · Ideal 76.3 / 60.2 / 56.5 / 5.9 / 14.1

### Table 8 — KramaBench end-to-end (n=83)
**gpt-5.4-nano:** Naive 44.6 / 64.2 / 31.8 / 3.2 / 3.3 · Standard 57.8 / 70.6 /
44.6 / 2.4 / 3.6 · Ideal 87.9 / 95.8 / 92.3 / 1.6 / 3.5
**gpt-5-mini:** Naive 62.6 / 64.7 / 36.0 / 3.8 / 3.6 · Standard 66.3 / 68.5 /
34.8 / 3.2 / 3.8 · Ideal 90.4 / 97.6 / 97.0 / 1.2 / 4.1

### Fig 5 — LakeQA semantic-match deltas (SM%, Δ vs baseline)
- **Plan, nano:** No-Plan 34.1 (+0.0) · Default 31.1 (−3.0) · Ideal 37.0 (+3.0)
- **Plan, mini:** No-Plan 66.7 (+0.0) · Default 66.7 (+0.0) · Ideal 76.3 (+9.6)
- **Search, nano:** BM25 23.0 (+0.0) · Pneuma 26.7 (+3.7) · Ideal 37.0 (+14.1) · Preloaded 51.8 (+28.9)
- **Search, mini:** BM25 63.0 (+0.0) · Pneuma 61.5 (−1.5) · Ideal 76.3 (+13.3) · Preloaded 77.0 (+14.1)
- **Data An., nano:** Standard 28.9 (+0.0) · Ideal 37.0 (+8.2)
- **Data An., mini:** Standard 57.8 (+0.0) · Ideal 76.3 (+18.5)

### Fig 7 — KramaBench semantic-match deltas
- **Plan, nano:** No-Plan 75.9 (+0.0) · Default 85.5 (+9.6) · Ideal 87.9 (+12.0)
- **Plan, mini:** No-Plan 86.8 (+0.0) · Default 89.2 (+2.4) · Ideal 90.4 (+3.6)
- **Search, nano:** BM25 85.5 (+0.0) · Pneuma 90.4 (+4.8) · Ideal 87.9 (+2.4) · Preloaded 91.6 (+6.0)
- **Search, mini:** BM25 84.3 (+0.0) · Pneuma 90.4 (+6.0) · Ideal 90.4 (+6.0) · Preloaded 92.8 (+8.4)
- **Data An., nano:** Standard 63.9 (+0.0) · Ideal 87.9 (+24.1)
- **Data An., mini:** Standard 75.9 (+0.0) · Ideal 90.4 (+14.5)

### Table 6 — Failure families (event share; gpt-5-mini, gpt-5.4-nano)
| Group | mini | nano | Meaning |
|---|---|---|---|
| Task/planning | 7.4% | 11.3% | Reasoning-chain divergence; question-constraint misread |
| Wrong source target | 0.0% | 7.6% | Chose wrong dataset / table / source family / version |
| Execution/computation | 39.6% | 26.2% | Wrong scope/filter; aggregation error; extraction/parsing error |
| Incomplete evidence | 12.2% | 12.3% | Ran out of budget; submitted early with incomplete evidence |
| Turn-waste | 2.1% | 8.8% | Query/repair loop; schema-inspection loop; low-yield search loop |
| Finalization | 21.0% | 13.2% | Correct evidence present but submitted answer wrong |
| Tool blocker | 17.7% | 20.6% | Files/tools/repair/unsupported formats/runtime limits blocked progress |

(Totals: gpt-5.4-nano 1018 failure events over 586 failed runs; gpt-5-mini 515
over 297 — ~1.74 events/failed run for both.)

### Table 5 — LakeQA plan-trajectory audit (Followed, Followed+Mostly)
| Model | Plan | Followed | Followed+Mostly |
|---|---|---|---|
| gpt-5-mini | Naive | 21.2% | 49.6% |
| gpt-5-mini | Standard | 12.6% | 46.4% (−3.2) |
| gpt-5-mini | Ideal | 25.9% | 56.5% (+6.9) |
| gpt-5.4-nano | Naive | 5.7% | 19.0% |
| gpt-5.4-nano | Standard | 8.4% | 24.0% (+4.9) |
| gpt-5.4-nano | Ideal | 7.9% | 28.1% (+9.1) |

### Evaluation setup facts (for copy)
- Budget B = 30 tool calls/run; max runtime 600 s; tool timeout 150 s.
- Agents: gpt-5.4-nano (weaker), gpt-5-mini (stronger). Idealization helpers use
  gpt-5.4-nano / gpt-5.4 (repair); judges use gpt-5.4-mini.
- Orchestrated with Strands Agent SDK on AWS g6.2xlarge; DuckDB/Python sandbox.
- SANA baseline is stronger than original LakeQA (summarizing conversation
  manager; strategy-nudge plugin after 7 repeated ops; metadata-augmented search)
  → results are not a direct LakeQA reproduction.

### Identity / links
- Title: *SANA: What Matters for QA Agents over Massive Data Lakes?*
- Authors: Austin Senna Wijaya, Jiaxiang Liu, Haonan Wang, Eugene Wu — Columbia University.
- Venue: VLDB 2026 Workshop on Systems for Data-centric Agents with
  Human-in-the-loop (DASHSys).
- Code (public): https://github.com/Austin-Senna/exploratory-qa-eval
- Paper PDF / Dataset links: `[FILL IN]` placeholders for now.
- License: CC BY-NC-ND 4.0.
