CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('Manager', 'Player') NOT NULL,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    position ENUM('Forward', 'Midfielder', 'Defender', 'Goalkeeper'),
    jersey_number INT,
    fitness_status ENUM('Match Fit', 'Injured', 'Suspended', 'In Rehab'),
    morale_rating INT CHECK (morale_rating >= 1 AND morale_rating <= 10),
    list_status ENUM('pool', 'team', 'retired') DEFAULT 'pool',
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES members(id) ON DELETE CASCADE
);

INSERT INTO members (role, username, password_hash, name) 
VALUES ('Manager', 'manager_1', 'hashed_password123', 'Pep Klopp');

INSERT INTO members (role, name, position, jersey_number, fitness_status, morale_rating, manager_id) VALUES 
('Player', 'Marcus Sterling', 'Forward', 9, 'Match Fit', 9, 1),
('Player', 'Julian Alvarez', 'Forward', 11, 'Injured', 4, 1),
('Player', 'Kevin De Silva', 'Midfielder', 10, 'Match Fit', 8, 1),
('Player', 'Enzo Fernandez', 'Midfielder', 8, 'Suspended', 5, 1),
('Player', 'Virgil Van Berg', 'Defender', 4, 'Match Fit', 10, 1),
('Player', 'Ruben Dias', 'Defender', 3, 'In Rehab', 6, 1),
('Player', 'Trent James', 'Defender', 66, 'Match Fit', 7, 1),
('Player', 'Alisson Ederson', 'Goalkeeper', 1, 'Match Fit', 9, 1);

SELECT id as manager_id, username, name FROM members WHERE role = 'Manager' LIMIT 1;

SELECT 
    id as player_id, 
    name, 
    position, 
    jersey_number, 
    fitness_status, 
    morale_rating,
    list_status,
    manager_id
FROM members
WHERE role = 'Player' AND manager_id = 1
ORDER BY position, jersey_number;
