const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'ahdija',
  password: '4422derrick',
  database: 'agrogrow'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection error:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL');
});

// promise-based query helper
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

module.exports = { query };
