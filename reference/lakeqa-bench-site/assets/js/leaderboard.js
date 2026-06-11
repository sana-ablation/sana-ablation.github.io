// LakeQA leaderboard renderer.
// Reads ?split=full|mini from the URL, fetches the matching JSON, renders a
// sortable table. Used by both leaderboard.html (full table) and index.html
// (top-N preview, via window.LakeQA.renderPreview).

(function () {
  const COLUMNS = [
    { key: "rank",      label: "#",        type: "rank",   sortable: false },
    { key: "model",     label: "Model",    type: "text",   sortable: false, cls: "model" },
    { key: "em",        label: "EM ↑",     type: "num",    sortable: true,  defaultDir: "desc" },
    { key: "runtime_s", label: "Runtime (s) ↓", type: "num", sortable: true, defaultDir: "asc" },
    { key: "cost_usd",  label: "Cost ($) ↓",     type: "num", sortable: true, defaultDir: "asc" },
    { key: "dacc_p",    label: "D_acc P",   type: "num",   sortable: true,  defaultDir: "desc" },
    { key: "dacc_r",    label: "D_acc R",   type: "num",   sortable: true,  defaultDir: "desc" },
    { key: "dacc_f1",   label: "D_acc F1",  type: "num",   sortable: true,  defaultDir: "desc" },
    { key: "dret_p",    label: "D_ret P",   type: "num",   sortable: true,  defaultDir: "desc" },
    { key: "dret_r",    label: "D_ret R",   type: "num",   sortable: true,  defaultDir: "desc" },
    { key: "dret_f1",   label: "D_ret F1",  type: "num",   sortable: true,  defaultDir: "desc" },
    { key: "reported",  label: "Reported", type: "text",   sortable: false },
    { key: "notes",     label: "Notes",    type: "text",   sortable: false },
  ];

  function fmt(value, type) {
    if (value === null || value === undefined || value === "") return "";
    if (type === "num") return Number(value).toFixed(2);
    return String(value);
  }

  function dataPath(split) {
    return `assets/data/leaderboard_${split}.json`;
  }

  async function loadSplit(split) {
    const res = await fetch(dataPath(split), { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load ${dataPath(split)}: ${res.status}`);
    return res.json();
  }

  function buildHead(table, sortKey, sortDir) {
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    COLUMNS.forEach((col) => {
      const th = document.createElement("th");
      th.textContent = col.label;
      if (col.type === "num" || col.type === "rank") th.classList.add("num");
      if (col.sortable) {
        th.classList.add("sortable");
        th.dataset.key = col.key;
        if (col.key === sortKey) {
          th.classList.add(sortDir === "asc" ? "sort-asc" : "sort-desc");
        }
        const arrow = document.createElement("span");
        arrow.className = "sort-arrow";
        th.appendChild(arrow);
      }
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
  }

  function buildBody(table, rows) {
    const tbody = document.createElement("tbody");
    rows.forEach((row, idx) => {
      const tr = document.createElement("tr");
      COLUMNS.forEach((col) => {
        const td = document.createElement("td");
        if (col.type === "rank") {
          td.classList.add("rank");
          td.textContent = idx + 1;
        } else {
          if (col.type === "num") td.classList.add("num");
          if (col.cls) td.classList.add(col.cls);
          td.textContent = fmt(row[col.key], col.type);
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  function sortRows(rows, key, dir) {
    const col = COLUMNS.find((c) => c.key === key);
    if (!col) return rows;
    const sorted = rows.slice().sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (col.type === "num") {
        return dir === "asc" ? av - bv : bv - av;
      }
      return dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return sorted;
  }

  function renderTable(container, rows, sortKey, sortDir) {
    container.innerHTML = "";
    const table = document.createElement("table");
    buildHead(table, sortKey, sortDir);
    buildBody(table, sortRows(rows, sortKey, sortDir));
    container.appendChild(table);

    container.querySelectorAll("th.sortable").forEach((th) => {
      th.addEventListener("click", () => {
        const key = th.dataset.key;
        let dir;
        if (key === sortKey) {
          dir = sortDir === "asc" ? "desc" : "asc";
        } else {
          const col = COLUMNS.find((c) => c.key === key);
          dir = (col && col.defaultDir) || "desc";
        }
        renderTable(container, rows, key, dir);
      });
    });
  }

  function getSplitFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("split");
    return s === "mini" ? "mini" : "full";
  }

  function setSplitInUrl(split) {
    const url = new URL(window.location.href);
    url.searchParams.set("split", split);
    window.history.replaceState({}, "", url);
  }

  async function renderLeaderboard(opts) {
    const tableContainer = document.getElementById(opts.tableContainerId);
    const tabsContainer  = document.getElementById(opts.tabsContainerId);
    if (!tableContainer) return;

    let split = getSplitFromUrl();

    async function load(s) {
      try {
        const rows = await loadSplit(s);
        renderTable(tableContainer, rows, "em", "desc");
      } catch (err) {
        tableContainer.innerHTML = `<div class="banner">Failed to load leaderboard: ${err.message}</div>`;
      }
    }

    if (tabsContainer) {
      tabsContainer.querySelectorAll(".tab").forEach((tab) => {
        const tabSplit = tab.dataset.split;
        if (tabSplit === split) tab.classList.add("active");
        tab.addEventListener("click", () => {
          if (tab.dataset.split === split) return;
          split = tab.dataset.split;
          tabsContainer.querySelectorAll(".tab").forEach((t) =>
            t.classList.toggle("active", t === tab)
          );
          setSplitInUrl(split);
          load(split);
        });
      });
    }

    load(split);
  }

  window.LakeQA = window.LakeQA || {};
  window.LakeQA.renderLeaderboard = renderLeaderboard;
})();
