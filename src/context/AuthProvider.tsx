import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { Profile } from '../types'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signInWithEmail: (email: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Funzione unificata per recuperare e creare il profilo
  const fetchAndSetProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // Il profilo non esiste, lo creiamo
      const { data: created, error: createError } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          email: currentUser.email ?? '',
          mood_status: '🙂',
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating profile', createError)
        setProfile(null) // Non siamo riusciti a creare il profilo
      } else {
        setProfile(created as Profile)
      }
    } else if (error) {
      console.error('Error fetching profile', error)
      setProfile(null)
    } else {
      setProfile(data as Profile)
    }
  }

  useEffect(() => {
    // 1. Controlla la sessione all'avvio
    const getInitialSession = async () => {
      try {
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          return;
        }

        setSession(initialSession)
        const currentUser = initialSession?.user ?? null
        setUser(currentUser)

        await fetchAndSetProfile(currentUser)

      } catch (err) {
        console.error('A critical error occurred during initial session retrieval:', err)
      } finally {
        setLoading(false)
      }
    }

    void getInitialSession()

    // 2. Ascolta i cambi di stato (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      const newUser = newSession?.user ?? null
      setUser(newUser)
      await fetchAndSetProfile(newUser)

      // Se l'evento è un login, il caricamento è finito.
      if (_event === 'SIGNED_IN') {
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    // Lo stato verrà aggiornato dal listener `onAuthStateChange`
  }

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchAndSetProfile(user)
    }
  }

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      signInWithEmail,
      signOut,
      refreshProfile,
    }),
    [session, user, profile, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
