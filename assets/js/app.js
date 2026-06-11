// SANA site — ablation delta charts, method findings, and an easter egg.

/* ---------- Ablation delta charts (Home right column + Method) ---------- */

const deltaState = { bench: "LakeQA", model: "gpt-5.4-nano", data: null };

async function initDeltas() {
  if (!document.getElementById("delta-charts")) return;
  const data = await fetch("assets/data/deltas.json").then((r) => r.json());
  renderDeltas(data);
}

const BENCHES = ["LakeQA", "KramaBench"];
const MODELS = ["gpt-5.4-nano", "gpt-5-mini"];
// Longest bar uses this fraction of the track, leaving room for the inline label.
const BAR_MAX_PCT = 70;

function renderDeltas(data) {
  if (data) deltaState.data = data;
  const ctrl = document.getElementById("delta-controls");

  // Build the two dropdowns once, then just keep them in sync with state.
  if (!ctrl.dataset.ready) {
    const opts = (vals, sel) =>
      vals.map((v) => `<option value="${v}"${v === sel ? " selected" : ""}>${v}</option>`).join("");
    ctrl.innerHTML =
      `<label class="d-select">Benchmark <select id="d-bench">${opts(BENCHES, deltaState.bench)}</select></label>` +
      `<label class="d-select">Model <select id="d-model">${opts(MODELS, deltaState.model)}</select></label>`;
    ctrl.dataset.ready = "1";
    ctrl.querySelector("#d-bench").addEventListener("change", (e) => {
      deltaState.bench = e.target.value;
      renderDeltaCharts();
    });
    ctrl.querySelector("#d-model").addEventListener("change", (e) => {
      deltaState.model = e.target.value;
      renderDeltaCharts();
    });
  }
  ctrl.querySelector("#d-bench").value = deltaState.bench;
  ctrl.querySelector("#d-model").value = deltaState.model;
  renderDeltaCharts();
}

function renderDeltaCharts() {
  const groups = deltaState.data[deltaState.bench][deltaState.model];
  // Bar length is proportional to absolute SM (like the paper); color encodes the delta sign.
  const maxSM = Math.max(...Object.values(groups).flat().map((d) => d.sm), 1);
  let html = "";
  for (const [name, items] of Object.entries(groups)) {
    html += `<div class="delta-group"><div class="label">${name}</div>`;
    for (const it of items) {
      const w = (it.sm / maxSM) * BAR_MAX_PCT;
      const cls = it.delta > 0 ? "up" : it.delta < 0 ? "down" : "base";
      const dcls = it.delta > 0 ? "d-pos" : it.delta < 0 ? "d-neg" : "";
      const sign = it.delta >= 0 ? "+" : "";         // negatives already carry "-"
      const deltaTxt = `<span class="${dcls}">${sign}${it.delta.toFixed(1)}%</span>`;
      html += `<div class="delta-row"><span class="delta-mode">${it.label}</span>` +
        `<div class="delta-track">` +
        `<span class="delta-bar ${cls}" style="width:${w}%"></span>` +
        `<span class="delta-val">${it.sm.toFixed(1)}% (${deltaTxt})</span>` +
        `</div></div>`;
    }
    html += "</div>";
  }
  document.getElementById("delta-charts").innerHTML = html;
}

/* ---------- Easter egg: click the SANA wordmark 5× ---------- */

function initEasterEgg() {
  const trigger = document.querySelector(".hero h1");
  if (!trigger) return;
  trigger.style.cursor = "pointer";
  let clicks = 0;
  let timer;
  trigger.addEventListener("click", () => {
    clicks += 1;
    clearTimeout(timer);
    timer = setTimeout(() => { clicks = 0; }, 1200);
    if (clicks >= 5) { clicks = 0; showEgg(); }
  });
}

function showEgg() {
  if (document.getElementById("sana-egg")) return;
  const ov = document.createElement("div");
  ov.id = "sana-egg";
  ov.className = "egg-overlay";
  ov.innerHTML =
    '<div class="egg-card" role="dialog" aria-label="The other SANA">' +
    '<button class="egg-close" aria-label="Close">×</button>' +
    '<img src="assets/sana.jpg" alt="Sana from TWICE" />' +
    '<p class="egg-cap">the <em>other</em> SANA — from TWICE ✨</p>' +
    "</div>";
  const close = () => {
    ov.remove();
    document.removeEventListener("keydown", onKey);
  };
  function onKey(e) { if (e.key === "Escape") close(); }
  ov.addEventListener("click", (e) => {
    if (e.target === ov || e.target.classList.contains("egg-close")) close();
  });
  document.addEventListener("keydown", onKey);
  document.body.appendChild(ov);
}

/* ---------- boot ---------- */

initDeltas();
initEasterEgg();
