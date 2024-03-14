document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const taskList = document.getElementById('task-list');

  function toggleEditState(taskLi, taskIndex) {
    const editInput = taskLi.querySelector('.edit-input');
    const taskSpan = taskLi.querySelector('span');
    const editBtn = taskLi.querySelector('.edit-task');
    const isEditing = editBtn.textContent === 'Edit';
    if (isEditing) {
      editInput.value = taskSpan.textContent;
      editInput.style.display = 'block';
      taskSpan.style.display = 'none';
      editBtn.textContent = 'Save';
    } else {
      tasks[taskIndex].text = editInput.value;
      taskSpan.textContent = editInput.value;
      editInput.style.display = 'none';
      taskSpan.style.display = 'block';
      editBtn.textContent = 'Edit';
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach((task, index) => {
    if (task.text.trim() !== '') {
      addTaskToList(task.text, task.completed, task.dateTime, index);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();
    const dateTime = new Date().toLocaleString();
    if (taskText) {
      const newIndex = tasks.length;
      addTaskToList(taskText, false, dateTime, newIndex);
      tasks.push({ text: taskText, completed: false, dateTime: dateTime });
      localStorage.setItem('tasks', JSON.stringify(tasks));
      taskInput.value = ''; // Clear input field
    }
  });

  taskList.addEventListener('click', (e) => {
    if (!e.target.classList.contains('task-action')) return;

    const li = e.target.parentElement;
    const taskIndex = Array.from(taskList.children).indexOf(li);
    if (e.target.classList.contains('edit-task')) {
      toggleEditState(li, taskIndex);
    } else if (e.target.classList.contains('delete-task')) {
      tasks.splice(taskIndex, 1);
      taskList.removeChild(li);
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } else if (
      e.target.classList.contains('complete-task') ||
      e.target.classList.contains('uncomplete-task')
    ) {
      tasks[taskIndex].completed = !tasks[taskIndex].completed;
      li.querySelector('span').classList.toggle('completed');
      li.querySelector('.complete-task').style.display = tasks[taskIndex]
        .completed
        ? 'none'
        : 'inline-block';
      li.querySelector('.uncomplete-task').style.display = tasks[taskIndex]
        .completed
        ? 'inline-block'
        : 'none';
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  });

  function addTaskToList(taskText, completed, dateTime, index) {
    const li = document.createElement('li');
    li.className = 'task-item';

    const taskContent = document.createElement('span');
    taskContent.textContent = taskText;
    if (completed) {
      taskContent.classList.add('completed');
    }
    li.appendChild(taskContent);

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    li.appendChild(editInput);

    const dateSpan = document.createElement('span');
    dateSpan.textContent = dateTime;
    dateSpan.className = 'task-date-time';
    li.appendChild(dateSpan);

    const completeBtn = document.createElement('button');
    completeBtn.textContent = 'Complete';
    completeBtn.className = 'complete-task task-action';
    completeBtn.style.display = completed ? 'none' : 'inline-block';
    li.appendChild(completeBtn);

    const uncompleteBtn = document.createElement('button');
    uncompleteBtn.textContent = 'Uncomplete';
    uncompleteBtn.className = 'uncomplete-task task-action';
    uncompleteBtn.style.display = completed ? 'inline-block' : 'none';
    li.appendChild(uncompleteBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-task task-action';
    li.appendChild(deleteBtn);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-task task-action';
    li.appendChild(editBtn);

    taskList.appendChild(li);
  }
});
