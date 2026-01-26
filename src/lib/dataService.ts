import { turso } from './tursoClient';
import type { Project, Profile } from '../types';

/**
 * SERVICE LAYER - Gestione Dati Turso
 * Questo file centralizza tutte le chiamate al database per mantenere il codice ordinato.
 */

export const dataService = {
  // --- PROFILI ---
  async getProfile(id: string): Promise<Profile | null> {
    const rs = await turso.execute({
      sql: "SELECT * FROM profiles WHERE id = ?",
      args: [id]
    });
    return rs.rows[0] as unknown as Profile || null;
  },

  async upsertProfile(profile: Profile): Promise<void> {
    await turso.execute({
      sql: `INSERT INTO profiles (id, email, full_name, mood_status, updated_at) 
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET 
              email = excluded.email,
              full_name = excluded.full_name,
              mood_status = excluded.mood_status,
              updated_at = excluded.updated_at`,
      args: [
        profile.id, 
        profile.email, 
        profile.full_name || null, 
        profile.mood_status || null, 
        profile.updated_at || new Date().toISOString()
      ]
    });
  },

  // --- PROGETTI ---
  async getProjects(userId: string | null, countryFilter?: string | null): Promise<Project[]> {
    // Inizializzazione automatica tabella documenti se non esiste
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS project_documents (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        file_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
    `).catch(() => {}); // Ignora se fallisce o esiste già

    let query = "SELECT * FROM projects WHERE 1=1";
    const args: any[] = [];
    // ... rest of the code remains same

    // Se userId è specificato, filtra per utente (opzionale, in base alla logica di business)
    // Se vogliamo vedere TUTTI i progetti nella dashboard, passiamo userId = null
    if (userId) {
       query += " AND user_id = ?";
       args.push(userId);
    }

    if (countryFilter === null) {
      query += " AND \"Country\" IS NULL";
    } else if (countryFilter) {
      query += " AND \"Country\" = ?";
      args.push(countryFilter);
    } else if (countryFilter === undefined) {
        // Se undefined (es. Dashboard Estero senza filtro specifico), prendiamo quelli NON NULL
        query += " AND \"Country\" IS NOT NULL";
    }

    query += " ORDER BY created_at DESC";

    const rs = await turso.execute({ sql: query, args });
    return rs.rows as unknown as Project[];
  },

  async saveProject(project: Project): Promise<void> {
    const runSave = async () => {
      await turso.execute({
        sql: `INSERT INTO projects (
                id, created_at, user_id, status, request_date, 
                client_name, agent_name, project_name, value, 
                notes, pdf_url, "Country", region
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT (id) DO UPDATE SET 
                status = excluded.status,
                request_date = excluded.request_date,
                client_name = excluded.client_name,
                agent_name = excluded.agent_name,
                project_name = excluded.project_name,
                value = excluded.value,
                notes = excluded.notes,
                pdf_url = excluded.pdf_url,
                "Country" = excluded."Country",
                region = excluded.region`,
        args: [
          project.id,
          project.created_at || new Date().toISOString(),
          project.user_id,
          project.status,
          project.request_date,
          project.client_name,
          project.agent_name,
          project.project_name,
          project.value,
          project.notes || null,
          project.pdf_url || null,
          project.Country || null,
          project.region || null
        ]
      });
    };

    try {
      await runSave();
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("no such column")) {
        if (msg.includes("region")) await turso.execute("ALTER TABLE projects ADD COLUMN region TEXT");
        if (msg.includes("Country")) await turso.execute("ALTER TABLE projects ADD COLUMN \"Country\" TEXT");
        await runSave();
      } else {
        throw err;
      }
    }
  },


  async deleteProject(id: string): Promise<void> {
    await turso.execute({
      sql: "DELETE FROM projects WHERE id = ?",
      args: [id]
    });
  },

  // --- DOCUMENTI (PDF su Turso) ---
  async saveDocument(projectId: string, fileName: string, mimeType: string, base64Data: string): Promise<string> {
    const id = crypto.randomUUID();
    await turso.execute({
      sql: `INSERT INTO project_documents (id, project_id, file_name, mime_type, file_data)
            VALUES (?, ?, ?, ?, ?)`,
      args: [id, projectId, fileName, mimeType, base64Data]
    });
    return id;
  },

  async getDocumentByProject(projectId: string): Promise<{ file_name: string, mime_type: string, file_data: string } | null> {
    const rs = await turso.execute({
      sql: "SELECT file_name, mime_type, file_data FROM project_documents WHERE project_id = ? ORDER BY created_at DESC LIMIT 1",
      args: [projectId]
    });
    if (rs.rows.length === 0) return null;
    return rs.rows[0] as unknown as { file_name: string, mime_type: string, file_data: string };
  }
};
