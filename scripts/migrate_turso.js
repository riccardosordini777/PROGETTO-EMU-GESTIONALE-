import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CONFIGURAZIONE
const url = "libsql://database-gestionale-emu-rick-coding.aws-eu-west-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjkwMjc2NjYsImlkIjoiNTJjOTg4ZGYtYzQ1OS00OTkwLThlMWMtZDJiZGY5ZjdiOTEyIiwicmlkIjoiMzVlZTc2NmQtM2Q2My00ZGQ5LTlkODEtODMxMzIxNTEwODdjIn0.19tgct8NLALwqoavOvV2xAVCLaT2ti88FeqU27PxMmjtA3yp9yakcMO0wHx8eH-ZvUnYX2W6pmu_32uG3gp1DQ";

console.log("🔌 Connessione a Turso...");
const client = createClient({
  url,
  authToken,
});

async function main() {
  try {
    // Leggi lo schema SQL
    const schemaPath = path.join(__dirname, "..", "schema_turso.sql");
    const sqlContent = fs.readFileSync(schemaPath, "utf-8");

    // Dividi le istruzioni SQL (semplice split per ;)
    const statements = sqlContent
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`📜 Trovate ${statements.length} istruzioni SQL.`);

    for (const sql of statements) {
      console.log(`🚀 Esecuzione: ${sql.substring(0, 50)}...`);
      await client.execute(sql);
    }

    console.log("✅ Migrazione completata con successo!");
    console.log("   Tabelle 'profiles' e 'projects' create.");
  } catch (err) {
    console.error("❌ Errore durante la migrazione:", err);
  } finally {
    client.close();
  }
}

main();
