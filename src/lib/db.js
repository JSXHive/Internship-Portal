// // lib/db.js
// import pkg from "pg";

// const { Pool } = pkg;

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "internship_portal",
//   password: "admin",
//   port: 5432,
// });

// export { pool };

// src/lib/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  }
});

// Export as named export (with curly braces)
export { pool };