const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Open a database connection (or create a new one if it doesn't exist)
const db = new sqlite3.Database('database/Chinook.db');

// Read the SQL file content
const sql = fs.readFileSync('database/Chinook_MySql.sql', 'utf8');

// Execute the SQL commands in the file
db.exec(sql, function(err) {
  if (err) {
    console.error(err.message);
  } else {
    console.log('SQL file executed successfully.');
  }

  // Close the database connection
  db.close();
});