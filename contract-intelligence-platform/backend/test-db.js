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

    const result = await client.query("SELECT id, title, category, upload_date FROM contracts LIMIT 10;");
    console.log("Contracts in DB:", result.rows);
    
    const analysisRes = await client.query("SELECT contract_id, risk_level, contract_type FROM contract_analysis LIMIT 10;");
    console.log("Analyses in DB:", analysisRes.rows);

    await client.end();
  } catch (err) {
    console.error("❌ Connection failed:");
    console.error(err);
  }
}

test();