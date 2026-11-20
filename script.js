// /* =========================================================
//    DATA  (edit freely — all sample values are placeholders)
//    ========================================================= */

// // AIRLINES: code, name, ATC support per GDS, airline-specific top errors.
// // ATC values for GB, PT, ST are as provided; error lists are placeholders.
// const AIRLINES = {
//   GB: {
//     name: "GB Airline",
//     sabre: true,
//     amadeus: true,
//     errors: [
//       { title: "Tax Not Removed", items: ["YQ tax not removed.", "YR tax not removed."] },
//       { title: "Admin Fee Does Not Apply", items: ["Admin fee not added."] }
//     ]
//   },
//   PT: {
//     name: "PT Airline",
//     sabre: true,
//     amadeus: false,
//     errors: [
//       { title: "Endorsement Missing", items: ["Endorsement not added."] },
//       { title: "Tax Not Removed", items: ["YQ tax not removed."] }
//     ]
//   },
//   ST: {
//     name: "ST Airline",
//     sabre: true,
//     amadeus: true,
//     errors: [
//       { title: "Admin Fee Does Not Apply", items: ["Admin fee not added."] },
//       { title: "Endorsement Missing", items: ["Endorsement not added."] }
//     ]
//   }
// };

// // QC: scenario name and its checkpoint list.
// const QC = [
//   { name: "Voluntary",         checkpoints: ["ATC", "Comment read", "Penalty find", "Currency convert"] },
//   { name: "Involuntary",       checkpoints: ["ATC", "Comment read", "Currency convert"] },
//   { name: "Involuntary Partial", checkpoints: ["ATC", "Comment read", "Penalty find", "Currency convert"] },
//   { name: "Voluntary Partial", checkpoints: ["ATC", "Comment read", "Penalty find", "Currency convert"] },
//   { name: "Reissue",           checkpoints: ["ATC", "Comment read", "Currency convert"] }
// ];

// // TEMPLATES: common to all airlines. Edit the text or add new objects.
// const TEMPLATES = [
//   {
//     name: "Discrepancy",
//     content:
//       "There is discrepancy. FL agent price is 100 USD, but AT booking price shows 200 USD.\n\n" +
//       "Attention to FTO:\n\nTake necessary action."
//   },
//   {
//     name: "Issues by Different Offices",
//     content:
//       "Ticket was issued by a different office.\n\n" +
//       "Attention to FTO:\n\nTake necessary action."
//   }
// ];

// /* =========================================================
//    LOGIC
//    ========================================================= */

// const $ = (id) => document.getElementById(id);

// const el = {
//   tabs: document.querySelectorAll(".tab"),
//   panels: document.querySelectorAll(".panel"),
//   code: $("airline-code"),
//   name: $("airline-name"),
//   ticketCode: $("ticket-code"),
//   atcBlock: $("atc-block"),
//   atcResult: $("atc-result"),
//   errorsBlock: $("errors-block"),
//   errorsList: $("errors-list"),
//   qcCode: $("qc-code"),
//   scenario: $("qc-scenario"),
//   qcBlock: $("qc-block"),
//   qcList: $("qc-list"),
//   tplSelect: $("tpl-select"),
//   tplBlock: $("tpl-block"),
//   note: $("tpl-note"),
//   copyBtn: $("copy-btn"),
//   copyStatus: $("copy-status")
// };

// let copyTimer;

// /* ---- Tabs ---- */
// function showTab(name) {
//   el.tabs.forEach((t) => {
//     const on = t.dataset.tab === name;
//     t.classList.toggle("is-active", on);
//     t.setAttribute("aria-selected", on);
//   });
//   el.panels.forEach((p) => p.classList.toggle("is-active", p.id === "panel-" + name));
// }

// /* ---- Helpers ---- */
// function fillSelect(select, labels) {
//   select.innerHTML = "";
//   const first = document.createElement("option");
//   first.value = "";
//   first.textContent = "Select";
//   select.appendChild(first);
//   labels.forEach((label, i) => {
//     const o = document.createElement("option");
//     o.value = i;
//     o.textContent = label;
//     select.appendChild(o);
//   });
// }

