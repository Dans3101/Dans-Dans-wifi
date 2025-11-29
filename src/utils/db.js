import sqlite3 from "sqlite3";
import { open } from "sqlite";

const db = await open({
  filename: "./wifi.db",
  driver: sqlite3.Database
});

await db.exec(`
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mac TEXT,
  phone TEXT,
  status TEXT,
  minutes INTEGER,
  checkoutID TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);

export default db;