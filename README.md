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