// function text(tag, str, cls) {
//   const n = document.createElement(tag);
//   n.textContent = str;
//   if (cls) n.className = cls;
//   return n;
// }

// /* ---- Check ---- */
// function renderCheck() {
//   const code = el.code.value.trim().toUpperCase();
//   const airline = AIRLINES[code];

//   el.atcResult.innerHTML = "";
//   el.errorsList.innerHTML = "";
//   el.errorsBlock.open = false;
//   el.ticketCode.textContent = code;

//   if (!code) {
//     el.name.textContent = "";
//     el.atcBlock.hidden = true;
//     el.errorsBlock.hidden = true;
//     return;
//   }

//   el.atcBlock.hidden = false;

//   if (!airline) {
//     el.name.textContent = "";
//     el.atcResult.appendChild(text("p", "No data for this airline code.", "muted"));
//     el.errorsBlock.hidden = true;
//     return;
//   }

//   el.name.textContent = airline.name;

//   if (!airline.sabre && !airline.amadeus) {
//     el.atcResult.appendChild(text("p", "ATC NOT SUPPORTED", "atc-none"));
//   } else {
//     const grid = document.createElement("div");
//     grid.className = "atc-grid";
//     [["Sabre", airline.sabre], ["Amadeus", airline.amadeus]].forEach(([gds, ok]) => {
//       const cell = document.createElement("div");
//       cell.className = "atc-cell";
//       cell.appendChild(text("span", gds));
//       cell.appendChild(text("span", ok ? "YES" : "NO", "pill " + (ok ? "yes" : "no")));
//       grid.appendChild(cell);
//     });
//     el.atcResult.appendChild(grid);
//   }

//   // Top errors always sit directly below ATC for a known airline
//   if (airline.errors && airline.errors.length) {
//     airline.errors.forEach((err, i) => {
//       const item = document.createElement("div");
//       item.className = "error-item";
//       item.appendChild(text("p", (i + 1) + ". " + err.title, "error-title"));
//       const ul = document.createElement("ul");
//       err.items.forEach((d) => ul.appendChild(text("li", d)));
//       item.appendChild(ul);
//       el.errorsList.appendChild(item);
//     });
//   } else {
//     el.errorsList.appendChild(text("p", "No errors added for this airline yet.", "muted"));
//   }
//   el.errorsBlock.hidden = false;
// }

// /* ---- QC ---- */
// function renderQcCode() {
//   const code = el.code.value.trim().toUpperCase();
//   el.qcCode.textContent = code || "Enter an airline code in Check.";
//   el.qcCode.classList.toggle("is-empty", !code);
// }

// function renderQc() {
//   el.qcList.innerHTML = "";
//   const scenario = QC[el.scenario.value];
//   if (!scenario) {
//     el.qcBlock.hidden = true;
//     return;
//   }
//   scenario.checkpoints.forEach((cp) => {
//     const li = document.createElement("li");
//     const label = document.createElement("label");
//     const box = document.createElement("input");
//     box.type = "checkbox";
//     label.appendChild(box);
//     label.appendChild(text("span", cp));
//     li.appendChild(label);
//     el.qcList.appendChild(li);
//   });
//   el.qcBlock.hidden = false;
// }

// /* ---- Template ---- */
// function renderTemplate() {
//   const tpl = TEMPLATES[el.tplSelect.value];
//   clearTimeout(copyTimer);
//   el.copyStatus.textContent = "";
//   if (!tpl) {
//     el.note.value = "";
//     el.tplBlock.hidden = true;
//     return;
//   }
//   el.note.value = tpl.content;
//   el.tplBlock.hidden = false;
// }

// async function copyNote() {
//   const value = el.note.value;
//   try {
//     await navigator.clipboard.writeText(value);
//   } catch (e) {
//     el.note.select();
//     document.execCommand("copy");
//   }
//   el.copyStatus.textContent = "Copied successfully!";
//   clearTimeout(copyTimer);
//   copyTimer = setTimeout(() => (el.copyStatus.textContent = ""), 2500);
// }

