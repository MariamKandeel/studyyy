const CALENDAR_KEY = "blueflowCalendarEvents";
let events = [];
let viewDate = new Date();
let selectedDate = null;

const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, "0");
const dateKey = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;
const todayKey = (() => { const d = new Date(); return dateKey(d.getFullYear(), d.getMonth(), d.getDate()); })();
const requestedDate = new URLSearchParams(window.location.search).get("date");
if (requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
  const requested = new Date(`${requestedDate}T12:00:00`);
  if (!Number.isNaN(requested.getTime())) { viewDate = requested; selectedDate = requestedDate; }
}

function loadEvents(){
  try { events = JSON.parse(localStorage.getItem(CALENDAR_KEY) || "[]"); }
  catch { events = []; }
  if (!Array.isArray(events)) events = [];
  render();
}
function saveEvents(){ localStorage.setItem(CALENDAR_KEY, JSON.stringify(events)); }
function formatMonth(d){ return d.toLocaleDateString(undefined,{month:"long",year:"numeric"}); }
function formatDate(key){
  const [y,m,day] = key.split("-").map(Number);
  return new Date(y,m-1,day).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
}
function escapeHtml(value){ const div=document.createElement("div"); div.textContent=value; return div.innerHTML; }
function render(){ renderCalendar(); renderUpcoming(); }
function renderCalendar(){
  const y=viewDate.getFullYear(), m=viewDate.getMonth();
  $("monthTitle").textContent=formatMonth(viewDate);
  const monthEvents=events.filter(e=>e.date.startsWith(`${y}-${pad(m+1)}-`));
  $("eventCount").textContent=`${monthEvents.length} event${monthEvents.length===1?"":"s"} this month`;
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  const prevDays=new Date(y,m,0).getDate();
  const cells=[];
  for(let i=first-1;i>=0;i--) cells.push({day:prevDays-i,muted:true,key:dateKey(y,m-1,prevDays-i)});
  for(let d=1;d<=days;d++) cells.push({day:d,muted:false,key:dateKey(y,m,d)});
  let next=1; while(cells.length<42) cells.push({day:next++,muted:true,key:dateKey(y,m+1,next-1)});
  $("calendarGrid").innerHTML=cells.map(cell=>{
    const dayEvents=events.filter(e=>e.date===cell.key).sort(sortEvents).slice(0,3);
    return `<button type="button" class="day ${cell.muted?"muted":""} ${cell.key===todayKey?"today":""} ${cell.key===selectedDate?"selected":""}" data-date="${cell.key}"><span class="day-number">${cell.day}</span>${dayEvents.map(e=>`<span class="event-pill ${e.type}">${escapeHtml(e.title)}</span>`).join("")}</button>`;
  }).join("");
  document.querySelectorAll(".day").forEach(btn=>btn.addEventListener("click",()=>openModal(btn.dataset.date)));
}
function sortEvents(a,b){ return `${a.date}T${a.time||"23:59"}`.localeCompare(`${b.date}T${b.time||"23:59"}`); }
function renderUpcoming(){
  const upcoming=[...events].filter(e=>e.date>=todayKey).sort(sortEvents).slice(0,6);
  $("upcomingCount").textContent=upcoming.length;
  $("upcomingList").innerHTML=upcoming.length ? upcoming.map(e=>`<div class="upcoming-item"><div class="upcoming-date">${formatDate(e.date)}${e.time?` · ${e.time}`:""}</div><div class="upcoming-title"><span class="type-dot ${e.type}"></span>${escapeHtml(e.title)}</div><div class="upcoming-meta">${e.type[0].toUpperCase()+e.type.slice(1)} · ${e.priority[0].toUpperCase()+e.priority.slice(1)} priority${e.notes?` · ${escapeHtml(e.notes)}`:""}</div><div style="margin-top:9px;display:flex;gap:7px"><button type="button" class="secondary-btn edit-event" data-id="${e.id}" style="padding:7px 10px;font-size:11px">Edit</button><button type="button" class="secondary-btn delete-event" data-id="${e.id}" style="padding:7px 10px;font-size:11px">Delete</button></div></div>`).join("") : `<div class="empty-state">Nothing scheduled yet.<br>Click <b>Add Deadline</b> to start planning.</div>`;
  document.querySelectorAll(".edit-event").forEach(b=>b.addEventListener("click",()=>editEvent(b.dataset.id)));
  document.querySelectorAll(".delete-event").forEach(b=>b.addEventListener("click",()=>deleteEvent(b.dataset.id)));
}
function openModal(date=selectedDate){
  selectedDate=date || todayKey;
  $("eventId").value=""; $("modalTitle").textContent="Add Deadline"; $("eventForm").reset(); $("eventDate").value=selectedDate; $("formError").textContent=""; $("eventModal").classList.add("active"); $("eventModal").setAttribute("aria-hidden","false"); $("eventTitle").focus();
}
function closeModal(){ $("eventModal").classList.remove("active"); $("eventModal").setAttribute("aria-hidden","true"); }
function editEvent(id){
  const e=events.find(x=>String(x.id)===String(id)); if(!e) return;
  selectedDate=e.date; $("eventId").value=e.id; $("eventTitle").value=e.title; $("eventDate").value=e.date; $("eventTime").value=e.time||""; $("eventType").value=e.type; $("eventPriority").value=e.priority; $("eventNotes").value=e.notes||""; $("modalTitle").textContent="Edit Event"; $("formError").textContent=""; $("eventModal").classList.add("active"); $("eventModal").setAttribute("aria-hidden","false"); $("eventTitle").focus();
}
function deleteEvent(id){
  const event = events.find(e=>String(e.id)===String(id));
  if(!event) return;
  const modal = $("deleteModal");
  $("deleteEventId").value = event.id;
  $("deleteEventName").textContent = event.title || "this deadline";
  modal.classList.add("active");
  modal.setAttribute("aria-hidden","false");
}
function closeDeleteModal(){
  const modal = $("deleteModal");
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden","true");
}
function confirmDeleteEvent(){
  const id = $("deleteEventId").value;
  events = events.filter(e=>String(e.id)!==String(id));
  saveEvents();
  closeDeleteModal();
  render();
}
$("eventForm").addEventListener("submit",e=>{
  e.preventDefault();
  const title=$("eventTitle").value.trim(), date=$("eventDate").value;
  if(!title||!date){ $("formError").textContent="Please add a title and date."; return; }
  const data={title,date,time:$("eventTime").value,type:$("eventType").value,priority:$("eventPriority").value,notes:$("eventNotes").value.trim()};
  const id=$("eventId").value;
  if(id){ const item=events.find(x=>String(x.id)===String(id)); if(item) Object.assign(item,data); }
  else events.push({id:Date.now(),...data});
  saveEvents(); closeModal(); viewDate=new Date(`${date}T12:00:00`); render();
});
$("addEventBtn").addEventListener("click",()=>openModal());
$("closeModal").addEventListener("click",closeModal); $("cancelBtn").addEventListener("click",closeModal);
$("eventModal").addEventListener("click",e=>{if(e.target===$("eventModal")) closeModal();});
$("prevMonth").addEventListener("click",()=>{viewDate.setMonth(viewDate.getMonth()-1);render();});
$("nextMonth").addEventListener("click",()=>{viewDate.setMonth(viewDate.getMonth()+1);render();});
$("todayBtn").addEventListener("click",()=>{viewDate=new Date();selectedDate=todayKey;render();});
$("closeDeleteModal").addEventListener("click",closeDeleteModal);
$("cancelDeleteBtn").addEventListener("click",closeDeleteModal);
$("confirmDeleteBtn").addEventListener("click",confirmDeleteEvent);
$("deleteModal").addEventListener("click",e=>{if(e.target===$("deleteModal")) closeDeleteModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if($("deleteModal").classList.contains("active")) closeDeleteModal(); else closeModal();}});
loadEvents();
