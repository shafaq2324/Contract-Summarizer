require("dotenv").config();
const { Client } = require("pg");

console.log(process.env.DATABASE_URL);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function test() {
  try {
    await client.connect();
    console.log("✅ Connected successfully");

    const result = await client.query("SELECT NOW()");
    console.log(result.rows);

    await client.end();
  } catch (err) {
    console.error("❌ Connection failed:");
    console.error(err);
  }
}

test();