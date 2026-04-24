// ============================================
//  TO-DO LIST DASHBOARD – app.js
// ============================================

// ---- Storage Keys ----
const KEYS = {
  theme: "tdl_theme",
  userName: "tdl_userName",
  tasks: "tdl_tasks",
  links: "tdl_links",
  timerMinutes: "tdl_timerMinutes",
  sortOrder: "tdl_sortOrder",
};

// ---- Utility: Escape HTML ----
function escapeHtml(str) {
  const el = document.createElement("div");
  el.appendChild(document.createTextNode(str));
  return el.innerHTML;
}

// ============================================
//  STATE
// ============================================
let tasks = JSON.parse(localStorage.getItem(KEYS.tasks)) || [];
let links = JSON.parse(localStorage.getItem(KEYS.links)) || null;
let userName = localStorage.getItem(KEYS.userName) || "Alief Athallah Putra";
let timerMins = parseInt(localStorage.getItem(KEYS.timerMinutes)) || 25;
let timerSecs = timerMins * 60;
let timerRunning = false;
let timerInterval = null;
let sortOrder = localStorage.getItem(KEYS.sortOrder) || "default";

// Default links if none in storage
if (!links) {
  links = [
    { name: "Google", url: "https://google.com" },
    { name: "Gmail", url: "https://mail.google.com" },
    { name: "Calendar", url: "https://calendar.google.com" },
  ];
  localStorage.setItem(KEYS.links, JSON.stringify(links));
}

// ============================================
//  CLOCK & GREETING
// ============================================
function updateClock() {
  const now = new Date();

  // Time
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  document.getElementById("clock").textContent = `${hh}:${mm}:${ss}`;

  // Date
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  document.getElementById("currentDate").textContent =
    `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  // Greeting
  const h = now.getHours();
  let greet;
  if (h >= 5 && h < 12) greet = "Good Morning";
  else if (h >= 12 && h < 17) greet = "Good Afternoon";
  else if (h >= 17 && h < 21) greet = "Good Evening";
  else greet = "Good Night";
  document.getElementById("greeting").textContent = `${greet}, ${userName}! 👋`;
}

setInterval(updateClock, 1000);
updateClock();

// ============================================
//  THEME TOGGLE
// ============================================
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem(KEYS.theme, theme);
}

applyTheme(localStorage.getItem(KEYS.theme) || "light");

themeToggle.addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-theme");
  applyTheme(cur === "dark" ? "light" : "dark");
});

// ============================================
//  CUSTOM NAME MODAL
// ============================================
const nameModal = document.getElementById("nameModal");
const nameInput = document.getElementById("nameInput");

document.getElementById("editNameBtn").addEventListener("click", () => {
  nameInput.value = userName;
  nameModal.classList.add("active");
  nameInput.focus();
  nameInput.select();
});

document.getElementById("saveNameBtn").addEventListener("click", saveUserName);
document
  .getElementById("cancelNameBtn")
  .addEventListener("click", closeNameModal);

nameModal.addEventListener("click", (e) => {
  if (e.target === nameModal) closeNameModal();
});

nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveUserName();
  if (e.key === "Escape") closeNameModal();
});

function saveUserName() {
  const val = nameInput.value.trim();
  if (!val) return;
  userName = val;
  localStorage.setItem(KEYS.userName, userName);
  updateClock();
  closeNameModal();
}

function closeNameModal() {
  nameModal.classList.remove("active");
}

// ============================================
//  FOCUS TIMER
// ============================================
const timerDisplay = document.getElementById("timerDisplay");
const timerMinsInput = document.getElementById("timerMinutes");
timerMinsInput.value = timerMins;

function formatTimer(totalSecs) {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function refreshTimerDisplay() {
  timerDisplay.textContent = formatTimer(timerSecs);
}

timerMinsInput.addEventListener("change", () => {
  if (timerRunning) return;
  const val = parseInt(timerMinsInput.value);
  if (val >= 1 && val <= 60) {
    timerMins = val;
    timerSecs = timerMins * 60;
    localStorage.setItem(KEYS.timerMinutes, timerMins);
    refreshTimerDisplay();
  } else {
    timerMinsInput.value = timerMins;
  }
});

document.getElementById("startBtn").addEventListener("click", () => {
  if (timerRunning) return;
  timerRunning = true;
  timerMinsInput.disabled = true;
  timerInterval = setInterval(() => {
    timerSecs--;
    refreshTimerDisplay();
    if (timerSecs <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerMinsInput.disabled = false;
      timerSecs = 0;
      refreshTimerDisplay();
      setTimeout(() => alert("Time is up! Great work! 🎉"), 50);
    }
  }, 1000);
});

document.getElementById("stopBtn").addEventListener("click", () => {
  clearInterval(timerInterval);
  timerRunning = false;
  timerMinsInput.disabled = false;
});

document.getElementById("resetBtn").addEventListener("click", () => {
  clearInterval(timerInterval);
  timerRunning = false;
  timerMinsInput.disabled = false;
  timerMins = parseInt(timerMinsInput.value) || 25;
  timerSecs = timerMins * 60;
  refreshTimerDisplay();
});

refreshTimerDisplay();

// ============================================
//  TASKS
// ============================================
function saveTasks() {
  localStorage.setItem(KEYS.tasks, JSON.stringify(tasks));
}

function getSortedTasks() {
  const copy = [...tasks];
  switch (sortOrder) {
    case "az":
      return copy.sort((a, b) => a.text.localeCompare(b.text));
    case "za":
      return copy.sort((a, b) => b.text.localeCompare(a.text));
    case "active":
      return copy.sort((a, b) => Number(a.completed) - Number(b.completed));
    case "completed":
      return copy.sort((a, b) => Number(b.completed) - Number(a.completed));
    default:
      return copy;
  }
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  getSortedTasks().forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = task.id;

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} />
      <span class="task-text ${task.completed ? "completed" : ""}">${escapeHtml(task.text)}</span>
      <div class="task-actions">
        <button class="btn btn-edit" data-action="edit">Edit</button>
        <button class="btn btn-danger" data-action="delete">Delete</button>
      </div>
    `;

    // Toggle complete
    li.querySelector('input[type="checkbox"]').addEventListener(
      "change",
      (e) => {
        const t = tasks.find((t) => t.id === task.id);
        if (t) {
          t.completed = e.target.checked;
          saveTasks();
          renderTasks();
        }
      },
    );

    // Double-click text to edit
    li.querySelector(".task-text").addEventListener("dblclick", () =>
      beginEdit(li, task),
    );

    // Edit button
    li.querySelector('[data-action="edit"]').addEventListener("click", () =>
      beginEdit(li, task),
    );

    // Delete button
    li.querySelector('[data-action="delete"]').addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    list.appendChild(li);
  });
}

