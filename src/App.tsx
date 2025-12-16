import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'

function App() {
  const [session, setSession] = useState<any>(null)
  const [userName, setUserName] = useState('') 
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const SHARED_EMAIL = 'staff@emu.it'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSession(session)
    })
  }, [])

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    // Tentativo di login
    const { error } = await supabase.auth.signInWithPassword({
      email: SHARED_EMAIL,
      password: password,
    })

    if (error) {
      setErrorMsg('Password non valida. Riprova.')
      setLoading(false)
    } else {
      localStorage.setItem('emu_user_name', userName)
      window.location.reload()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('emu_user_name')
    window.location.reload()
  }

  // --- SCHERMATA DI LOGIN (DESIGN UFFICIALE) ---
  if (!session) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#f1f5f9', // Colore sfondo professionale
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}>
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '3rem', 
          borderRadius: '16px', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
          width: '100%', 
          maxWidth: '420px',
          textAlign: 'center'
        }}>
          
          {/* LOGO EMU - Caricato dalla cartella public */}
          <div style={{ marginBottom: '2rem' }}>
            <img 
              src="/emu.1.png" 
              alt="EMU" 
              style={{ height: '50px', objectFit: 'contain', display: 'block', margin: '0 auto' }} 
              onError={(e) => {
                // Fallback nel caso l'immagine non venga trovata
                (e.target as HTMLImageElement).style.display = 'none';
                document.getElementById('logo-text')!.style.display = 'block';
              }}
            />
            <h1 id="logo-text" style={{ display: 'none', color: '#003366', fontSize: '2rem', margin: 0 }}>EMU</h1>
          </div>

          <h2 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', marginTop: 0 }}>Commercial Hub</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.95rem' }}>Area riservata agenti e rivenditori</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Nome Operatore</label>
              <input
                type="text"
                placeholder="Es. Riccardo S."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.875rem', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1', 
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                required
              />
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Password Accesso</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.875rem', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1', 
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{ 
                backgroundColor: '#003366', 
                color: 'white', 
                padding: '1rem', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600', 
                fontSize: '1rem',
                marginTop: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              {loading ? 'Accesso in corso...' : 'Entra nel Gestionale'}
            </button>
            
            {errorMsg && (
              <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', border: '1px solid #fecaca' }}>
                {errorMsg}
              </div>
            )}
          </form>
        </div>
      </div>
    )
  }

  // --- DASHBOARD (Dopo il Login) ---
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Logo scuro per la navbar bianca */}
          <h1 style={{ color: '#003366', margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>EMU</h1>
          <span style={{ color: '#cbd5e1', fontSize: '1.5rem' }}>|</span>
          <span style={{ color: '#64748b', fontWeight: '500' }}>Commercial Hub</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', color: '#0f172a', fontWeight: '600', fontSize: '0.9rem' }}>{localStorage.getItem('emu_user_name')}</span>
            <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem' }}>Operatore</span>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ 
              backgroundColor: '#f1f5f9', 
              color: '#334155', 
              border: '1px solid #cbd5e1', 
              padding: '0.5rem 1rem', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem'
            }}
          >
            Esci
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h2 style={{ color: '#0f172a', fontSize: '2rem', marginBottom: '1rem' }}>Dashboard Vendite</h2>
        <p style={{ color: '#64748b' }}>Benvenuto nel pannello di controllo.</p>
        
        {/* SPAZIO PER LE TABELLE (Antigua, Collier, ecc.) */}
        <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Caricamento dati in corso...</p>
        </div>
      </div>
    </div>
  )
}

export default App