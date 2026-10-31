const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const taskCount = document.getElementById('taskCount');
const remainingCount = document.getElementById('remainingCount');
const clearCompletedButton = document.getElementById('clearCompleted');
const filterButtons = document.querySelectorAll('.filter');

let tasks = JSON.parse(localStorage.getItem('dailyFocusTasks') || '[]');
let currentFilter = 'all';

document.getElementById('todayLabel').textContent =
  new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function saveTasks() {
  localStorage.setItem('dailyFocusTasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  const visibleTasks = tasks.filter((task) => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  visibleTasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = `task-item${task.completed ? ' completed' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark ${task.text} as completed`);
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.type = 'button';
    deleteButton.textContent = '×';
    deleteButton.setAttribute('aria-label', `Delete ${task.text}`);
    deleteButton.addEventListener('click', () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.appendChild(item);
  });

  const completed = tasks.filter((task) => task.completed).length;
  const remaining = tasks.length - completed;
  taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;
  remainingCount.textContent = `${remaining} ${remaining === 1 ? 'task' : 'tasks'} left`;
  emptyState.hidden = visibleTasks.length !== 0;
  clearCompletedButton.disabled = completed === 0;
  clearCompletedButton.style.opacity = completed === 0 ? '.45' : '1';
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.unshift({ id: Date.now(), text, completed: false });
  saveTasks();
  taskInput.value = '';
  currentFilter = 'all';
  filterButtons.forEach((button) => button.classList.toggle('active', button.dataset.filter === 'all'));
  renderTasks();
  taskInput.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((entry) => entry.classList.toggle('active', entry === button));
    renderTasks();
  });
});

clearCompletedButton.addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
