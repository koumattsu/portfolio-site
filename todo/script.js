// フロントだけで完結するToDo。新しいキーなので前のデータは読まない。
const STORAGE_KEY = "koshi-todo-list-v2";  // ←ここが新しい

const tableBody = document.querySelector("#todoTable tbody");
const addRowBtn = document.getElementById("addRowBtn");
const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");

// 初回ロード
document.addEventListener("DOMContentLoaded", () => {
  const saved = loadFromStorage();

  if (saved.length) {
    // 保存されてたらそれを表示
    saved.forEach((task) => createRow(task));
  } else {
    // 初期表示は1行だけ、タイトルは「ToDo」、他は空
    const task = {
      id: makeId(),
      title: "ToDo",
      status: "未着手",
      due: "",
      priority: "中",
      description: ""
    };
    createRow(task);
    saveToStorage();
  }
});

// 新規追加
addRowBtn.addEventListener("click", () => {
  const title = prompt("新しいタスク名を入力してください");
  if (!title) return;

  const task = {
    id: makeId(),
    title,
    status: "未着手",
    due: "",
    priority: "中",
    description: ""
  };
  createRow(task);
  saveToStorage();
});

// 選択削除
deleteSelectedBtn.addEventListener("click", () => {
  const rows = Array.from(tableBody.querySelectorAll("tr"));
  const targets = rows.filter((tr) => tr.querySelector('input[type="checkbox"]')?.checked);
  if (!targets.length) {
    alert("削除するタスクを選んでください。");
    return;
  }
  if (!confirm(`選択した${targets.length}件を削除しますか？`)) return;
  targets.forEach((tr) => tr.remove());
  saveToStorage();
});

// ------------------ DOM生成 ------------------

function createRow(task) {
  const tr = document.createElement("tr");
  tr.dataset.id = task.id;

  // チェックボックス
  const selectTd = document.createElement("td");
  selectTd.style.textAlign = "center";
  const cb = document.createElement("input");
  cb.type = "checkbox";
  selectTd.appendChild(cb);
  tr.appendChild(selectTd);

  // タスク名
  const titleTd = document.createElement("td");
  const titleDiv = document.createElement("div");
  titleDiv.className = "editable-cell";
  titleDiv.contentEditable = "true";
  titleDiv.textContent = task.title || "";
  titleDiv.addEventListener("blur", saveToStorage);
  titleTd.appendChild(titleDiv);
  tr.appendChild(titleTd);

  // ステータス
  const statusTd = document.createElement("td");
  const statusSelect = document.createElement("select");
  statusSelect.className = "status-select";
  ["未着手", "進行中", "完了"].forEach((s) => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = s;
    statusSelect.appendChild(opt);
  });
  statusSelect.value = task.status || "未着手";
  applyStatusColor(statusSelect);
  statusSelect.addEventListener("change", (e) => {
    applyStatusColor(e.target);
    saveToStorage();
  });
  statusTd.appendChild(statusSelect);
  tr.appendChild(statusTd);

  // 期日
  const dueTd = document.createElement("td");
  const dueInput = document.createElement("input");
  dueInput.type = "date";
  dueInput.className = "date-input";
  if (task.due) {
    dueInput.value = task.due;
  }
  dueInput.addEventListener("change", saveToStorage);
  dueTd.appendChild(dueInput);
  tr.appendChild(dueTd);

  // 優先度
  const priorityTd = document.createElement("td");
  const prioritySelect = document.createElement("select");
  prioritySelect.className = "priority-select";
  ["高", "中", "低"].forEach((p) => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = p;
    prioritySelect.appendChild(opt);
  });
  prioritySelect.value = task.priority || "中";
  applyPriorityColor(prioritySelect);
  prioritySelect.addEventListener("change", (e) => {
    applyPriorityColor(e.target);
    saveToStorage();
  });
  priorityTd.appendChild(prioritySelect);
  tr.appendChild(priorityTd);

  // 説明
  const descTd = document.createElement("td");
  const descDiv = document.createElement("div");
  descDiv.className = "editable-cell";
  descDiv.contentEditable = "true";
  descDiv.textContent = task.description || "";
  descDiv.addEventListener("blur", saveToStorage);
  descTd.appendChild(descDiv);
  tr.appendChild(descTd);

  // 削除ボタン
  const actionTd = document.createElement("td");
  actionTd.style.textAlign = "center";
  const delBtn = document.createElement("button");
  delBtn.className = "action-btn";
  delBtn.textContent = "🗑";
  delBtn.addEventListener("click", () => {
    if (!confirm("このタスクを削除しますか？")) return;
    tr.remove();
    saveToStorage();
  });
  actionTd.appendChild(delBtn);
  tr.appendChild(actionTd);

  tableBody.appendChild(tr);
}

// ------------------ localStorage ------------------

function saveToStorage() {
  const rows = Array.from(tableBody.querySelectorAll("tr"));
  const data = rows.map((tr) => {
    const id = tr.dataset.id;
    const title = tr.querySelector(".editable-cell").textContent.trim();
    const status = tr.querySelector(".status-select").value;
    const due = tr.querySelector(".date-input").value;
    const priority = tr.querySelector(".priority-select").value;
    const desc = tr.querySelectorAll(".editable-cell")[1]?.textContent.trim() || "";
    return { id, title, status, due, priority, description: desc };
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ------------------ 見た目ユーティリティ ------------------

function applyStatusColor(selectEl) {
  const v = selectEl.value;
  selectEl.style.backgroundColor = "rgba(9, 9, 14, 0.3)";
  selectEl.style.color = "#fff";
  if (v === "進行中") {
    selectEl.style.backgroundColor = "rgba(78, 125, 255, 0.7)";
  } else if (v === "完了") {
    selectEl.style.backgroundColor = "rgba(61, 183, 98, 0.7)";
  } else if (v === "未着手") {
    selectEl.style.backgroundColor = "rgba(255, 219, 115, 0.65)";
    selectEl.style.color = "#000";
  }
}

function applyPriorityColor(selectEl) {
  const v = selectEl.value;
  selectEl.style.color = "#000";
  if (v === "高") {
    selectEl.style.backgroundColor = "#ff8a80";
  } else if (v === "中") {
    selectEl.style.backgroundColor = "#fff176";
  } else {
    selectEl.style.backgroundColor = "#ccff90";
  }
}

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(16).slice(2);
}