// /* ---- Refresh: clear the entire session ---- */
// function refreshAll() {
//   el.code.value = "";
//   el.scenario.value = "";
//   el.tplSelect.value = "";
//   renderCheck();
//   renderQcCode();
//   renderQc();
//   renderTemplate();
//   el.code.focus();
//   showTab("check");
// }

// /* ---- Init ---- */
// fillSelect(el.scenario, QC.map((s) => s.name));
// fillSelect(el.tplSelect, TEMPLATES.map((t) => t.name));

// el.tabs.forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));
// el.code.addEventListener("input", () => { renderCheck(); renderQcCode(); });
// el.scenario.addEventListener("change", renderQc);
// el.tplSelect.addEventListener("change", renderTemplate);
// el.copyBtn.addEventListener("click", copyNote);
// document.querySelectorAll(".js-refresh").forEach((b) => b.addEventListener("click", refreshAll));

// refreshAll();

/* =========================================================
   DATA  (edit freely — all sample values are placeholders)
   ========================================================= */

// AIRLINES: code, name, ATC support per GDS, airline-specific top errors.
// ATC values for GB, PT, ST are as provided. All other ATC values and all error
// lists are SAMPLE data for testing — verify and replace before real use.

// Common claim-team errors (reused below; edit or add airline-specific ones freely)
const ERR = {
  tax: {
    title: "Tax Not Removed",
    items: ["YQ tax not removed.", "YR tax not removed."],
  },
  admin: { title: "Admin Fee Does Not Apply", items: ["Admin fee not added."] },
  waiver: {
    title: "Wrong Waiver Code",
    items: [
      "Waiver code does not match the scenario.",
      "Waiver code missing in the refund.",
    ],
  },
  endorse: { title: "Endorsement Missing", items: ["Endorsement not added."] },
  penalty: {
    title: "Penalty Not Added",
    items: [
      "Cancellation penalty not added.",
      "Penalty added in the wrong currency.",
    ],
  },
  comment: {
    title: "Comment Not Read",
    items: ["Fare rules or remarks not checked before refund."],
  },
  currency: {
    title: "Wrong Currency Conversion",
    items: [
      "Wrong rate used for conversion.",
      "Refund amount not in the ticket currency.",
    ],
  },
};

const AIRLINES = {
  // --- Provided ---
  GB: {
    name: "GB Airline",
    sabre: true,
    amadeus: true,
    errors: [ERR.tax, ERR.admin, ERR.waiver],
  },
  PT: {
    name: "PT Airline",
    sabre: true,
    amadeus: false,
    errors: [ERR.endorse, ERR.tax, ERR.waiver],
  },
  ST: {
    name: "ST Airline",
    sabre: true,
    amadeus: true,
    errors: [ERR.admin, ERR.endorse, ERR.waiver],
  },

  // --- Sample data (ATC is illustrative) ---
  AI: {
    name: "Air India",
    sabre: true,
    amadeus: true,
    errors: [ERR.tax, ERR.admin, ERR.waiver, ERR.penalty],
  },
  CT: {
    name: "CT Airline",
    sabre: false,
    amadeus: true,
    errors: [ERR.waiver, ERR.tax, ERR.endorse],
  },
  "6E": {
    name: "IndiGo",
    sabre: false,
    amadeus: false,
    errors: [ERR.admin, ERR.waiver, ERR.penalty],
  },
  SG: {
    name: "SpiceJet",
    sabre: false,
    amadeus: false,
    errors: [ERR.admin, ERR.currency, ERR.waiver],
  },
  QP: {
    name: "Akasa Air",
    sabre: true,
    amadeus: false,
    errors: [ERR.admin, ERR.waiver],
  },
  EK: {
    name: "Emirates",
    sabre: true,
    amadeus: true,
    errors: [ERR.tax, ERR.waiver, ERR.comment],
  },
  QR: {
    name: "Qatar Airways",
    sabre: true,
    amadeus: true,
    errors: [ERR.tax, ERR.admin, ERR.waiver],
  },
  EY: {
    name: "Etihad Airways",
    sabre: false,
    amadeus: true,
    errors: [ERR.tax, ERR.endorse, ERR.waiver],
  },
  SQ: {
    name: "Singapore Airlines",
    sabre: true,
    amadeus: false,
    errors: [ERR.tax, ERR.currency, ERR.waiver],
  },
  BA: {
    name: "British Airways",
    sabre: true,
    amadeus: true,
    errors: [ERR.tax, ERR.admin, ERR.penalty],
  },
  LH: {
    name: "Lufthansa",
    sabre: false,
    amadeus: true,
    errors: [ERR.tax, ERR.waiver, ERR.comment],
  },
  TK: {
    name: "Turkish Airlines",
    sabre: false,
    amadeus: false,
    errors: [ERR.tax, ERR.admin, ERR.endorse],
  },
  WY: {
    name: "Oman Air",
    sabre: true,
    amadeus: false,
    errors: [ERR.admin, ERR.waiver, ERR.currency],
  },
};

