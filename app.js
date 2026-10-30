const STORAGE_KEY = "todo.tasks";

const form = document.getElementById("add-form");
const input = document.getElementById("new-task");
const list = document.getElementById("task-list");
const count = document.getElementById("count");
const clearDone = document.getElementById("clear-done");

let tasks = load();

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(text) {
  tasks.push({ id: Date.now(), text, done: false });
  save();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.done = !task.done;
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

function render() {
  list.innerHTML = "";

  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Nothing to do. Enjoy your day!";
    list.appendChild(empty);
  }

  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");

    const check = document.createElement("button");
    check.className = "check";
    check.textContent = "✓";
    check.setAttribute("aria-label", "Toggle task");
    check.addEventListener("click", () => toggleTask(task.id));

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = task.text;

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "×";
    del.setAttribute("aria-label", "Delete task");
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(check, label, del);
    list.appendChild(li);
  }

  const remaining = tasks.filter((t) => !t.done).length;
  count.textContent = `${remaining} left`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = "";
  input.focus();
});

clearDone.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.done);
  save();
  render();
});

document.getElementById("today").textContent = new Date().toLocaleDateString(
  undefined,
  { weekday: "long", month: "long", day: "numeric" }
);

render();
