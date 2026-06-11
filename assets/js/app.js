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
