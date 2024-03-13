document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const taskList = document.getElementById('task-list');

  // Function to retrieve and display tasks from the database
  function fetchTasks() {
    fetch('/tasks')
      .then((response) => response.json())
      .then((data) => {
        taskList.innerHTML = ''; // Clear the list before adding new tasks
        data.tasks.forEach((task) => {
          // addTaskToList(task.text, task.completed, task.dateTime, task.id);
          const isCompleted = !!task.completed; // Convert to boolean if needed, though it might already be implicit
          addTaskToList(task.text, isCompleted, task.dateTime, task.id);
        });
      })
      .catch((error) => console.error('Error:', error));
  }

  // Function to add a task to the DOM
  function addTaskToList(taskText, completed, dateTime, id) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.setAttribute('data-id', id);

    const taskContent = document.createElement('span');
    taskContent.textContent = taskText;
    if (completed) {
      taskContent.classList.add('completed');
    }
    li.appendChild(taskContent);

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.style.display = 'none';
    li.appendChild(editInput);

    const dateSpan = document.createElement('span');
    dateSpan.textContent = dateTime;
    dateSpan.className = 'task-date-time';
    li.appendChild(dateSpan);

    const completeBtn = document.createElement('button');
    completeBtn.textContent = completed ? 'Uncomplete' : 'Complete';
    completeBtn.className = completed
      ? 'uncomplete-task task-action'
      : 'complete-task task-action';
    li.appendChild(completeBtn);

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

  // Load tasks from the database when the page is loaded
  fetchTasks();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();
    const dateTime = new Date().toISOString(); // ISO string for consistency

    if (taskText) {
      fetch('/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: taskText,
          completed: false,
          dateTime: dateTime,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          addTaskToList(taskText, false, dateTime, data.id);
          taskInput.value = ''; // Clear input field
        })
        .catch((error) => console.error('Error:', error));
    }
  });

  taskList.addEventListener('click', (e) => {
    if (!e.target.classList.contains('task-action')) return;

    const li = e.target.closest('.task-item');
    const id = li.getAttribute('data-id');
    const taskContent = li.querySelector('span');

    if (e.target.classList.contains('delete-task')) {
      fetch(`/tasks/${id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then(() => {
          taskList.removeChild(li);
        })
        .catch((error) => console.error('Error:', error));
    } else if (e.target.classList.contains('edit-task')) {
      const editInput = li.querySelector('.edit-input');
      const isEditing = e.target.textContent === 'Edit';
      if (isEditing) {
        editInput.value = taskContent.textContent;
        editInput.style.display = 'block';
        taskContent.style.display = 'none';
        e.target.textContent = 'Save';
      } else {
        fetch(`/tasks/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: editInput.value,
            completed: taskContent.classList.contains('completed'),
            dateTime: li.querySelector('.task-date-time').textContent,
          }),
        })
          .then((response) => response.json())
          .then(() => {
            taskContent.textContent = editInput.value;
            editInput.style.display = 'none';
            taskContent.style.display = 'block';
            e.target.textContent = 'Edit';
          })
          .catch((error) => console.error('Error:', error));
      }
    } else if (
      e.target.classList.contains('complete-task') ||
      e.target.classList.contains('uncomplete-task')
    ) {
      const completed = e.target.classList.contains('complete-task');
      fetch(`/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: taskContent.textContent,
          completed: completed ? false : true, // Explicitly toggle the boolean value
          dateTime: li.querySelector('.task-date-time').textContent,
        }),
      })
        .then((response) => response.json())
        .then(() => {
          if (completed) {
            taskContent.classList.add('completed');
            e.target.textContent = 'Uncomplete';
            e.target.className = 'uncomplete-task task-action';
          } else {
            taskContent.classList.remove('completed');
            e.target.textContent = 'Complete';
            e.target.className = 'complete-task task-action';
          }
        })
        .catch((error) => console.error('Error:', error));
    }
  });
});
