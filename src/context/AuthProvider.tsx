import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'

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
        // IMPORTANT: Do not set authenticated here.
        // Authentication must happen through the signIn function to ensure
        // the user profile is created.
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

    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
      email: serviceEmail,
      password: servicePassword,
    })

    if (supabaseError) {
      console.error('Supabase sign-in error:', supabaseError)
      throw new Error("Errore interno durante l'autenticazione. Riprova.")
    }

    if (!data.user) {
      throw new Error('Autenticazione Supabase fallita: utente non trovato.')
    }

    // Ensure a profile exists for this user
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', localUserId)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking for profile:', selectError)
      throw new Error('Errore durante la verifica del profilo utente.')
    }
    
    if (!existingProfile) {
      // Profile does not exist, create it
      const { error: insertError } = await supabase.from('profiles').insert({
        id: localUserId,
        full_name: nextUsername,
        email: `${localUserId}@email.placeholder`,
      })

      if (insertError) {
        console.error('Error creating profile:', insertError)
        throw new Error('Errore durante la creazione del profilo utente.')
      }
    }

    // If Supabase login is successful, proceed with the "simple login" experience
    setSessionUserId(data.user.id)
    setSessionUserEmail(data.user.email ?? null)
    localStorage.setItem(LS_USERNAME, nextUsername)
    localStorage.setItem(LS_AUTH, '1')
    setUsername(nextUsername)
    setAuthenticated(true)
  }

  const signOut = async () => {
    // Also sign out from Supabase
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
