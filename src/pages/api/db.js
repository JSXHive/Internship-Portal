import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set in environment variables");
}

console.log("✅ Using database URL:", process.env.DATABASE_URL.replace(/:(.*?)@/, ":*****@"));

let pool;

try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
  });

  // Test connection
  (async () => {
    const client = await pool.connect();
    console.log("✅ Database connection successful");
    client.release();
  })();
} catch (err) {
  console.error("❌ Failed to initialize database pool:", err);
  throw err;
}

export default pool;
