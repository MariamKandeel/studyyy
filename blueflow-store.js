// Shared cloud data layer for BlueFlow.
// Firestore is the source of truth; localStorage is only used for one-time migration.
(function () {
  const TASK_KEY = "codynnflowTasks";
  const EVENT_KEY = "blueflowCalendarEvents";

  function taskCollection(user) {
    return BlueFlowFirebase.tasksCollection(user.uid);
  }

  function eventCollection(user) {
    return BlueFlowFirebase.eventsCollection(user.uid);
  }

  function readLocal(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function normalizeTask(task) {
    return {
      id: Number(task.id),
      title: String(task.title || ""),
      status: task.status || "pending",
      priority: task.priority || "normal",
      completed: Boolean(task.completed),
      course: task.course || "course1"
    };
  }

  function normalizeEvent(event) {
    return {
      id: String(event.id),
      title: String(event.title || ""),
      date: String(event.date || ""),
      time: String(event.time || ""),
      type: event.type || "other",
      priority: event.priority || "normal",
      notes: String(event.notes || "")
    };
  }

  async function seedTasksIfEmpty(user, defaults) {
    const snap = await taskCollection(user).get();
    if (!snap.empty) return;

    let seed = readLocal(TASK_KEY, []);
    if (!seed.length) seed = defaults || [];
    if (!seed.length) return;

    const batch = BlueFlowFirebase.db.batch();
    seed.map(normalizeTask).forEach(task => {
      batch.set(taskCollection(user).doc(String(task.id)), task);
    });
    await batch.commit();
  }

  async function seedEventsIfEmpty(user) {
    const snap = await eventCollection(user).get();
    if (!snap.empty) return;

    const seed = readLocal(EVENT_KEY, []);
    if (!seed.length) return;

    const batch = BlueFlowFirebase.db.batch();
    seed.map(normalizeEvent).forEach(event => {
      batch.set(eventCollection(user).doc(String(event.id)), event);
    });
    await batch.commit();
  }

  function watchTasks(user, callback) {
    return taskCollection(user).onSnapshot(snapshot => {
      const items = snapshot.docs.map(doc => normalizeTask(doc.data()));
      items.sort((a, b) => a.id - b.id);
      localStorage.setItem(TASK_KEY, JSON.stringify(items));
      callback(items);
    }, error => console.error("BlueFlow task sync error:", error));
  }

  function watchEvents(user, callback) {
    return eventCollection(user).onSnapshot(snapshot => {
      const items = snapshot.docs.map(doc => normalizeEvent(doc.data()));
      items.sort((a, b) => `${a.date}T${a.time || "23:59"}`.localeCompare(`${b.date}T${b.time || "23:59"}`));
      localStorage.setItem(EVENT_KEY, JSON.stringify(items));
      callback(items);
    }, error => console.error("BlueFlow calendar sync error:", error));
  }

  async function setTask(user, task) {
    const normalized = normalizeTask(task);
    await taskCollection(user).doc(String(normalized.id)).set(normalized);
  }

  async function removeTask(user, id) {
    await taskCollection(user).doc(String(id)).delete();
  }

  async function setEvent(user, event) {
    const normalized = normalizeEvent(event);
    await eventCollection(user).doc(String(normalized.id)).set(normalized);
  }

  async function removeEvent(user, id) {
    await eventCollection(user).doc(String(id)).delete();
  }

  window.BlueFlowStore = {
    seedTasksIfEmpty,
    seedEventsIfEmpty,
    watchTasks,
    watchEvents,
    setTask,
    removeTask,
    setEvent,
    removeEvent
  };
})();
