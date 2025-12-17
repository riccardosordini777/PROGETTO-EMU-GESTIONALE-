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
      if (session) {
        setSession(session)
        const savedName = localStorage.getItem('emu_user_name')
        if (savedName) setUserName(savedName)
      }
    })
  }, [])

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    const { error } = await supabase.auth.signInWithPassword({
      email: SHARED_EMAIL,
      password: password,
    })

    if (error) {
      setErrorMsg('Credenziali non valide.')
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

  // --- LOGIN (Manteniamo quello che funziona) ---
  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          {/* Logo Login */}
          <div style={{ marginBottom: '2rem' }}>
             <img src="/emu.1.png" alt="EMU" style={{ height: '40px', display: 'block', margin: '0 auto' }} />
          </div>
          <h2 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>Commercial Hub</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Area riservata agenti e rivenditori</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Nome Operatore</label>
              <input type="text" placeholder="Es. Riccardo S." value={userName} onChange={(e) => setUserName(e.target.value)} style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} required />
            </div>
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Password Accesso</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} required />
            </div>
            <button type="submit" disabled={loading} style={{ backgroundColor: '#003366', color: 'white', padding: '1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', marginTop: '0.5rem' }}>
              {loading ? 'Accesso in corso...' : 'Entra nel Gestionale'}
            </button>
            {errorMsg && <p style={{ color: '#dc2626', fontSize: '0.9rem', marginTop: '0.5rem' }}>{errorMsg}</p>}
          </form>
        </div>
      </div>
    )
  }

  // --- DASHBOARD (ESATTAMENTE COME PRIMA - RESTORE) ---
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Navbar Minimalista Originale */}
      <nav style={{ borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ color: '#003366', margin: 0, fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-1px' }}>EMU</h1>
          <span style={{ height: '24px', width: '1px', backgroundColor: '#e2e8f0' }}></span>
          <span style={{ color: '#64748b', fontSize: '1rem' }}>Polo commerciale</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', color: '#0f172a', fontWeight: '600', fontSize: '0.9rem' }}>{localStorage.getItem('emu_user_name')}</span>
            <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem' }}>Operatore</span>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ 
              backgroundColor: 'white', 
              color: '#64748b', 
              border: '1px solid #e2e8f0', 
              padding: '0.5rem 1rem', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}
          >
            Esci
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h2 style={{ color: '#0f172a', fontSize: '2.5rem', fontWeight: '400', marginBottom: '0.5rem' }}>Dashboard Vendite</h2>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '3rem' }}>Benvenuto nel pannello di controllo.</p>
        
        {/* Il box bianco vuoto originale */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          border: '1px solid #e2e8f0', 
          padding: '4rem', 
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' 
        }}>
          <p style={{ color: '#cbd5e1', fontSize: '1.2rem' }}>Dati in corso...</p>
        </div>
      </div>
    </div>
  )
}

export default App