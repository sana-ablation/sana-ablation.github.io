// SANA site — ablation delta charts, method findings, and an easter egg.

/* ---------- Ablation delta charts (Home right column + Method) ---------- */

const deltaState = { bench: "LakeQA", model: "gpt-5.4-nano", data: null };

async function initDeltas() {
  if (!document.getElementById("delta-charts")) return;
  const data = await fetch("assets/data/deltas.json").then((r) => r.json());
  renderDeltas(data);
}

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
  // Bar length is proportional to absolute SM (like the paper); color encodes the delta sign.
  const maxSM = Math.max(...Object.values(groups).flat().map((d) => d.sm), 1);
  let html = "";
  for (const [name, items] of Object.entries(groups)) {
    html += `<div class="delta-group"><div class="label">${name}</div>`;
    for (const it of items) {
      const w = (it.sm / maxSM) * 100;
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
