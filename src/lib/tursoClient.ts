import { createClient } from "@libsql/client";

const dbUrl = import.meta.env.VITE_TURSO_DB_URL;
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

if (!dbUrl || !authToken) {
  console.error("⚠️ Turso credentials missing in .env.local");
}

export const turso = createClient({
  url: dbUrl,
  authToken: authToken,
});
