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
let simulationTick = 0;

function startSimulation() {
  // Run simulation every 5 seconds
  setInterval(async () => {
    if (!db) return;
    simulationTick++;
    try {
      const players = await db.all("SELECT * FROM members WHERE role = 'Player'");
      let teamCount = players.filter(p => p.list_status === 'team').length;

      for (const p of players) {
        let currentMorale = p.morale_rating || 5;
        let currentList = p.list_status || 'pool'; 
        let newMorale = currentMorale;
        let newList = currentList;

        if (currentList === 'pool') {
          newMorale -= 1; // Pool players lose morale normally
        } else if (currentList === 'team') {
          if (simulationTick % 3 === 0) { // Slower decrease
            newMorale -= 1;
          }
        } else if (currentList === 'retired') {
          newMorale += 1; // Retired players actively rest and heal
        }

        // Apply limits
        if (newMorale > 10) newMorale = 10;
        if (newMorale < 1) newMorale = 1;

        // Auto-transfer logic on extremum limits
        if (newMorale === 10 && currentList !== 'team') {
          if (teamCount < 11) {
            newList = 'team'; // Ready to play and there is space!
            teamCount++;
          } else {
            newList = 'pool'; // Team is full, wait in the available pool queue
          }
        } else if (newMorale === 1 && currentList !== 'retired') {
          newList = 'retired'; // Complete burnout. Player retires.
          if (currentList === 'team') teamCount--;
        }

        if (newMorale !== currentMorale || newList !== currentList) {
          // If returning from retirement or resting to team/pool, ensure match fit.
          const fitnessQuery = (newMorale === 10) ? ", fitness_status = 'Match Fit'" : "";
          await db.run(`UPDATE members SET morale_rating = ?, list_status = ? ${fitnessQuery} WHERE id = ?`, [newMorale, newList, p.id]);
        }
      }
    } catch (e) {
      console.error("Simulation error:", e.message);
    }
  }, 5000);
}

// Initialize SQLite database
async function initDB() {
  const dbExists = fs.existsSync('./football_manager_v3.db');
  
  db = await open({
    filename: './football_manager_v3.db', // Use v3 to force seed the new 18 players
    driver: sqlite3.Database
  });

  if (!dbExists) {
    console.log("Initializing unified merged SQLite database with schema and mock data...");
    
    // Create merged members table with a self-referencing foreign key
    await db.exec(`
      CREATE TABLE members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role TEXT CHECK (role IN ('Manager', 'Player')) NOT NULL,
          username TEXT UNIQUE,
          password_hash TEXT,
          name TEXT NOT NULL,
          position TEXT CHECK (position IN ('Forward', 'Midfielder', 'Defender', 'Goalkeeper')),
          jersey_number INTEGER,
          fitness_status TEXT CHECK (fitness_status IN ('Match Fit', 'Injured', 'Suspended', 'In Rehab')),
          morale_rating INTEGER CHECK (morale_rating >= 1 AND morale_rating <= 10),
          list_status TEXT CHECK (list_status IN ('pool', 'team', 'retired')) DEFAULT 'pool',
          manager_id INTEGER,
          FOREIGN KEY (manager_id) REFERENCES members(id) ON DELETE CASCADE
      );
      
      -- Ensure strictly only ONE manager account is allowed in the entire database
      CREATE UNIQUE INDEX one_manager ON members(role) WHERE role = 'Manager';
    `);

    // Insert Single Manager
    const mgrResult = await db.run(`INSERT INTO members (role, username, password_hash, name) VALUES ('Manager', 'manager_1', 'hashed_password123', 'Pep Klopp')`);
    const managerId = mgrResult.lastID;
    
    const players = [
      ['Marcus Sterling', 'Forward', 9, 'Match Fit', 9],
      ['Julian Alvarez', 'Forward', 11, 'Injured', 4],
      ['Kevin De Silva', 'Midfielder', 10, 'Match Fit', 8],
      ['Enzo Fernandez', 'Midfielder', 8, 'Suspended', 5],
      ['Virgil Van Berg', 'Defender', 4, 'Match Fit', 10],
      ['Ruben Dias', 'Defender', 3, 'In Rehab', 6],
      ['Trent James', 'Defender', 66, 'Match Fit', 7],
      ['Alisson Ederson', 'Goalkeeper', 1, 'Match Fit', 9],
      ['Lionel Andreas', 'Forward', 10, 'Match Fit', 9],
      ['Donatello Mbappe', 'Forward', 7, 'Injured', 3],
      ['Luka Modrick', 'Midfielder', 10, 'Match Fit', 8],
      ['Jude Belling', 'Midfielder', 5, 'Match Fit', 7],
      ['Harry Kaner', 'Forward', 9, 'Suspended', 5],
      ['Bukayo Saka', 'Forward', 77, 'Match Fit', 8],
      ['Kyle Walker', 'Defender', 2, 'Match Fit', 7],
      ['Rodri Hernandez', 'Midfielder', 16, 'In Rehab', 6],
      ['Erling Haaland', 'Forward', 9, 'Match Fit', 9],
      ['Givardiol Yosko', 'Defender', 24, 'Match Fit', 8]
    ];

    // Insert players with dependency on the manager (manager_id set to managerId)
    const stmt = await db.prepare(`INSERT INTO members (role, name, position, jersey_number, fitness_status, morale_rating, manager_id) VALUES ('Player', ?, ?, ?, ?, ?, ?)`);
    for (const p of players) {
      await stmt.run(p[0], p[1], p[2], p[3], p[4], managerId);
    }
    await stmt.finalize();
    console.log("Unified database seeded successfully.");
  } else {
    console.log("Connected to existing unified SQLite database.");
  }
}

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const manager = await db.get("SELECT id as manager_id, username, password_hash, name FROM members WHERE role = 'Manager' AND username = ?", [username]);
    if (manager) {
      if (password === 'password123') { // Mock password check
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

// Get all players for the single manager
app.get('/api/players', async (req, res) => {
  try {
    const manager = await db.get("SELECT id FROM members WHERE role = 'Manager' LIMIT 1");
    
    // Alias id as player_id to keep the React frontend components entirely unmodified
    const rows = await db.all("SELECT id as player_id, name, position, jersey_number, fitness_status, morale_rating, list_status FROM members WHERE role = 'Player' AND manager_id = ? ORDER BY position, jersey_number", [manager.id]);
    
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
    await db.run("UPDATE members SET list_status = ? WHERE id = ? AND role = 'Player'", [targetList, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rest player
app.put('/api/players/:id/rest', async (req, res) => {
  const { id } = req.params;
  try {
    await db.run("UPDATE members SET fitness_status = 'Match Fit', morale_rating = 10 WHERE id = ? AND role = 'Player'", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add player via manager
app.post('/api/players', async (req, res) => {
  const { name, position, jersey_number, fitness_status, morale_rating } = req.body;
  try {
    const manager = await db.get("SELECT id FROM members WHERE role = 'Manager' LIMIT 1");
    const result = await db.run(
      `INSERT INTO members (role, name, position, jersey_number, fitness_status, morale_rating, manager_id) VALUES ('Player', ?, ?, ?, ?, ?, ?)`,
      [name, position, jersey_number, fitness_status, morale_rating, manager.id]
    );
    res.json({ success: true, insertId: result.lastID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
initDB().then(() => {
  startSimulation();
  app.listen(PORT, () => {
    console.log(`API Server with Merged SQLite Backend running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize unified database:", err);
});
