const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./activity.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS activity (
    userId TEXT PRIMARY KEY,
    count INTEGER
  )`);
});

module.exports = db;
