import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { dataService } from '../lib/dataService'

interface AuthContextValue {
  authenticated: boolean
  username: string | null
  localUserId: string
  sessionUserId: string | null
  sessionUserEmail: string | null
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => void
}

const LS_AUTH = 'emu_auth_ok'
const LS_USERNAME = 'emu_user_name'
const LS_USER_ID = 'emu_user_id'
const REQUIRED_PASSWORD = 'emu2025'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getOrCreateLocalUserId() {
  const existing = localStorage.getItem(LS_USER_ID)
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem(LS_USER_ID, id)
  return id
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(localStorage.getItem(LS_AUTH) === '1')
  const [username, setUsername] = useState<string | null>(localStorage.getItem(LS_USERNAME))
  const [localUserId] = useState<string>(() => getOrCreateLocalUserId())
  
  // Per compatibilità, usiamo localUserId come sessionUserId dato che non abbiamo più un backend di auth esterno
  const sessionUserId = localUserId
  const sessionUserEmail = `${localUserId}@emu.local`

  const signIn = async (rawUsername: string, password: string) => {
    const nextUsername = rawUsername.trim()
    if (!nextUsername) throw new Error('Inserisci uno username.')
    if (password !== REQUIRED_PASSWORD) throw new Error('Password non corretta.')

    // Crea o aggiorna il profilo su Turso
    try {
      await dataService.upsertProfile({
        id: localUserId,
        full_name: nextUsername,
        email: sessionUserEmail,
        mood_status: null,
        updated_at: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Errore profilo:", err);
      // Non blocchiamo il login se Turso fallisce momentaneamente, l'utente può riprovare
    }

    // Login successful - update local state
    localStorage.setItem(LS_USERNAME, nextUsername)
    localStorage.setItem(LS_AUTH, '1')
    setUsername(nextUsername)
    setAuthenticated(true)
  }

  const signOut = async () => {
    localStorage.removeItem(LS_AUTH)
    localStorage.removeItem(LS_USERNAME)
    setAuthenticated(false)
    setUsername(null)
  }

  const value = useMemo(
    () => ({
      authenticated,
      username,
      localUserId,
      sessionUserId,
      sessionUserEmail,
      signIn,
      signOut,
    }),
    [authenticated, username, localUserId, sessionUserId, sessionUserEmail]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
