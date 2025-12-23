import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const connectionString =
  process.env.DATABASE_URL || "postgresql://localhost:5432/chronos";

const isInternalUrl =
  connectionString.includes(".internal") ||
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: isProduction && !isInternalUrl
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
});

pool.on("error", (err) => {
  console.error("Database pool error", err);
});

export const db = drizzle(pool);

