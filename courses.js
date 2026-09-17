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

const STORAGE_KEY = "codynnflowTasks";

function getAllTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error("Could not read saved tasks", error);
    return [];
  }
}

function updateGreeting() {
  const hour = new Date().getHours();
  let greet = "Morninggg Early Head ";

  if (hour >= 12 && hour < 18) greet = "Afternoonnn, Still Goingg ";
  else if (hour >= 18) greet = "Eveninggg, Still up and Surviving";

  document.getElementById("greeting").textContent =
    `HEYYY JOEY ${greet}`;
}

function renderCourses() {
  const grid = document.getElementById("courseGrid");
  const allTasks = getAllTasks();

  let totalTasks = 0;
  let completedTasks = 0;

  grid.innerHTML = courses.map(course => {
    const courseTasks = allTasks.filter(task => task.course === course.id);
    const completed = courseTasks.filter(task => task.completed).length;
    const total = courseTasks.length;
    const pending = total - completed;
    const progress = total ? Math.round((completed / total) * 100) : 0;

    totalTasks += total;
    completedTasks += completed;

    return `
      <article class="course-card">
        <div class="course-top">
          <div class="course-icon">
            <i class="fas ${course.icon}"></i>
          </div>
          <span class="course-code">${course.code}</span>
        </div>

        <h3>${course.name}</h3>
        <p class="course-description">${course.description}</p>

        <div class="course-stats">
          <div class="course-stat">
            <strong>${total}</strong>
            Total Tasks
          </div>
          <div class="course-stat">
            <strong>${completed}</strong>
            Completed
          </div>
          <div class="course-stat">
            <strong>${pending}</strong>
            Pending
          </div>
        </div>

        <div class="course-progress">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>

        <div class="course-bottom">
          <span class="progress-label">
            Progress: <strong>${progress}%</strong>
          </span>

          <a class="view-course" href="course-todo.html?course=${course.id}">
            View To-Do
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </article>
    `;
  }).join("");

  const overall = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  document.getElementById("overallProgressText").textContent = overall + "%";
  document.getElementById("overallProgressBar").style.width = overall + "%";
  document.getElementById("totalCourseTasks").textContent = totalTasks;
  document.getElementById("completedCourseTasks").textContent = completedTasks;
}

updateGreeting();
renderCourses();
