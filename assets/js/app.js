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

/* ---------- Method findings: end-to-end + failure tables ---------- */

async function initMethodFindings() {
  if (!document.getElementById("e2e-table")) return;
  const [e2e, failures] = await Promise.all([
    fetch("assets/data/endtoend.json").then((r) => r.json()),
    fetch("assets/data/failures.json").then((r) => r.json()),
  ]);
  renderE2E(e2e);
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
initMethodFindings();
initEasterEgg();
