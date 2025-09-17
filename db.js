import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);


export const db = new Database(path.join(dataDir, 'app.db'));


db.pragma('journal_mode = WAL');


db.exec(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
email TEXT NOT NULL UNIQUE,
password_hash TEXT NOT NULL,
created_at TEXT NOT NULL DEFAULT (datetime('now'))
);


CREATE TABLE IF NOT EXISTS contacts (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER NOT NULL,
first_name TEXT NOT NULL,
last_name TEXT NOT NULL,
birth_date TEXT NOT NULL, -- YYYY-MM-DD
sex TEXT NOT NULL CHECK (sex IN ('Masculino','Feminino')),
email TEXT, -- opcional
notes TEXT, -- max 512 (validar na app)
likes INTEGER NOT NULL DEFAULT 0,
created_at TEXT NOT NULL DEFAULT (datetime('now')),
updated_at TEXT NOT NULL DEFAULT (datetime('now')),
FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE IF NOT EXISTS contact_links (
id INTEGER PRIMARY KEY AUTOINCREMENT,
contact_id INTEGER NOT NULL,
url TEXT NOT NULL,
FOREIGN KEY (contact_id) REFERENCES contacts(id)
);


CREATE TRIGGER IF NOT EXISTS trg_contacts_updated_at
AFTER UPDATE ON contacts
FOR EACH ROW BEGIN
UPDATE contacts SET updated_at = datetime('now') WHERE id = OLD.id;
END;
`);