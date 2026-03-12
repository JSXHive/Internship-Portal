// lib/db.js
import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "internship_portal",
  password: "admin",
  port: 5432,
});

export { pool };