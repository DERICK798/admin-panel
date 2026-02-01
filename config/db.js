// config/db.js
const mysql = require('mysql2');

// ✅ Create a connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'ahdija',
  password: '4422derrick',
  database: 'agrogrow'
});

// Test connection
db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection error:', err.message);
  } else {
    console.log('✅ Connected to MySQL');
  }
});

// ✅ Promise-based query helper
// Use like: await db.query('SELECT * FROM users WHERE id = ?', [1]);
db.query = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.execute(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

module.exports = db;
