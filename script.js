const STORAGE_KEY = "codynnflowTasks";

let tasks = [];
let editingId = null;

function createDefaultTasks() {
  return [
    {
      id: 1,
      title: "Compare different political systems",
      status: "pending",
      priority: "minor",
      completed: false,
      course: "course1"
    },
    {
      id: 2,
      title: "Review the main development theories",
      status: "progress",
      priority: "normal",
      completed: false,
      course: "course2"
    },
    {
      id: 3,
      title: "Analyse a country's foreign policy",
      status: "pending",
      priority: "critical",
      completed: false,
      course: "course3"
    },
    {
      id: 4,
      title: "Study the role of international organisations",
      status: "completed",
      priority: "minor",
      completed: true,
      course: "course4"
    }
  ];
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      tasks = JSON.parse(saved);
    } catch (error) {
      console.error("Could not load tasks", error);
      tasks = createDefaultTasks();
    }
  } else {
    tasks = createDefaultTasks();
  }

  let changed = false;
  tasks = tasks.map(task => {
    if (!task.course) {
      changed = true;
      return { ...task, course: "course1" };
    }
    return task;
  });

  if (!saved || changed) saveData();

  updateGreeting();
  renderTasks();
}

function updateGreeting() {
  const hour = new Date().getHours();
  let greet = "Good Morning";

  if (hour >= 12 && hour < 18) greet = "Good Afternoon";
  else if (hour >= 18) greet = "Good Evening";

  document.getElementById("greeting").textContent = `HEYYY JOEY ${greet}`;
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function formatStatus(status) {
  return status === "progress"
    ? "In Progress"
    : status.charAt(0).toUpperCase() + status.slice(1);
}

function formatPriority(priority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function taskTemplate(task) {
  return `
    <div class="task-item">
      <button class="task-checkbox ${task.completed ? "completed" : ""}"
        onclick="toggleTask(${task.id})" type="button"></button>
      <div class="task-content">
        <div class="task-title ${task.completed ? "completed" : ""}">${escapeHtml(task.title)}</div>
      </div>
      <span class="status-badge status-${task.status}">${formatStatus(task.status)}</span>
      <div class="priority-badge priority-${task.priority}">
        <i class="fas fa-circle"></i> ${formatPriority(task.priority)}
      </div>
      <div class="avatar">J</div>
      <button class="icon-btn small-icon" onclick="editTask(${task.id})" type="button">
        <i class="fas fa-pen"></i>
      </button>
      <button class="icon-btn small-icon delete-btn" onclick="deleteTask(${task.id})" type="button">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
}

function renderTasks() {
  const searchInput = document.querySelector(".search-bar input");
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const filtered = tasks.filter(task =>
    task.title.toLowerCase().includes(query)
  );

  const onHold = filtered.filter(task => !task.completed);
  const completed = filtered.filter(task => task.completed);

  document.getElementById("onHoldTasks").innerHTML = onHold.length
    ? onHold.map(taskTemplate).join("")
    : '<p style="color:#7f95aa;padding:20px;">No tasks on hold</p>';

  document.getElementById("completedTasks").innerHTML = completed.length
    ? completed.map(taskTemplate).join("")
    : '<p style="color:#7f95aa;padding:20px;">No completed tasks</p>';

  const total = tasks.length;
  const completedCount = tasks.filter(task => task.completed).length;
  const pending = total - completedCount;
  const rate = total ? Math.round((completedCount / total) * 100) : 0;

  document.getElementById("taskCount").textContent = pending;
  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedCount").textContent = completedCount;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("completionRateValue").textContent = rate + "%";
  document.getElementById("totalProgress").style.width = rate + "%";
  document.getElementById("completionProgress").style.width = rate + "%";
}

function toggleTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  task.completed = !task.completed;
  task.status = task.completed ? "completed" : "pending";

  saveData();
  renderTasks();
}

function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  tasks = tasks.filter(task => task.id !== id);
  saveData();
  renderTasks();
}

function openModal() {
  document.getElementById("taskModal").classList.add("active");
  document.getElementById("taskTitle").focus();
}

function closeModal() {
  document.getElementById("taskModal").classList.remove("active");
  document.getElementById("taskForm").reset();
  editingId = null;
}

document.getElementById("taskForm").addEventListener("submit", event => {
  event.preventDefault();

  const title = document.getElementById("taskTitle").value.trim();
  const status = document.getElementById("taskStatus").value;
  const priority = document.getElementById("taskPriority").value;

  if (!title) return;

  if (editingId !== null) {
    const task = tasks.find(item => item.id === editingId);
    if (task) {
      task.title = title;
      task.status = status;
      task.priority = priority;
      task.completed = status === "completed";
    }
  } else {
    tasks.push({
      id: Date.now(),
      title,
      status,
      priority,
      completed: status === "completed",
      course: "course1"
    });
  }

  saveData();
  renderTasks();
  closeModal();
});

function editTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  editingId = id;
  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskStatus").value = task.status;
  document.getElementById("taskPriority").value = task.priority;
  openModal();
}

const searchInput = document.querySelector(".search-bar input");
if (searchInput) searchInput.addEventListener("input", renderTasks);

loadData();
