import { createClient } from "@libsql/client";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const turso = createClient({
  url: process.env.VITE_TURSO_DATABASE_URL,
  authToken: process.env.VITE_TURSO_AUTH_TOKEN,
});

async function migrate() {
  try {
    const sqlPath = path.resolve(__dirname, 'migration_documents.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const statements = sql.split(';').filter(s => s.trim() !== '');

    for (const statement of statements) {
      await turso.execute(statement);
    }
    console.log("✅ Tabella documenti creata.");
  } catch (err) {
    console.error("❌ Errore:", err);
  } finally {
    turso.close();
  }
}

migrate();
