import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let db;

// Initialize SQLite database
async function initDB() {
  const dbExists = fs.existsSync('./football_manager.db');
  
  db = await open({
    filename: './football_manager.db',
    driver: sqlite3.Database
  });

  if (!dbExists) {
    console.log("Initializing SQLite database with schema and mock data...");
    
    // Create tables
    await db.exec(`
      CREATE TABLE managers (
          manager_id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL
      );

      CREATE TABLE players (
          player_id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          position TEXT CHECK (position IN ('Forward', 'Midfielder', 'Defender', 'Goalkeeper')) NOT NULL,
          jersey_number INTEGER NOT NULL,
          fitness_status TEXT CHECK (fitness_status IN ('Match Fit', 'Injured', 'Suspended', 'In Rehab')) NOT NULL,
          morale_rating INTEGER CHECK (morale_rating >= 1 AND morale_rating <= 10),
          list_status TEXT CHECK (list_status IN ('pool', 'team', 'retired')) DEFAULT 'pool'
      );
    `);

    // Insert Mock Data
    await db.run(`INSERT INTO managers (username, password_hash, full_name) VALUES ('manager_1', 'hashed_password123', 'Pep Klopp')`);
    
    const players = [
      ['Marcus Sterling', 'Forward', 9, 'Match Fit', 9],
      ['Julian Alvarez', 'Forward', 11, 'Injured', 4],
      ['Kevin De Silva', 'Midfielder', 10, 'Match Fit', 8],
      ['Enzo Fernandez', 'Midfielder', 8, 'Suspended', 5],
      ['Virgil Van Berg', 'Defender', 4, 'Match Fit', 10],
      ['Ruben Dias', 'Defender', 3, 'In Rehab', 6],
      ['Trent James', 'Defender', 66, 'Match Fit', 7],
      ['Alisson Ederson', 'Goalkeeper', 1, 'Match Fit', 9]
    ];

    const stmt = await db.prepare(`INSERT INTO players (name, position, jersey_number, fitness_status, morale_rating) VALUES (?, ?, ?, ?, ?)`);
    for (const p of players) {
      await stmt.run(p[0], p[1], p[2], p[3], p[4]);
    }
    await stmt.finalize();
    console.log("Database seeded successfully.");
  } else {
    console.log("Connected to existing SQLite database.");
  }
}

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const manager = await db.get('SELECT * FROM managers WHERE username = ?', [username]);
    if (manager) {
      if (password === 'password123') { // Mock check
        res.json({ success: true, manager });
      } else {
        res.status(401).json({ error: 'Invalid password' });
      }
    } else {
      res.status(401).json({ error: 'Manager not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all players
app.get('/api/players', async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM players ORDER BY position, jersey_number");
    const mapped = rows.map(p => ({ ...p, list: p.list_status || 'pool' }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Move player
app.put('/api/players/:id/move', async (req, res) => {
  const { id } = req.params;
  const { targetList } = req.body;
  try {
    await db.run("UPDATE players SET list_status = ? WHERE player_id = ?", [targetList, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rest player
app.put('/api/players/:id/rest', async (req, res) => {
  const { id } = req.params;
  try {
    await db.run("UPDATE players SET fitness_status = 'Match Fit', morale_rating = 10 WHERE player_id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add player
app.post('/api/players', async (req, res) => {
  const { name, position, jersey_number, fitness_status, morale_rating } = req.body;
  try {
    const result = await db.run(
      `INSERT INTO players (name, position, jersey_number, fitness_status, morale_rating) VALUES (?, ?, ?, ?, ?)`,
      [name, position, jersey_number, fitness_status, morale_rating]
    );
    res.json({ success: true, insertId: result.lastID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API Server with SQLite Backend running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database:", err);
});
