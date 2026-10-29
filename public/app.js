/* 智能任务管理系统 - 前端逻辑 */

const PRIORITY_LABELS = {
  high: '高',
  medium: '中',
  low: '低',
};

let currentFilter = 'all';

const taskList = document.getElementById('task-list');
const addForm = document.getElementById('add-form');
const titleInput = document.getElementById('task-title');
const prioritySelect = document.getElementById('task-priority');

/* ---------- API 封装 ---------- */
async function api(path, options) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data.error && data.error.message) || '请求失败，请稍后重试');
  }
  return data;
}

const getTasks = (priority) =>
  api(`/api/tasks${priority ? `?priority=${priority}` : ''}`);
const createTask = (title, priority) =>
  api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, priority }),
  });
const toggleTask = (id) =>
  api(`/api/tasks/${id}/toggle`, { method: 'PATCH' });
const deleteTask = (id) =>
  api(`/api/tasks/${id}`, { method: 'DELETE' });

/* ---------- 渲染 ---------- */
function renderTasks(items) {
  if (!items.length) {
    taskList.innerHTML = '<p class="empty">暂无任务，添加一个吧</p>';
    return;
  }

  taskList.innerHTML = '';

  items.forEach((task) => {
    const item = document.createElement('div');
    item.className = 'task-item';
    item.dataset.id = task.id;

    // 完成/未完成切换按钮
    const toggle = document.createElement('button');
    toggle.className = `toggle${task.completed ? ' completed' : ''}`;
    toggle.setAttribute('aria-label', task.completed ? '标记为未完成' : '标记为已完成');
    toggle.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
    toggle.addEventListener('click', () => toggleTask(task.id).then(load));

    // 标题（已完成加删除线）
    const title = document.createElement('span');
    title.className = `task-title${task.completed ? ' completed' : ''}`;
    title.textContent = task.title;

    // 优先级徽章
    const badge = document.createElement('span');
    badge.className = `priority-badge ${task.priority}`;
    badge.textContent = PRIORITY_LABELS[task.priority];

    // 删除按钮
    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.setAttribute('aria-label', '删除任务');
    del.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>';
    del.addEventListener('click', () => deleteTask(task.id).then(load));

    item.append(toggle, title, badge, del);
    taskList.appendChild(item);
  });
}

/* ---------- 数据加载 ---------- */
async function load() {
  taskList.innerHTML = '<p class="empty">加载中...</p>';
  try {
    const { items } = await getTasks(currentFilter === 'all' ? undefined : currentFilter);
    renderTasks(items);
  } catch (err) {
    taskList.innerHTML = `<p class="empty">${err.message}</p>`;
  }
}

/* ---------- 事件绑定 ---------- */
addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;

  const submitBtn = addForm.querySelector('button');
  submitBtn.disabled = true;
  try {
    await createTask(title, prioritySelect.value);
    titleInput.value = '';
    prioritySelect.value = 'medium';
    await load();
  } catch (err) {
    alert(err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

document.querySelectorAll('.filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    load();
  });
});

/* 初始化加载 */
load();
