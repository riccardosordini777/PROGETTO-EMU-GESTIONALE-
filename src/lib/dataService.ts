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
    let query = "SELECT * FROM projects WHERE 1=1";
    const args: any[] = [];

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
    await turso.execute({
      sql: `INSERT INTO projects (
              id, created_at, user_id, status, request_date, 
              client_name, agent_name, project_name, value, 
              notes, pdf_url, \"Country\"
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET 
              status = excluded.status,
              request_date = excluded.request_date,
              client_name = excluded.client_name,
              agent_name = excluded.agent_name,
              project_name = excluded.project_name,
              value = excluded.value,
              notes = excluded.notes,
              pdf_url = excluded.pdf_url,
              \"Country\" = excluded.\"Country\"`,
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
        project.Country || null
      ]
    });
  },

  async deleteProject(id: string): Promise<void> {
    await turso.execute({
      sql: "DELETE FROM projects WHERE id = ?",
      args: [id]
    });
  }
};
