import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'

function App() {
  const [session, setSession] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([]) 
  const [userName, setUserName] = useState('') 
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const SHARED_EMAIL = 'staff@emu.it'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        fetchOrders()
      }
    })
  }, [])

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error('Errore:', error)
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
      setErrorMsg('Password non valida.')
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

  // --- LOGIN: Stile Pulito con Logo ---
  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <img src="/emu.1.png" alt="EMU" style={{ height: '45px', display: 'block', margin: '0 auto' }} />
          </div>
          <h2 style={{ color: '#003366', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Commercial Hub</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Accesso riservato</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Nome Operatore</label>
              <input type="text" placeholder="Es. Riccardo" value={userName} onChange={(e) => setUserName(e.target.value)} style={{ width: '100%', padding: '0.9rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} required />
            </div>
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.9rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} required />
            </div>
            <button type="submit" disabled={loading} style={{ backgroundColor: '#003366', color: 'white', padding: '1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '1rem' }}>
              {loading ? 'Verifica...' : 'Accedi'}
            </button>
            {errorMsg && <p style={{ color: '#dc2626', fontSize: '0.9rem', marginTop: '0.5rem' }}>{errorMsg}</p>}
          </form>
        </div>
      </div>
    )
  }

  // --- DASHBOARD: IL DESIGN ORIGINALE (Barra Blu) ---
  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Navbar Blu Scuro (#003366) con Logo Bianco - COME L'ORIGINALE */}
      <nav style={{ backgroundColor: '#003366', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Filtro per rendere il logo bianco su sfondo blu */}
          <img src="/emu.1.png" alt="EMU" style={{ height: '28px', filter: 'brightness(0) invert(1)' }} />
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ fontWeight: '500', letterSpacing: '0.5px' }}>COMMERCIAL HUB</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
            <span style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem' }}>{localStorage.getItem('emu_user_name')}</span>
            <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.8 }}>Operatore</span>
          </div>
          <button onClick={handleLogout} style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
            Esci
          </button>
        </div>
      </nav>

      {/* Contenuto Dashboard */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#003366', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Dashboard Vendite</h1>
          <p style={{ color: '#64748b' }}>Benvenuto nel pannello di controllo, {localStorage.getItem('emu_user_name')}.</p>
        </div>

        {/* Tabella Dati */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Cliente</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Collezione</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Importo</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Stato</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>{order.client_name}</td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{order.product_line}</td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>€ {order.amount}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                        backgroundColor: order.status === 'Confermato' ? '#dcfce7' : order.status === 'Spedito' ? '#dbeafe' : '#fef9c3',
                        color: order.status === 'Confermato' ? '#166534' : order.status === 'Spedito' ? '#1e40af' : '#854d0e'
                      }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Caricamento dati...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App