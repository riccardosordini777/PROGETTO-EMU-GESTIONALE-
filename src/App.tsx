import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthProvider'
import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'

const queryClient = new QueryClient()

function AppContent() {
  const { session, loading } = useAuth()

  // Il controllo delle variabili d'ambiente non è più necessario qui.
  // Se mancano, l'app si sarà già bloccata all'avvio grazie alla modifica in supabaseClient.ts.

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">
        <h1 className="text-lg font-semibold">Benvenuto</h1>
        <span className="ml-2 text-slate-500">App in caricamento...</span>
      </div>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  return <Dashboard />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
