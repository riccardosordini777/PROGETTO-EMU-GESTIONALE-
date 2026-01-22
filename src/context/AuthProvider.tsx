import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
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
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [sessionUserEmail, setSessionUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionUserId(session.user.id)
        setSessionUserEmail(session.user.email ?? null)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSessionUserId(session.user.id)
        setSessionUserEmail(session.user.email ?? null)
      } else {
        setSessionUserId(null)
        setSessionUserEmail(null)
        setAuthenticated(false)
        localStorage.removeItem(LS_AUTH)
        localStorage.removeItem(LS_USERNAME)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (rawUsername: string, password: string) => {
    const nextUsername = rawUsername.trim()
    if (!nextUsername) throw new Error('Inserisci uno username.')
    if (password !== REQUIRED_PASSWORD) throw new Error('Password non corretta.')

    // "Behind the scenes" Supabase login with shared credentials
    const serviceEmail = import.meta.env.VITE_SERVICE_EMAIL
    const servicePassword = import.meta.env.VITE_SERVICE_PASSWORD

    if (!serviceEmail || !servicePassword) {
      throw new Error('Le credenziali di servizio non sono configurate nel file .env')
    }

    // Step 1: Supabase authentication
    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
      email: serviceEmail,
      password: servicePassword,
    })

    if (supabaseError) {
      throw new Error("Errore interno durante l'autenticazione. Riprova.")
    }

    if (!data.user) {
      throw new Error('Autenticazione Supabase fallita: utente non trovato.')
    }

    // Step 2: Create or update profile in Turso
    try {
      await dataService.upsertProfile({
        id: localUserId,
        full_name: nextUsername,
        email: `${localUserId}@emu.local`,
        mood_status: null,
        updated_at: new Date().toISOString()
      });
    } catch (err: any) {
      throw new Error(`Errore creazione/aggiornamento profilo su Turso: ${err.message}`);
    }

    // Step 3: Login successful - update local state
    setSessionUserId(data.user.id)
    setSessionUserEmail(data.user.email ?? null)
    localStorage.setItem(LS_USERNAME, nextUsername)
    localStorage.setItem(LS_AUTH, '1')
    setUsername(nextUsername)
    setAuthenticated(true)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem(LS_AUTH)
    localStorage.removeItem(LS_USERNAME)
    setAuthenticated(false)
    setUsername(null)
    setSessionUserId(null)
    setSessionUserEmail(null)
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