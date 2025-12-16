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
      setErrorMsg('Password errata. Riprova.')
      setLoading(false)
    } else {
      localStorage.setItem('emu_user_name', userName)
      window.location.reload() // Ricarica per attivare la sessione
    }
  }

  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f4f4', fontFamily: 'Arial' }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px' }}>
          <h2 style={{ textAlign: 'center', color: '#003366' }}>EMU HUB</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Inserisci il tuo Nome"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '5px', border: '1px solid #ccc' }}
              required
            />
            <input
              type="password"
              placeholder="Password di accesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '5px', border: '1px solid #ccc' }}
              required
            />
            <button type="submit" disabled={loading} style={{ backgroundColor: '#003366', color: 'white', padding: '0.8rem', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              {loading ? 'Accesso...' : 'Entra'}
            </button>
            {errorMsg && <p style={{ color: 'red', textAlign: 'center' }}>{errorMsg}</p>}
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>EMU GESTIONALE</span>
        <span>Benvenuto, <strong>{localStorage.getItem('emu_user_name')}</strong></span>
      </nav>
      <h1>Dashboard Report</h1>
      <p>Accesso eseguito correttamente. Qui verranno visualizzati i dati dei rivenditori.</p>
      <button onClick={() => { supabase.auth.signOut(); localStorage.removeItem('emu_user_name'); window.location.reload(); }}>Esci</button>
    </div>
  )
}

export default App