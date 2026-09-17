const STORAGE_KEY = "codynnflowTasks";

const courses = [
  {
    id: "course1",
    code: "COURSE 01",
    name: "Comparative Politics",
    description: "ps: your favourite DR",
    icon: "fa-scale-balanced"
  },
  {
    id: "course2",
    code: "COURSE 02",
    name: "Poverty and Development",
    description: "somehow of a development maybe",
    icon: "fa-chart-line"
  },
  {
    id: "course3",
    code: "COURSE 03",
    name: "Foreign Policy Analysis",
    description: "minding everyone's business, yet mysterious",
    icon: "fa-earth-americas"
  },
  {
    id: "course4",
    code: "COURSE 04",
    name: "International Organisations",
    description: "Diplomacy, but make it complicated diplomat",
    icon: "fa-building-columns"
  }
];

let tasks = [];
let editingId = null;
let currentCourse = null;

function getCourseFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("course");
}

function getCourse() {
  const courseId = getCourseFromUrl();
  return courses.find(course => course.id === courseId) || courses[0];
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      tasks = JSON.parse(saved);
    } catch (error) {
      console.error("Could not load tasks", error);
      tasks = [];
    }
  } else {
    tasks = createDefaultTasks();
    saveData();
  }

  // Older tasks created before courses were added are placed in Course 01.
  // This keeps your existing tasks visible instead of losing them.
  let changed = false;
  tasks = tasks.map(task => {
    if (!task.course) {
      changed = true;
      return { ...task, course: "course1" };
    }
    return task;
  });

  if (changed) saveData();
}

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

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateGreeting() {
  const hour = new Date().getHours();
  let greet = "Good Morning";

  if (hour >= 12 && hour < 18) greet = "Good Afternoon";
  else if (hour >= 18) greet = "Good Evening";

  document.getElementById("greeting").textContent = `HEYYY JOEY ${greet}`;
}

function setupCourse() {
  currentCourse = getCourse();

  document.title = `BlueFlow - ${currentCourse.name}`;
  document.getElementById("courseCode").textContent = currentCourse.code;
  document.getElementById("courseName").textContent = currentCourse.name;
  document.getElementById("courseDescription").textContent = currentCourse.description;
}

function getCurrentCourseTasks() {
  return tasks.filter(task => task.course === currentCourse.id);
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function formatStatus(status) {
  if (status === "progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatPriority(priority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function taskTemplate(task) {
  return `
    <div class="task-item">
      <button
        class="task-checkbox ${task.completed ? "completed" : ""}"
        onclick="toggleTask(${task.id})"
        aria-label="Toggle task"
        type="button"
      ></button>

      <div class="task-content">
        <div class="task-title ${task.completed ? "completed" : ""}">
          ${escapeHtml(task.title)}
        </div>
      </div>

      <span class="status-badge status-${task.status}">
        ${formatStatus(task.status)}
      </span>

      <div class="priority-badge priority-${task.priority}">
        <i class="fas fa-circle"></i>
        ${formatPriority(task.priority)}
      </div>

      <div class="avatar">J</div>

      <button class="icon-btn small-icon" onclick="editTask(${task.id})" type="button" title="Edit">
        <i class="fas fa-pen"></i>
      </button>

      <button class="icon-btn small-icon delete-btn" onclick="deleteTask(${task.id})" type="button" title="Delete">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
}

function renderTasks() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const courseTasks = getCurrentCourseTasks();

  const filteredTasks = courseTasks.filter(task =>
    task.title.toLowerCase().includes(query)
  );

  const onHold = filteredTasks.filter(task => !task.completed);
  const completed = filteredTasks.filter(task => task.completed);

  document.getElementById("onHoldTasks").innerHTML = onHold.length
    ? onHold.map(taskTemplate).join("")
    : '<p class="empty-message">No pending tasks for this course.</p>';

  document.getElementById("completedTasks").innerHTML = completed.length
    ? completed.map(taskTemplate).join("")
    : '<p class="empty-message">No completed tasks for this course.</p>';

  updateStats(courseTasks);
}

function updateStats(courseTasks) {
  const total = courseTasks.length;
  const completedCount = courseTasks.filter(task => task.completed).length;
  const pending = total - completedCount;
  const rate = total ? Math.round((completedCount / total) * 100) : 0;

  document.getElementById("pendingBadge").textContent = pending;
  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedCount").textContent = completedCount;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("completionRateValue").textContent = rate + "%";
  document.getElementById("completionProgress").style.width = rate + "%";
}

function toggleTask(id) {
  const task = tasks.find(task => task.id === id);

  if (!task) return;

  task.completed = !task.completed;
  task.status = task.completed ? "completed" : "pending";

  saveData();
  renderTasks();
}

function deleteTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  const modal = document.getElementById("deleteTaskModal");
  document.getElementById("deleteTaskId").value = id;
  document.getElementById("deleteTaskName").textContent = task.title || "this task";
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("cancelDeleteTaskBtn").focus();
}

function closeDeleteTaskModal() {
  const modal = document.getElementById("deleteTaskModal");
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.getElementById("deleteTaskId").value = "";
}

function confirmDeleteTask() {
  const id = Number(document.getElementById("deleteTaskId").value);
  if (!id) return;

  tasks = tasks.filter(item => item.id !== id);
  saveData();
  renderTasks();
  closeDeleteTaskModal();
}

function openModal() {
  document.getElementById("taskModal").classList.add("active");
  document.getElementById("taskTitle").focus();
}

function closeModal() {
  document.getElementById("taskModal").classList.remove("active");
  document.getElementById("taskForm").reset();
  document.getElementById("modalTitle").textContent = "Add New Task";
  editingId = null;
}

function editTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  editingId = id;
  document.getElementById("modalTitle").textContent = "Update Task";
  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskStatus").value = task.status;
  document.getElementById("taskPriority").value = task.priority;
  openModal();
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
      course: currentCourse.id
    });
  }

  saveData();
  closeModal();
  renderTasks();
});

document.getElementById("searchInput").addEventListener("input", renderTasks);

document.getElementById("taskModal").addEventListener("click", event => {
  if (event.target.id === "taskModal") closeModal();
});

document.getElementById("deleteTaskModal").addEventListener("click", event => {
  if (event.target.id === "deleteTaskModal") closeDeleteTaskModal();
});

document.getElementById("closeDeleteTaskBtn").addEventListener("click", closeDeleteTaskModal);
document.getElementById("cancelDeleteTaskBtn").addEventListener("click", closeDeleteTaskModal);
document.getElementById("confirmDeleteTaskBtn").addEventListener("click", confirmDeleteTask);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && document.getElementById("deleteTaskModal").classList.contains("active")) {
    closeDeleteTaskModal();
  }
});

updateGreeting();
setupCourse();
loadData();
renderTasks();
