const BLUEFLOW_CALENDAR_KEY = "blueflowCalendarEvents";

(function () {
  const bell = document.getElementById("notificationBell");
  const dot = document.getElementById("notificationDot");
  const panel = document.getElementById("notificationPanel");
  const list = document.getElementById("notificationList");
  const count = document.getElementById("notificationCount");

  if (!bell || !dot || !panel || !list || !count) return;

  function pad(n) { return String(n).padStart(2, "0"); }
  function keyFromDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  function getEvents() {
    try {
      const saved = JSON.parse(localStorage.getItem(BLUEFLOW_CALENDAR_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }
  function dateLabel(eventDate, todayKey, tomorrowKey) {
    if (eventDate === todayKey) return "Due today";
    if (eventDate === tomorrowKey) return "Due tomorrow";
    return eventDate;
  }
  function refreshNotifications() {
    const now = new Date();
    const today = keyFromDate(now);
    const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tomorrow = keyFromDate(tomorrowDate);

    const notifications = getEvents()
      .filter(event => event && (event.date === today || event.date === tomorrow))
      .sort((a, b) => {
        const aTime = a.time || "23:59";
        const bTime = b.time || "23:59";
        return `${a.date}T${aTime}`.localeCompare(`${b.date}T${bTime}`);
      });

    dot.hidden = notifications.length === 0;
    count.textContent = notifications.length;
    count.hidden = notifications.length === 0;

    if (!notifications.length) {
      list.innerHTML = '<div class="notification-empty"><i class="fas fa-calendar-check"></i><span>No deadlines due today or tomorrow.</span></div>';
      return;
    }

    list.innerHTML = notifications.map(event => {
      const type = (event.type || "other").toLowerCase();
      const priority = (event.priority || "normal").toLowerCase();
      const safeTitle = String(event.title || "Untitled event").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
      const time = event.time ? ` · ${event.time}` : "";
      return `<button type="button" class="notification-item ${event.date === today ? "is-today" : "is-tomorrow"}" data-date="${event.date}">
        <span class="notification-icon ${type}"><i class="fas fa-${type === "exam" ? "graduation-cap" : type === "project" ? "folder-open" : type === "assignment" ? "clipboard-check" : "calendar-day"}"></i></span>
        <span class="notification-copy"><strong>${safeTitle}</strong><small>${dateLabel(event.date, today, tomorrow)}${time} · ${type[0].toUpperCase() + type.slice(1)} · ${priority[0].toUpperCase() + priority.slice(1)} priority</small></span>
      </button>`;
    }).join("");

    list.querySelectorAll(".notification-item").forEach(item => {
      item.addEventListener("click", () => {
        window.location.href = `calendar.html?date=${encodeURIComponent(item.dataset.date)}`;
      });
    });
  }

  bell.addEventListener("click", event => {
    event.stopPropagation();
    refreshNotifications();
    panel.classList.toggle("active");
    panel.setAttribute("aria-hidden", panel.classList.contains("active") ? "false" : "true");
  });

  document.addEventListener("click", event => {
    if (!panel.contains(event.target) && event.target !== bell && !bell.contains(event.target)) {
      panel.classList.remove("active");
      panel.setAttribute("aria-hidden", "true");
    }
  });

  window.addEventListener("storage", event => {
    if (event.key === BLUEFLOW_CALENDAR_KEY) refreshNotifications();
  });

  window.addEventListener("focus", refreshNotifications);
  refreshNotifications();
  setInterval(refreshNotifications, 60000);
})();
