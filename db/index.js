const { Pool } = require("pg");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:password@localhost:5432/wt_lab8";

const isLocal =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

module.exports = pool;