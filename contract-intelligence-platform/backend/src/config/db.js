const { Pool, types } = require("pg");
require("dotenv").config();

// Parse TIMESTAMP (OID 1114) as UTC rather than local server system time
types.setTypeParser(1114, function(stringValue) {
  return new Date(stringValue.replace(' ', 'T') + 'Z');
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log("Connected to Supabase"))
  .catch(err => console.error("Connection error:", err));

module.exports = pool;