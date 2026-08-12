import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database table
async function initDb() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fruits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        color VARCHAR(50)
      )
    `);
    console.log('Fruits table initialized.');
    connection.release();
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDb();

// CREATE: Add a new fruit
app.post('/api/fruits', async (req, res) => {
  try {
    const { name, quantity, color } = req.body;
    const [result] = await pool.query(
      'INSERT INTO fruits (name, quantity, color) VALUES (?, ?, ?)',
      [name, quantity, color]
    );
    res.status(201).json({ id: result.insertId, name, quantity, color });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create fruit' });
  }
});

// READ: Get all fruits
app.get('/api/fruits', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM fruits');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch fruits' });
  }
});

// UPDATE: Update a fruit by ID
app.put('/api/fruits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, color } = req.body;
    await pool.query(
      'UPDATE fruits SET name = ?, quantity = ?, color = ? WHERE id = ?',
      [name, quantity, color, id]
    );
    res.json({ id: Number(id), name, quantity, color });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update fruit' });
  }
});

// DELETE: Delete a fruit by ID
app.delete('/api/fruits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM fruits WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete fruit' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
