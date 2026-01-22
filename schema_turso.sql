-- SCHEMA OTTIMIZZATO PER TURSO (libSQL)
-- Progetto: gestionale-vendite
-- Validato contro la codebase React esistente

PRAGMA foreign_keys = ON;

-- 1. Tabella PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT NOT NULL PRIMARY KEY,              -- UUID generato dal client (crypto.randomUUID())
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  mood_status TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP  -- ISO8601
);

-- 2. Tabella PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id TEXT NOT NULL PRIMARY KEY,              -- UUID generato dal client
  created_at TEXT DEFAULT CURRENT_TIMESTAMP, -- ISO8601
  user_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Won', 'Lost', 'Open', 'Negotiation')),
  request_date TEXT,                         -- Formato YYYY-MM-DD
  client_name TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  value REAL DEFAULT 0,
  notes TEXT,
  pdf_url TEXT,
  "Country" TEXT,                            -- Case-sensitive per compatibilità codice
  CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles (id) ON DELETE CASCADE
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_country ON projects("Country");