// QC: scenario name and its checkpoint list.
const QC = [
  {
    name: "Voluntary",
    checkpoints: ["ATC", "Comment read", "Penalty find", "Currency convert"],
  },
  {
    name: "Involuntary",
    checkpoints: ["ATC", "Comment read", "Currency convert"],
  },
  {
    name: "Involuntary Partial",
    checkpoints: ["ATC", "Comment read", "Penalty find", "Currency convert"],
  },
  {
    name: "Voluntary Partial",
    checkpoints: ["ATC", "Comment read", "Penalty find", "Currency convert"],
  },
  { name: "Reissue", checkpoints: ["ATC", "Comment read", "Currency convert"] },
];

// TEMPLATES: common to all airlines. Edit the text or add new objects.
const TEMPLATES = [
  {
    name: "Discrepancy",
    content:
      "There is discrepancy. FL agent price is 100 USD, but AT booking price shows 200 USD.\n\n" +
      "Attention to FTO:\n\nTake necessary action.",
  },
  {
    name: "Issues by Different Offices",
    content:
      "Ticket was issued by a different office.\n\n" +
      "Attention to FTO:\n\nTake necessary action.",
  },
];

/* =========================================================
   LOGIC
   ========================================================= */

const $ = (id) => document.getElementById(id);

const el = {
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".panel"),
  code: $("airline-code"),
  name: $("airline-name"),
  ticketCode: $("ticket-code"),
  atcBlock: $("atc-block"),
  atcResult: $("atc-result"),
  errorsBlock: $("errors-block"),
  errorsList: $("errors-list"),
  qcCode: $("qc-code"),
  scenario: $("qc-scenario"),
  qcBlock: $("qc-block"),
  qcList: $("qc-list"),
  tplSelect: $("tpl-select"),
  tplBlock: $("tpl-block"),
  note: $("tpl-note"),
  copyBtn: $("copy-btn"),
  copyStatus: $("copy-status"),
};

let copyTimer;

/* ---- Tabs ---- */
function showTab(name) {
  el.tabs.forEach((t) => {
    const on = t.dataset.tab === name;
    t.classList.toggle("is-active", on);
    t.setAttribute("aria-selected", on);
  });
  el.panels.forEach((p) =>
    p.classList.toggle("is-active", p.id === "panel-" + name),
  );
}

/* ---- Helpers ---- */
function fillSelect(select, labels) {
  select.innerHTML = "";
  const first = document.createElement("option");
  first.value = "";
  first.textContent = "Select";
  select.appendChild(first);
  labels.forEach((label, i) => {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = label;
    select.appendChild(o);
  });
}

function text(tag, str, cls) {
  const n = document.createElement(tag);
  n.textContent = str;
  if (cls) n.className = cls;
  return n;
}

