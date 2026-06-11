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
  initDiagramLink();
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
    if (av === null) return 1;            // nulls (D_ret "—") sink
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
