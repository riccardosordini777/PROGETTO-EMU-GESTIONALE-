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
    // Recupera i dati veri (ANTIGUA, COLLIER, ecc.)
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
      setErrorMsg('Password errata. Riprova.')
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

  // --- LOGIN (Il nuovo login che funziona e ha il logo) ---
  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          
          <div style={{ marginBottom: '2rem' }}>
             <img src="/emu.1.png" alt="EMU" style={{ height: '50px', display: 'block', margin: '0 auto' }} />
          </div>
          
          <h2 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Commercial Hub</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Area riservata agenti</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Nome Operatore</label>
              <input type="text" placeholder="Es. Riccardo" value={userName} onChange={(e) => setUserName(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} required />
            </div>
            
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '0.5rem' }}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }} required />
            </div>

            <button type="submit" disabled={loading} style={{ backgroundColor: '#003366', color: 'white', padding: '1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '1rem' }}>
              {loading ? 'Accesso...' : 'Accedi'}
            </button>
            {errorMsg && <p style={{ color: '#dc2626', fontSize: '0.9rem', marginTop: '0.5rem' }}>{errorMsg}</p>}
          </form>
        </div>
      </div>
    )
  }

  // --- DASHBOARD (La PRIMA versione: con la tabella dati VISIBILE) ---
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#ffffff', minHeight: '100vh' }}>
      
      {/* Navbar "Polo commerciale" */}
      <nav style={{ borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/emu.1.png" alt="EMU" style={{ height: '28px' }} />
          <span style={{ height: '24px', width: '1px', backgroundColor: '#e2e8f0' }}></span>
          <span style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>Polo commerciale</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ color: '#0f172a', fontWeight: '600' }}>{localStorage.getItem('emu_user_name')}</span>
          <button onClick={handleLogout} style={{ border: '1px solid #cbd5e1', background: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', color: '#475569' }}>Esci</button>
        </div>
      </nav>

      {/* Contenuto con TABELLA (Niente scritte "dati in corso") */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '300', color: '#0f172a', marginBottom: '2rem' }}>Ordini Recenti</h2>

        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Cliente</th>
                <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Collezione</th>
                <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Importo</th>
                <th style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Stato</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: '500', color: '#0f172a' }}>{order.client_name}</td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{order.product_line}</td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>€ {order.amount}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        backgroundColor: order.status === 'Confermato' ? '#dcfce7' : '#fef9c3', 
                        color: order.status === 'Confermato' ? '#166534' : '#854d0e',
                        padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' 
                      }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Nessun ordine trovato.</td>
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