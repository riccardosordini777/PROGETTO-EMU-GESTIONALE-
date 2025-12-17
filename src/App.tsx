import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'

function App() {
  const [session, setSession] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([]) // Qui salviamo i dati
  const [userName, setUserName] = useState('') 
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const SHARED_EMAIL = 'staff@emu.it'

  // Al caricamento, controlliamo sessione e carichiamo i dati
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        fetchOrders() // SE SIAMO DENTRO, CARICA I DATI SUBITO
      }
    })
  }, [])

  // Funzione per scaricare i dati dal database
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error('Errore caricamento:', error)
    else setOrders(data || [])
  }

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

  // --- LOGIN ---
  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <img src="/emu.1.png" alt="EMU" style={{ height: '50px', objectFit: 'contain', display: 'block', margin: '0 auto 2rem auto' }} />
          <h2 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 2rem 0' }}>Commercial Hub</h2>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input type="text" placeholder="Nome Operatore" value={userName} onChange={(e) => setUserName(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} required />
            <button type="submit" disabled={loading} style={{ backgroundColor: '#003366', color: 'white', padding: '1rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
              {loading ? 'Accesso...' : 'Entra'}
            </button>
            {errorMsg && <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>{errorMsg}</p>}
          </form>
        </div>
      </div>
    )
  }

  // --- DASHBOARD (Dati Veri + Logo in alto) ---
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* NAVBAR: Ora con LOGO */}
      <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* QUI C'È IL LOGO ANCHE DENTRO */}
          <img src="/emu.1.png" alt="EMU" style={{ height: '30px', objectFit: 'contain' }} />
          <span style={{ height: '20px', width: '1px', backgroundColor: '#e2e8f0' }}></span>
          <span style={{ color: '#64748b', fontWeight: '500' }}>Commercial Hub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ color: '#0f172a', fontWeight: '600' }}>{localStorage.getItem('emu_user_name')}</span>
          <button onClick={handleLogout} style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Esci</button>
        </div>
      </nav>

      {/* CONTENUTO DASHBOARD */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h2 style={{ color: '#0f172a', fontSize: '1.8rem', marginBottom: '2rem' }}>Ordini e Spedizioni</h2>
        
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {orders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              Nessun ordine trovato o caricamento in corso...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>CLIENTE</th>
                  <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>COLLEZIONE</th>
                  <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>IMPORTO</th>
                  <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>STATO</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#0f172a' }}>{order.client_name}</td>
                    <td style={{ padding: '1rem', color: '#334155' }}>{order.product_line}</td>
                    <td style={{ padding: '1rem', color: '#334155' }}>€ {order.amount}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.85rem', 
                        fontWeight: '500',
                        backgroundColor: order.status === 'Confermato' ? '#dcfce7' : order.status === 'Spedito' ? '#dbeafe' : '#fef9c3',
                        color: order.status === 'Confermato' ? '#166534' : order.status === 'Spedito' ? '#1e40af' : '#854d0e'
                      }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default App