function beginEdit(li, task) {
  const span = li.querySelector(".task-text");
  const actions = li.querySelector(".task-actions");

  const input = document.createElement("input");
  input.className = "task-edit-input";
  input.value = task.text;
  span.replaceWith(input);

  actions.innerHTML = `
    <button class="btn btn-save"      data-action="save">Save</button>
    <button class="btn btn-secondary" data-action="cancel" style="padding:4px 10px;font-size:0.78rem;">Cancel</button>
  `;

  input.focus();
  input.select();

  actions
    .querySelector('[data-action="save"]')
    .addEventListener("click", commit);
  actions
    .querySelector('[data-action="cancel"]')
    .addEventListener("click", renderTasks);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") renderTasks();
  });

  function commit() {
    const newText = input.value.trim();
    if (!newText) return;
    const t = tasks.find((t) => t.id === task.id);
    if (t) {
      t.text = newText;
      saveTasks();
      renderTasks();
    }
  }
}

function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (!text) return;

  // Prevent duplicates (Challenge)
  if (tasks.some((t) => t.text.toLowerCase() === text.toLowerCase())) {
    input.classList.add("input-error");
    input.placeholder = "Task already exists!";
    setTimeout(() => {
      input.classList.remove("input-error");
      input.placeholder = "Add a new task...";
    }, 1600);
    return;
  }

  tasks.push({ id: Date.now(), text, completed: false });
  saveTasks();
  renderTasks();
  input.value = "";
}

document.getElementById("addTaskBtn").addEventListener("click", addTask);
document.getElementById("taskInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

// Sort select (Challenge)
const sortSelect = document.getElementById("sortSelect");
sortSelect.value = sortOrder;
sortSelect.addEventListener("change", () => {
  sortOrder = sortSelect.value;
  localStorage.setItem(KEYS.sortOrder, sortOrder);
  renderTasks();
});

renderTasks();

// ============================================
//  QUICK LINKS
// ============================================
function saveLinks() {
  localStorage.setItem(KEYS.links, JSON.stringify(links));
}

function renderLinks() {
  const container = document.getElementById("linksContainer");
  container.innerHTML = "";

  links.forEach((link, index) => {
    const wrap = document.createElement("div");
    wrap.className = "link-pill-wrap";

    const a = document.createElement("a");
    a.className = "link-pill";
    a.textContent = link.name;
    a.href = /^https?:\/\//i.test(link.url) ? link.url : "https://" + link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    const removeBtn = document.createElement("button");
    removeBtn.className = "link-remove";
    removeBtn.title = "Remove";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      links.splice(index, 1);
      saveLinks();
      renderLinks();
    });

    wrap.appendChild(a);
    wrap.appendChild(removeBtn);
    container.appendChild(wrap);
  });
}

function addLink() {
  const nameEl = document.getElementById("linkName");
  const urlEl = document.getElementById("linkUrl");
  const name = nameEl.value.trim();
  const url = urlEl.value.trim();
  if (!name || !url) return;

  links.push({ name, url });
  saveLinks();
  renderLinks();
  nameEl.value = "";
  urlEl.value = "";
}

document.getElementById("addLinkBtn").addEventListener("click", addLink);
document.getElementById("linkUrl").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addLink();
});

renderLinks();
