# SANA benchmark site

Static companion site for **SANA: What Matters for QA Agents over Massive Data Lakes?** (VLDB 2026 DASHSys workshop).

Vanilla HTML/CSS/JS — no framework, no build step. Served from the repo root on GitHub Pages.

## Layout
- `index.html` — home: two-column LakeQA-style layout (left: SANA + ablation framework + links + citation; right: paper-style ablation delta charts + findings). Hero has a benchmark stat strip (LakeQA, KramaBench). Click the SANA wordmark 5× for an easter egg.
- `pipeline.html` — the three SANA modules as one workflow: sana-profiling → sana-evaluation → sana-analysis (concept + run instructions per stage).
- `assets/css/style.css`, `assets/js/app.js`, `assets/data/deltas.json`, `assets/daplab-h.png`, `assets/sana.jpg`
- `.nojekyll` — disables Jekyll so `assets/` paths resolve

## Run locally
```sh
python3 -m http.server 8000
```
Open http://localhost:8000/.

## Before launch
- Set the real Paper (PDF) and Dataset hrefs in `index.html` (`#paper-link`, `#data-link`).
- Replace `[FILL IN]` commands in `pipeline.html` with the eval repo's exact CLI.
- Result numbers come from the paper; see `docs/superpowers/specs/2026-06-10-sana-website-design.md`.
