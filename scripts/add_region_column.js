import { createClient } from "@libsql/client";

const url = "libsql://database-gestionale-emu-rick-coding.aws-eu-west-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjkwMjc2NjYsImlkIjoiNTJjOTg4ZGYtYzQ1OS00OTkwLThlMWMtZDJiZGY5ZjdiOTEyIiwicmlkIjoiMzVlZTc2NmQtM2Q2My00ZGQ5LTlkODEtODMxMzIxNTEwODdjIn0.19tgct8NLALwqoavOvV2xAVCLaT2ti88FeqU27PxMmjtA3yp9yakcMO0wHx8eH-ZvUnYX2W6pmu_32uG3gp1DQ";

const client = createClient({
  url,
  authToken,
});

async function addRegionColumn() {
  try {
    console.log("🔌 Connessione a Turso...");
    console.log("🚀 Aggiunta colonna 'region' alla tabella projects...");
    
    await client.execute("ALTER TABLE projects ADD COLUMN region TEXT");
    
    console.log("✅ Colonna 'region' aggiunta con successo!");
  } catch (err) {
    if (err.message && err.message.includes("duplicate column name")) {
      console.log("⚠️ La colonna 'region' esiste già.");
    } else {
      console.error("❌ Errore:", err);
    }
  } finally {
    client.close();
  }
}

addRegionColumn();