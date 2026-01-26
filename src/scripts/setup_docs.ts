import { turso } from '../lib/tursoClient';

async function migrate() {
  console.log("Inizio creazione tabella documenti...");
  try {
    // 1. Crea la tabella per i documenti
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS project_documents (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        file_data TEXT NOT NULL, -- Qui salviamo il Base64 del PDF
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
    `);
    
    // 2. Crea indice per velocizzare il recupero
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);
    `);

    console.log("✅ Tabella 'project_documents' pronta per l'uso.");
  } catch (e) {
    console.error("❌ Errore creazione tabella:", e);
  }
}

migrate();
