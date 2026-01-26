import { createClient } from "@libsql/client";

// Supporta entrambi i nomi comuni per evitare errori di configurazione su Vercel
const dbUrl = import.meta.env.VITE_TURSO_DATABASE_URL || import.meta.env.VITE_TURSO_DB_URL;
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

if (!dbUrl || !authToken) {
  console.error("⚠️ Turso credentials missing in environment variables");
}

export const turso = createClient({
  url: dbUrl || "http://127.0.0.1:8081", // Fallback locale se proprio manca tutto
  authToken: authToken,
});
