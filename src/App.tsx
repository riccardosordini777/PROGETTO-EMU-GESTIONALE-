import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createBrowserRouter,
  Link,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthProvider'
import { AuthScreen } from './components/AuthScreen'
import { DashboardItalia } from './pages/DashboardItalia'
import { DashboardEstero } from './pages/DashboardEstero'
import { cn } from './lib/utils'

const queryClient = new QueryClient()

function ProtectedLayout() {
  const { authenticated } = useAuth()

  if (!authenticated) {
    return <AuthScreen />
  }

  return (
    <div>
      <nav className="bg-slate-100">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-2">
          <NavLink to="/italia">🇮🇹 Italia</NavLink>
          <NavLink to="/estero">🌎 Estero</NavLink>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation()
  const isActive = location.pathname === to
  return (
    <Link
      to={to}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
        isActive ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-200'
      )}
    >
      {children}
    </Link>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/italia" replace />,
      },
      {
        path: 'italia',
        element: <DashboardItalia />,
      },
      {
        path: 'estero',
        element: <DashboardEstero />,
      },
    ],
  },
])

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default RootLayout