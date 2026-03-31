-- ==========================================
-- TABLE CREATION
-- ==========================================

-- Create the managers table for authentication
CREATE TABLE managers (
    manager_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL
);

-- Create the players table
CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(50) CHECK (position IN ('Forward', 'Midfielder', 'Defender', 'Goalkeeper')),
    jersey_number INT NOT NULL,
    fitness_status VARCHAR(50) CHECK (fitness_status IN ('Match Fit', 'Injured', 'Suspended', 'In Rehab')),
    morale_rating INT CHECK (morale_rating >= 1 AND morale_rating <= 10)
);

-- ==========================================
-- MOCK DATA INSERTION
-- ==========================================

-- Insert mock manager (frontend will hardcode these credentials for presentation)
INSERT INTO managers (username, password_hash, full_name) 
VALUES ('manager_1', 'hashed_password123', 'Pep Klopp');

-- Insert 8 realistic fictional football players
INSERT INTO players (name, position, jersey_number, fitness_status, morale_rating) VALUES 
('Marcus Sterling', 'Forward', 9, 'Match Fit', 9),
('Julian Alvarez', 'Forward', 11, 'Injured', 4),
('Kevin De Silva', 'Midfielder', 10, 'Match Fit', 8),
('Enzo Fernandez', 'Midfielder', 8, 'Suspended', 5),
('Virgil Van Berg', 'Defender', 4, 'Match Fit', 10),
('Ruben Dias', 'Defender', 3, 'In Rehab', 6),
('Trent James', 'Defender', 66, 'Match Fit', 7),
('Alisson Ederson', 'Goalkeeper', 1, 'Match Fit', 9);

-- ==========================================
-- QUERIES
-- ==========================================

-- 1. Fetch all players (Dashboard main view)
SELECT 
    player_id, 
    name, 
    position, 
    jersey_number, 
    fitness_status, 
    morale_rating 
FROM players
ORDER BY position, jersey_number;

-- 2. Filter players strictly by "Injured" or "Suspended" status (Status filter)
SELECT 
    player_id, 
    name, 
    position, 
    jersey_number, 
    fitness_status, 
    morale_rating 
FROM players
WHERE fitness_status IN ('Injured', 'Suspended')
ORDER BY name;
