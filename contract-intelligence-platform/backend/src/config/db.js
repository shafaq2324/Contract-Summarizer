const { Pool } = require("pg");
require("dotenv").config();

// Create a new connection pool using your .env variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Export the pool so other files (like your controllers) can use it
module.exports = pool;