const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3000;

// Use express.json() middleware to parse JSON requests
app.use(express.json());

// Serve static files from the "public" directory
// app.use(express.static('frontend'));
app.use(express.static('../frontend'));

// Connect to the SQLite database
// For a persistent database, replace ':memory:' with a file path
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

// Create the tasks table
db.serialize(() => {
  db.run(
    'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, completed BOOLEAN, dateTime TEXT)'
  );
});

// Endpoint to insert a new task
app.post('/tasks', (req, res) => {
  console.log('POST /tasks received:', req.body); // Log incoming request data
  const { text, completed, dateTime } = req.body;
  const query =
    'INSERT INTO tasks (text, completed, dateTime) VALUES (?, ?, ?)';
  db.run(query, [text, completed, dateTime], function (err) {
    if (err) {
      console.error('Database error:', err.message); // Log any errors
      return res.status(500).json({ error: err.message });
    }
    console.log(`Task added with ID: ${this.lastID}`); // Confirm task addition
    res.status(201).json({ id: this.lastID });
  });
});

// Endpoint to retrieve all tasks
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ tasks: rows });
  });
});

// Endpoint to update a task
app.patch('/tasks/:id', (req, res) => {
  const { text, completed, dateTime } = req.body;
  const query =
    'UPDATE tasks SET text = ?, completed = ?, dateTime = ? WHERE id = ?';
  db.run(query, [text, completed, dateTime, req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ updated: this.changes });
  });
});

// Endpoint to delete a task
app.delete('/tasks/:id', (req, res) => {
  const query = 'DELETE FROM tasks WHERE id = ?';
  db.run(query, [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ deleted: this.changes });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