/* ---- Check ---- */
function renderCheck() {
  const code = el.code.value.trim().toUpperCase();
  const airline = AIRLINES[code];

  el.atcResult.innerHTML = "";
  el.errorsList.innerHTML = "";
  el.errorsBlock.open = false;
  el.ticketCode.textContent = code;

  if (!code) {
    el.name.textContent = "";
    el.atcBlock.hidden = true;
    el.errorsBlock.hidden = true;
    return;
  }

  el.atcBlock.hidden = false;

  if (!airline) {
    el.name.textContent = "";
    el.atcResult.appendChild(
      text("p", "No data for this airline code.", "muted"),
    );
    el.errorsBlock.hidden = true;
    return;
  }

  el.name.textContent = airline.name;

  if (!airline.sabre && !airline.amadeus) {
    el.atcResult.appendChild(text("p", "ATC NOT SUPPORTED", "atc-none"));
  } else {
    const grid = document.createElement("div");
    grid.className = "atc-grid";
    [
      ["Sabre", airline.sabre],
      ["Amadeus", airline.amadeus],
    ].forEach(([gds, ok]) => {
      const cell = document.createElement("div");
      cell.className = "atc-cell";
      cell.appendChild(text("span", gds));
      cell.appendChild(
        text("span", ok ? "YES" : "NO", "pill " + (ok ? "yes" : "no")),
      );
      grid.appendChild(cell);
    });
    el.atcResult.appendChild(grid);
  }

  // Top errors always sit directly below ATC for a known airline
  if (airline.errors && airline.errors.length) {
    airline.errors.forEach((err, i) => {
      const item = document.createElement("div");
      item.className = "error-item";
      item.appendChild(text("p", i + 1 + ". " + err.title, "error-title"));
      const ul = document.createElement("ul");
      err.items.forEach((d) => ul.appendChild(text("li", d)));
      item.appendChild(ul);
      el.errorsList.appendChild(item);
    });
  } else {
    el.errorsList.appendChild(
      text("p", "No errors added for this airline yet.", "muted"),
    );
  }
  el.errorsBlock.hidden = false;
}

/* ---- QC ---- */
function renderQcCode() {
  const code = el.code.value.trim().toUpperCase();
  el.qcCode.textContent = code || "Enter an airline code in Check.";
  el.qcCode.classList.toggle("is-empty", !code);
}

function renderQc() {
  el.qcList.innerHTML = "";
  const scenario = QC[el.scenario.value];
  if (!scenario) {
    el.qcBlock.hidden = true;
    return;
  }
  scenario.checkpoints.forEach((cp) => {
    const li = document.createElement("li");
    const label = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox";
    label.appendChild(box);
    label.appendChild(text("span", cp));
    li.appendChild(label);
    el.qcList.appendChild(li);
  });
  el.qcBlock.hidden = false;
}

/* ---- Template ---- */
function renderTemplate() {
  const tpl = TEMPLATES[el.tplSelect.value];
  clearTimeout(copyTimer);
  el.copyStatus.textContent = "";
  if (!tpl) {
    el.note.value = "";
    el.tplBlock.hidden = true;
    return;
  }
  el.note.value = tpl.content;
  el.tplBlock.hidden = false;
}

async function copyNote() {
  const value = el.note.value;
  try {
    await navigator.clipboard.writeText(value);
  } catch (e) {
    el.note.select();
    document.execCommand("copy");
  }
  el.copyStatus.textContent = "Copied successfully!";
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => (el.copyStatus.textContent = ""), 2500);
}

/* ---- Refresh: clear the entire session ---- */
function refreshAll() {
  el.code.value = "";
  el.scenario.value = "";
  el.tplSelect.value = "";
  renderCheck();
  renderQcCode();
  renderQc();
  renderTemplate();
  el.code.focus();
  showTab("check");
}

/* ---- Init ---- */
fillSelect(
  el.scenario,
  QC.map((s) => s.name),
);
fillSelect(
  el.tplSelect,
  TEMPLATES.map((t) => t.name),
);

el.tabs.forEach((t) =>
  t.addEventListener("click", () => showTab(t.dataset.tab)),
);
el.code.addEventListener("input", () => {
  renderCheck();
  renderQcCode();
});
el.scenario.addEventListener("change", renderQc);
el.tplSelect.addEventListener("change", renderTemplate);
el.copyBtn.addEventListener("click", copyNote);
document
  .querySelectorAll(".js-refresh")
  .forEach((b) => b.addEventListener("click", refreshAll));

refreshAll();
