// backend/server.js
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',       // change this
  host: 'localhost',
  database: 'student', // change this
  password: 'admin', // change this
  port: 5432
});

// Example route for form submission
app.post('/submit', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const result = await pool.query(
      'INSERT INTO form_submissions (name, email, message) VALUES ($1, $2, $3) RETURNING *',
      [name, email, message]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
