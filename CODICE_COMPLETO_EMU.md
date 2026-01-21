# EMU GESTIONALE - CODEBASE EXPORT



# File: .env
```
VITE_SUPABASE_URL=https://obosxrxnkpbaefwyoghu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ib3N4cnhua3BiYWVmd3lvZ2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MzMyNTEsImV4cCI6MjA4MTQwOTI1MX0.n0hde7ESz1rnuOuTf_QWSe4G_zwKb7sDd6jIMAIxX5Y
VITE_SERVICE_EMAIL=riccardo.sordini777@gmail.com
VITE_SERVICE_PASSWORD=Riccardo21!
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/modifica-prog
```


# File: ANALISI_CODICE.md
```
# Analisi Tecnica e Piano di Miglioramento - EMU Commercial Hub

Questo documento riassume le aree di miglioramento identificate nel codebase del progetto. Le criticità sono state suddivise per priorità per guidare futuri interventi di refactoring.

Le criticità ad alta priorità identificate come bloccanti sono già state corrette.

## Panoramica delle Criticità da Affrontare

### 1. Collo di Bottiglia: Tutta la logica è sul Client (`Dashboard.tsx`)

*   **Criticità:** Alta
*   **Impatto:** Performance. L'applicazione è destinata a diventare estremamente lenta o inutilizzabile con l'aumento dei dati.
*   **Descrizione:** Attualmente, la dashboard scarica l'intero contenuto delle tabelle `projects` e `profiles` ed esegue tutte le operazioni (filtri, ricerche, aggregazioni KPI) nel browser.
*   **Soluzione Proposta:**
    1.  **Spostare i Calcoli sul Backend:** Creare funzioni RPC (Remote Procedure Call) in Supabase per calcolare i dati aggregati (es. `get_pipeline_value`, `count_projects_won`). Il frontend dovrà solo chiamare queste funzioni e mostrare il risultato.
    2.  **Filtrare e Paginare i Dati via API:** Le query per ottenere la lista di progetti devono includere filtri, ordinamento e paginazione (es. `supabase.from('projects').select('*').ilike('client_name', '%...%').range(0, 20)`). In questo modo il client riceve solo i dati che deve visualizzare.

### 2. Monolite: Il Componente `Dashboard.tsx` è Troppo Grande

*   **Criticità:** Media
*   **Impatto:** Manutenibilità.
*   **Descrizione:** Il file `Dashboard.tsx` contiene la logica per tutta la pagina, rendendolo difficile da leggere e modificare.
*   **Soluzione Proposta:** Estrarre le sezioni della dashboard in componenti più piccoli e dedicati, ognuno con la propria responsabilità e nel proprio file.
    *   `VibeCheck.tsx`
    *   `KpiGrid.tsx`
    *   `ProjectsChart.tsx`
    *   `ProjectsTable.tsx`
    *   `ProjectSheet.tsx`

### 3. Codice "Sporco" e Pratiche da Migliorare

*   **Criticità:** Bassa
*   **Impatto:** Qualità del codice, Manutenibilità.
*   **Descrizione:**
    *   **`console.log` residui:** Il codice contiene molte istruzioni di logging usate per il debug.
    *   **`alert()` per errori:** L'interfaccia utente usa `alert()` per notificare gli errori, un'esperienza utente datata e bloccante.
    *   **Canali Realtime Multipli:** Vengono usati più canali realtime dove ne basterebbe uno.
    *   **Controllo ridondante in `App.tsx`:** La verifica delle variabili d'ambiente in `App.tsx` è ridondante dopo la correzione in `supabaseClient.ts`.
*   **Soluzione Proposta:**
    *   Rimuovere sistematicamente i `console.log`.
    *   Sostituire `alert()` con un sistema di notifiche "toast" (es. `react-hot-toast`).
    *   Unificare le sottoscrizioni realtime in un unico canale.
    *   Rimuovere il codice di fallback da `App.tsx`.

```


# File: eslint.config.js
```
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])

```


# File: index.html
```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>progettoemugestionale</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```


# File: package.json
```
{
  "name": "emu-commercial-hub",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3000",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.48.0",
    "@tanstack/react-query": "^5.62.7",
    "@types/leaflet": "^1.9.21",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "framer-motion": "^11.15.0",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.469.0",
    "react": "^18.2.0",
    "react-country-flag": "^3.1.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.2.1",
    "react-router-dom": "^6.25.1",
    "react-simple-maps": "^3.0.0",
    "react-tooltip": "^5.30.0",
    "recharts": "^2.12.7",
    "tailwind-merge": "^2.5.5"
  },
  "devDependencies": {
    "@types/node": "^20.14.12",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@types/react-simple-maps": "^3.0.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.9",
    "globals": "^15.8.0",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.6",
    "typescript": "^5.5.4",
    "vite": "^5.3.5"
  }
}

```


# File: postcss.config.js
```
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}


```


# File: README.md
```
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

```


# File: tailwind.config.js
```
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#004488',
        muted: '#f5f7fb',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}


```


# File: tsconfig.app.json
```
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}

```


# File: tsconfig.json
```
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

```


# File: tsconfig.node.json
```
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}

```


# File: vite.config.ts
```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, // Impedisce a Vite di cambiare porta se la 3000 è occupata
  }
})
```


# File: src\App.css
```
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}

```


# File: src\App.tsx
```
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
```


# File: src\index.css
```
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  background-color: #f5f7fb;
  color: #0f172a;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fbff 0%, #eef3fa 100%);
}

#root {
  min-height: 100vh;
}

```


# File: src\main.tsx
```
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
} else {
  throw new Error("Root element with ID 'root' not found in the document.")
}
```


# File: src\types.ts
```
export type MoodStatus = '🚀' | '☕' | '🛑' | '🎉' | '🙂'

export interface Profile {
  id: string
  email: string
  full_name?: string | null
  mood_status?: MoodStatus | string | null
  updated_at?: string | null
}

export interface Project {
  id: string
  created_at?: string
  user_id: string
  status: 'Won' | 'Lost' | 'Open' | 'Negotiation' | string
  request_date: string
  client_name: string
  agent_name: string
  project_name: string
  value: number
  notes?: string | null
  pdf_url?: string | null
  Country?: string | null
}


```


# File: src\components\AuthScreen.tsx
```
import { useState } from 'react'
import { Lock, User } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useAuth } from '../context/AuthProvider'

export function AuthScreen() {
  const { signIn } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(username, password)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-white to-slate-50 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <img src="/emu.1.png" alt="EMU logo" className="h-10" />
            <div>
              <p className="text-sm uppercase tracking-[0.15em] text-primary font-semibold">
                EMU Commercial Hub
              </p>
              <CardTitle>Accedi</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Inserisci le tue credenziali per accedere alla dashboard.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  required
                  placeholder="Es. Riccardo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
            {error && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                Errore: {error}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


```


# File: src\components\KpiCard.tsx
```
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '../lib/utils'

export function KpiCard({
  title,
  value,
  description,
  suffix,
  isPlaceholder = false,
}: {
  title: string
  value: number
  description?: string
  suffix?: string
  isPlaceholder?: boolean
}) {
  return (
    <Card className={cn(isPlaceholder && 'bg-slate-50 border-dashed')}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {title}
          </p>
          <CardTitle className="text-3xl">
            {isPlaceholder ? (
              '...'
            ) : suffix ? (
              <span>
                {value} <span className="text-base text-slate-500">{suffix}</span>
              </span>
            ) : (
              `€ ${value.toLocaleString('it-IT')}`
            )}
          </CardTitle>
        </div>
        {!isPlaceholder && <ArrowUpRight className="h-5 w-5 text-slate-400" />}
      </CardHeader>
      {description && <CardContent className="text-sm text-slate-600">{description}</CardContent>}
    </Card>
  )
}

```


# File: src\components\ui\avatar.tsx
```
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name?: string
}

export function Avatar({ name, className, ...props }: AvatarProps) {
  const initial = name?.[0]?.toUpperCase() ?? 'U'
  return (
    <div
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary',
        className
      )}
      {...props}
    >
      {initial}
    </div>
  )
}


```


# File: src\components\ui\badge.tsx
```
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'success' | 'danger' | 'info' | 'warning'

const styles: Record<Variant, string> = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  danger: 'bg-rose-100 text-rose-700 border-rose-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
}

export function Badge({
  className,
  variant = 'info',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
        styles[variant],
        className
      )}
      {...props}
    />
  )
}


```


# File: src\components\ui\button.tsx
```
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
  outline:
    'border border-slate-300 text-slate-800 hover:bg-slate-50 transition-colors',
  ghost: 'text-slate-700 hover:bg-slate-100',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'


```


# File: src\components\ui\card.tsx
```
import { cn } from '../../lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn('p-5 pb-2', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return (
    <h3 className={cn('text-lg font-semibold text-slate-900', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn('px-5 pb-5 pt-2 text-sm text-slate-700', className)} {...props}>
      {children}
    </div>
  )
}


```


# File: src\components\ui\input.tsx
```
import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'


```


# File: src\components\ui\label.tsx
```
import type { LabelHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-sm font-semibold text-slate-700', className)} {...props} />
}


```


# File: src\components\ui\select.tsx
```
import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'


```


# File: src\components\ui\sheet.tsx
```
import { AnimatePresence, motion } from 'framer-motion'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function SheetHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-b border-slate-100 p-6', className)} {...props} />
  )
}

export function SheetTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-xl font-semibold text-slate-900', className)} {...props} />
  )
}

export function SheetDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('mt-1 text-sm text-slate-600', className)} {...props} />
  )
}

export function SheetContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('h-full overflow-y-auto p-6', className)} {...props} />
}


```


# File: src\components\ui\table.tsx
```
import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <table
        className={cn('w-full border-collapse text-sm text-slate-800', className)}
        {...props}
      />
    </div>
  )
}

export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-slate-50 text-xs font-semibold text-slate-600" {...props} />
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className="divide-y divide-slate-100" {...props} />
}

export function TableRow(props: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className="transition-colors hover:bg-primary/5 focus-within:bg-primary/5 cursor-pointer"
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('px-4 py-3 text-left', className)} {...props} />
}

export function TableCell(props: HTMLAttributes<HTMLTableCellElement>) {
  return <td className="px-4 py-3 align-middle text-sm text-slate-800" {...props} />
}


```


# File: src\components\ui\textarea.tsx
```
import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'


```


# File: src\context\AuthProvider.tsx
```
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

    // Explicitly check if profile exists, then insert if it doesn't
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', localUserId)
      .single()

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means row not found, which is fine
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
```


# File: src\lib\supabaseClient.ts
```
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// DEBUG: Log the URL to verify it's loaded correctly
console.log('Attempting to connect to Supabase with URL:', supabaseUrl)

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase credentials are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)
```


# File: src\lib\utils.ts
```
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const countryNormalizationMap: { [key: string]: string } = {
  'francia': 'France', 'france': 'France',
  'germany': 'Germany', 'germania': 'Germany',
  'italia': 'Italy', 'italy': 'Italy',
  'spagna': 'Spain', 'spain': 'Spain',
  'united kingdom': 'United Kingdom', 'regno unito': 'United Kingdom',
  'united states': 'United States', 'stati uniti': 'United States', 'usa': 'United States',
  'canada': 'Canada',
  'mexico': 'Mexico',
  'brazil': 'Brazil', 'brasile': 'Brazil',
  'argentina': 'Argentina',
  'australia': 'Australia',
  'japan': 'Japan', 'giappone': 'Japan',
  'china': 'China',
  'india': 'India',
  // Add more mappings for common variations and translations as needed
};

export function normalizeCountryName(inputName: string): string {
  if (!inputName) return '';
  const lowerInput = inputName.toLowerCase();
  return countryNormalizationMap[lowerInput] || inputName; // Return normalized name or original if not found
}


// This is an innocuous comment to force a new build.
export function getCountryCode(countryName: string): string | undefined {
  if (!countryName) return undefined;
  
  const normalizedName = normalizeCountryName(countryName); // Use the new normalization function

  const countryCodeMap: { [key: string]: string } = {
    'France': 'FR', 'Germany': 'DE', 'Italy': 'IT', 'Spain': 'ES', 'United Kingdom': 'GB', 
    'United States': 'US', 'Canada': 'CA', 'Mexico': 'MX', 'Brazil': 'BR', 'Argentina': 'AR', 
    'Australia': 'AU', 'Japan': 'JP', 'China': 'CN', 'India': 'IN',
  };

  return countryCodeMap[normalizedName]; // Lookup using the normalized name
}

```


# File: src\pages\DashboardEstero.tsx
```
import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Globe,
  LogOut,
  Plus,
  FileText,
  UploadCloud,
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import ReactCountryFlag from 'react-country-flag'
import { scaleLinear } from 'd3-scale'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'
import { Tooltip as ReactTooltip } from 'react-tooltip'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { Avatar } from '../components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Select } from '../components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../components/ui/sheet'
import { Textarea } from '../components/ui/textarea'
import { getCountryCode, normalizeCountryName } from '../lib/utils'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthProvider'
import type { Project } from '../types'
import { KpiCard } from '../components/KpiCard'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const statusVariant: Record<string, 'success' | 'danger' | 'info' | 'warning'> = {
  Won: 'success',
  Lost: 'danger',
  Open: 'info',
  Negotiation: 'warning',
}

async function fetchEsteroProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .not('Country', 'is', null)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('fetchEsteroProjects error', error)
    throw error
  }
  return (data ?? []) as Project[]
}

export function DashboardEstero() {
  const { username, sessionUserId, localUserId, signOut } = useAuth()
  const queryClient = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [tooltipContent, setTooltipContent] = useState('')
  const [position, setPosition] = useState<{ coordinates: [number, number]; zoom: number }>(() => ({ coordinates: [0, 0], zoom: 1 }));
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projectsEstero'],
    queryFn: fetchEsteroProjects,
  })
  
  const selectedCountryData = useMemo(() => {
    if (!selectedCountry || !projects) return null;
    const countryProjects = projects.filter(p => normalizeCountryName(p.Country || '') === selectedCountry);
    const totalValue = countryProjects.reduce((acc, p) => acc + Number(p.value || 0), 0);
    return {
      name: selectedCountry,
      totalValue: totalValue,
      projectCount: countryProjects.length
    };
  }, [selectedCountry, projects]);

  useEffect(() => {
    const channel = supabase
      .channel('projects-channel-estero')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => queryClient.invalidateQueries({ queryKey: ['projectsEstero'] })
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  const projectsByCountry = useMemo(() => {
    return projects.reduce((acc, p) => {
      if (p.Country) {
        const normalizedCountryName = normalizeCountryName(p.Country);
        acc[normalizedCountryName] = (acc[normalizedCountryName] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });
  }, [projects]);
  
  const colorScale = useMemo(() => {
    const projectCounts = Object.values(projectsByCountry);
    if (projectCounts.length === 0) {
      return () => '#D9D9D9';
    }
    const maxProjects = Math.max(...projectCounts, 1);
    
    return scaleLinear<string>()
      .domain([1, maxProjects])
      .range(["#4A90E2", "#003366"]);
  }, [projectsByCountry]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchCountry = !selectedCountry || normalizeCountryName(project.Country || '') === selectedCountry;
      return matchCountry
    })
  }, [projects, selectedCountry])
  
  const pipelineValue = projects
    .filter((p) => p.status === 'Open' || p.status === 'Negotiation')
    .reduce((acc, p) => acc + (Number(p.value) || 0), 0)

  const now = new Date()
  const projectsWonThisMonth = useMemo(() => {
    return projects.filter((p) => {
      if (p.status !== 'Won' || !p.created_at) return false
      const created = new Date(p.created_at)
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length
  }, [projects, now])

  const activeCount = useMemo(() => {
    return projects.filter((p) => p.status !== 'Lost').length
  }, [projects])

  const topCountry = useMemo(() => {
    if (!projects || projects.length === 0) {
      return { name: 'N/A', value: 0 };
    }
    const valueByCountry = projects.reduce((acc, p) => {
      if (p.Country) {
        const normalizedCountryName = normalizeCountryName(p.Country);
        acc[normalizedCountryName] = (acc[normalizedCountryName] || 0) + Number(p.value || 0);
      }
      return acc;
    }, {} as { [key: string]: number });

    const top = Object.entries(valueByCountry).sort(([, a], [, b]) => b - a)[0];
    return top ? { name: top[0], value: top[1] } : { name: 'N/A', value: 0 };
  }, [projects]);

  const handleRowClick = (project: Project) => {
    setEditing(project)
    setSheetOpen(true)
  }

  const handleNewProject = () => {
    setEditing(null)
    setSheetOpen(true)
  }

  function handleZoomIn() {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 2 }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 2 }));
  }

  function handleMoveEnd(position: { coordinates: [number, number]; zoom: number }) {
    setPosition(position);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/emu.1.png" alt="EMU" className="h-10" />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
                EMU Foreign Hub
              </p>
              <p className="text-sm text-slate-600">Control room progetti internazionali</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {username ?? 'Operatore'}
              </p>
              <p className="text-xs text-slate-500">Accesso protetto</p>
            </div>
            <Avatar name={username ?? 'User'} />
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-primary font-semibold">
              <Globe className="h-4 w-4" />
              Mappa Progetti
            </div>
            <CardTitle className="text-2xl">Distribuzione Globale</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden rounded-b-lg">
            <div className="relative w-full" style={{ paddingTop: '56.25%', backgroundColor: '#E6EEF5' }}>
              <ReactTooltip id="map-tooltip" />
              <ComposableMap
                projectionConfig={{
                  rotate: [-10, 0, 0],
                  scale: 147,
                }}
                data-tooltip-id="map-tooltip"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              >
                <ZoomableGroup zoom={position.zoom} center={position.coordinates} onMoveEnd={handleMoveEnd}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies
                        .filter(geo => geo.properties.name !== "Antarctica")
                        .map((geo) => {
                          const countryName = normalizeCountryName(geo.properties.name);
                          const projectCount = projectsByCountry[countryName] || 0;
                          const fillColor = projectCount > 0 ? colorScale(projectCount) : '#D9D9D9';
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              onMouseEnter={() => {
                                setTooltipContent(`${countryName}: ${projectCount} progetti`);
                              }}
                              onMouseLeave={() => {
                                setTooltipContent('');
                              }}
                              onClick={() => {
                                setSelectedCountry(countryName === selectedCountry ? null : countryName);
                              }}
                              style={{
                                default: {
                                  fill: fillColor,
                                  stroke: '#ffffff',
                                  strokeWidth: 0.5,
                                  outline: 'none',
                                },
                                hover: {
                                  fill: '#F5A623',
                                  stroke: '#ffffff',
                                  strokeWidth: 0.75,
                                  outline: 'none',
                                },
                                pressed: {
                                  fill: '#F5A623',
                                  stroke: '#ffffff',
                                  strokeWidth: 0.75,
                                  outline: 'none',
                                },
                              }}
                              data-tooltip-content={tooltipContent}
                            />
                          );
                        })}
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>

              {selectedCountryData && (
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg transition-all z-30">
                  <h3 className="font-bold text-lg">{selectedCountryData.name}</h3>
                  <p className="text-sm">Fatturato Totale: € {selectedCountryData.totalValue.toLocaleString('it-IT')}</p>
                  <p className="text-sm">N. Progetti: {selectedCountryData.projectCount}</p>
                </div>
              )}

              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <Button onClick={handleZoomIn} size="sm" className="h-8 w-8">
                  +
                </Button>
                <Button onClick={handleZoomOut} size="sm" className="h-8 w-8">
                  -
                </Button>
                {selectedCountry && (
                  <Button onClick={() => setSelectedCountry(null)} size="sm" variant="outline" className="mt-2 text-xs">
                    Reset Filter
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Total Pipeline" value={pipelineValue} description="Open + Negotiation" />
            <KpiCard title={`Top Country: ${topCountry.name}`} value={topCountry.value} description="Highest value country" />
            <KpiCard title="Projects Won (mese)" value={projectsWonThisMonth} description="Successi recenti" suffix="progetti" />
            <KpiCard title="Progetti Attivi" value={activeCount} description="Non persi" suffix="attivi" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Projects Grid
                </p>
                <CardTitle className="text-2xl">Pipeline progetti internazionali</CardTitle>
              </div>
              <Button onClick={handleNewProject}>
                <Plus className="h-4 w-4" />
                Nuovo progetto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <p className="text-sm text-slate-500">Caricamento progetti...</p>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Paese</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Value (€)</TableHead>
                    <TableHead>PDF</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => {
                    const countryCode = getCountryCode(project.Country || '');
                    return (
                      <TableRow key={project.id} onClick={() => handleRowClick(project)}>
                        <TableCell>
                          {countryCode ? (
                            <span className="flex items-center gap-2">
                              <ReactCountryFlag countryCode={countryCode} svg />
                              {project.Country}
                            </span>
                          ) : (
                            project.Country || 'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[project.status] ?? 'info'}>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {project.request_date
                            ? format(new Date(project.request_date), 'dd MMM yyyy', { locale: it })
                            : '—'}
                        </TableCell>
                        <TableCell>{project.client_name}</TableCell>
                        <TableCell>{project.agent_name}</TableCell>
                        <TableCell>{project.project_name}</TableCell>
                        <TableCell className="font-semibold">
                          € {Number(project.value ?? 0).toLocaleString('it-IT')}
                        </TableCell>
                        <TableCell>
                          {project.pdf_url ? (
                            <a
                              href={project.pdf_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FileText className="h-5 w-5" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <ProjectSheetEstero
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        project={editing}
        sessionUserId={sessionUserId}
        localUserId={localUserId}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['projectsEstero'] })}
      />
    </div>
  )
}

function ProjectSheetEstero({
  open,
  onOpenChange,
  project,
  sessionUserId,
  localUserId,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  sessionUserId: string | null
  localUserId: string
  onSaved: () => void
}) {
  const isEditing = Boolean(project)
  const [form, setForm] = useState<Project>(
    project ?? {
      id: crypto.randomUUID(),
      user_id: localUserId ?? '',
      status: 'Open',
      request_date: new Date().toISOString().slice(0, 10),
      client_name: '',
      agent_name: '',
      project_name: '',
      value: 0,
      notes: '',
      pdf_url: '',
      Country: '',
    }
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (project) {
      setForm(project)
    } else {
      setForm({
        id: crypto.randomUUID(),
        user_id: localUserId ?? '',
        status: 'Open',
        request_date: new Date().toISOString().slice(0, 10),
        client_name: '',
        agent_name: '',
        project_name: '',
        value: 0,
        notes: '',
        pdf_url: '',
        Country: '',
      })
    }
  }, [project, localUserId, open])

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      if (!sessionUserId) throw new Error('User not authenticated for upload.')
      const path = `${sessionUserId}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('project-pdfs').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('project-pdfs').getPublicUrl(path)
      setForm((prev) => ({ ...prev, pdf_url: data.publicUrl }))
    } catch (err) {
      console.error(err)
      alert('Errore nel caricamento PDF')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (!localUserId) throw new Error('User not authenticated for saving.')
      const payload = { ...form, user_id: localUserId }
      const { error } = await supabase.from('projects').upsert(payload)
      if (error) {
        throw error
      }

      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error('Supabase upsert error:', err)
      const e = err as { message?: string; details?: string; hint?: string; code?: string }
      alert(
        [
          'Errore durante il salvataggio del progetto. Controlla la console per i dettagli.',
          `Message: ${e.message ?? 'N/A'}`,
          `Details: ${e.details ?? 'N/A'}`,
        ]
          .filter(Boolean)
          .join('\n')
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full max-w-2xl">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Modifica progetto' : 'Nuovo progetto'}</SheetTitle>
          <SheetDescription>
            Aggiorna lo stato, allega PDF e aggiungi note operative per l&apos;automazione.
          </SheetDescription>
        </SheetHeader>
        <form className="space-y-4 py-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option>Open</option>
                <option>Negotiation</option>
                <option>Won</option>
                <option>Lost</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Request Date</Label>
              <Input
                type="date"
                value={form.request_date?.slice(0, 10)}
                onChange={(e) => setForm((p) => ({ ...p, request_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input
                value={form.client_name}
                onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Agent Name</Label>
              <Input
                value={form.agent_name}
                onChange={(e) => setForm((p) => ({ ...p, agent_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                value={form.project_name}
                onChange={(e) => setForm((p) => ({ ...p, project_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Value (€)</Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => setForm((p) => ({ ...p, value: Number(e.target.value) }))}
                min={0}
                step="1000"
              />
            </div>
            <div className="space-y-2">
              <Label>Paese</Label>
              <Input
                value={form.Country ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, Country: e.target.value }))}
                placeholder="es. Francia"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Project Notes</Label>
            <Textarea
              rows={4}
              value={form.notes ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Aggiornamenti chiave per automazioni / team"
            />
          </div>
          <div className="space-y-2">
            <Label>PDF Attachment</Label>
            <div className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Trascina e rilascia oppure scegli file</p>
                  <p className="text-xs text-slate-500">PDF automaticamente salvato in Supabase</p>
                </div>
              </div>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload(file)
                }}
                disabled={uploading}
              />
              {form.pdf_url && (
                <a href={form.pdf_url} target="_blank" rel="noreferrer" className="text-primary">
                  File caricato (clicca per aprire)
                </a>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? 'Salvataggio...' : 'Salva progetto'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

```


# File: src\pages\DashboardItalia.tsx
```
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  FileText,
  LogOut,
  Plus,
  Smile,
  UploadCloud,
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { Avatar } from '../components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Select } from '../components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../components/ui/sheet'
import { Textarea } from '../components/ui/textarea'
import { cn } from '../lib/utils'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthProvider'
import type { MoodStatus, Profile, Project } from '../types'
import { KpiCard } from '../components/KpiCard'

const MOODS: MoodStatus[] = ['🚀', '🎉', '☕', '🛑', '🙂']

const statusVariant: Record<string, 'success' | 'danger' | 'info' | 'warning'> = {
  Won: 'success',
  Lost: 'danger',
  Open: 'info',
  Negotiation: 'warning',
}

async function fetchItaliaProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('Country', null)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('fetchItaliaProjects error', error)
    throw error
  }
  return (data ?? []) as Project[]
}

async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) {
    console.error('fetchProfiles error', error)
    throw error
  }
  return (data ?? []) as Profile[]
}

export function DashboardItalia() {
  const { username, sessionUserId, localUserId, signOut } = useAuth()
  const queryClient = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchItaliaProjects,
  })

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
  })

  const myMood = useMemo(() => {
    return profiles.find((p) => p.id === localUserId)?.mood_status ?? null
  }, [profiles, localUserId])

  useEffect(() => {
    const channel = supabase
      .channel('projects-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => queryClient.invalidateQueries({ queryKey: ['projects'] })
      )
      .subscribe()

    const profileChannel = supabase
      .channel('profiles-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => queryClient.invalidateQueries({ queryKey: ['profiles'] })
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(profileChannel)
    }
  }, [queryClient])

  const filteredProjects = useMemo(() => {
    return projects.filter(() => {
      // For now, no specific filtering beyond initial fetch for Italia
      return true
    })
  }, [projects])

  const pipelineValue = projects
    .filter((p) => p.status === 'Open' || p.status === 'Negotiation')
    .reduce((acc, p) => acc + (Number(p.value) || 0), 0)

  const now = new Date()
  const projectsWonThisMonth = projects.filter((p) => {
    if (p.status !== 'Won' || !p.created_at) return false
    const created = new Date(p.created_at)
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
  }).length

  const activeCount = projects.filter((p) => p.status !== 'Lost').length

  const chartData = useMemo(() => {
    const byAgent: Record<string, number> = {}
    projects.forEach((p) => {
      byAgent[p.agent_name] = (byAgent[p.agent_name] ?? 0) + Number(p.value || 0)
    })
    return Object.entries(byAgent).map(([agent, value]) => ({ agent, value }))
  }, [projects])

  const handleRowClick = (project: Project) => {
    setEditing(project)
    setSheetOpen(true)
  }

  const handleNewProject = () => {
    setEditing(null)
    setSheetOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/emu.1.png" alt="EMU" className="h-10" />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
                EMU Commercial Hub
              </p>
              <p className="text-sm text-slate-600">Control room progetti commerciali</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {username ?? 'Operatore'}
              </p>
              <p className="text-xs text-slate-500">Accesso protetto</p>
            </div>
            <Avatar name={username ?? 'User'} />
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                <Smile className="h-4 w-4" />
                Vibe Check Team (live)
              </div>
              <CardTitle className="text-2xl">Come si sente il team oggi?</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <VibeSelector activeMood={myMood} />
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {profilesLoading && <p className="text-sm text-slate-500">Aggiornamento...</p>}
                {!profilesLoading &&
                  profiles.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      <Avatar name={member.full_name ?? member.email} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {member.full_name ?? member.email}
                        </p>
                        <p className="text-xs text-slate-500">
                          Ultimo update{' '}
                          {member.updated_at
                            ? format(new Date(member.updated_at), 'dd MMM HH:mm', { locale: it })
                            : '—'}
                        </p>
                      </div>
                      <span className="text-xl">{member.mood_status ?? '🙂'}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <KpiCard
              title="Total Pipeline Value"
              value={pipelineValue}
              description="Open + Negotiation"
            />
            <KpiCard
              title="Projects Won (mese)"
              value={projectsWonThisMonth}
              description="Successi recenti"
              suffix="progetti"
            />
            <KpiCard
              title="Progetti Attivi"
              value={activeCount}
              description="Non persi"
              suffix="attivi"
            />
          </div>
        </div>

        <Card>
          <CardHeader className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.18em]">
                KPI Commerciali
              </p>
              <CardTitle className="text-2xl">Value by Agent</CardTitle>
              <p className="text-sm text-slate-600">
                Distribuzione economica per agente (aggiornamento in tempo reale).
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries()}>
              Aggiorna
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="agent" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                    formatter={(value: number) => [`€ ${value.toLocaleString()}`, 'Valore']}
                  />
                  <Bar dataKey="value" fill="#004488" radius={[8, 8, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Projects Grid
                </p>
                <CardTitle className="text-2xl">Pipeline progetti</CardTitle>
              </div>
              <Button onClick={handleNewProject}>
                <Plus className="h-4 w-4" />
                Nuovo progetto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <p className="text-sm text-slate-500">Caricamento progetti...</p>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Value (€)</TableHead>
                    <TableHead>PDF</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id} onClick={() => handleRowClick(project)}>
                      <TableCell>
                        <Badge variant={statusVariant[project.status] ?? 'info'}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {project.request_date
                          ? format(new Date(project.request_date), 'dd MMM yyyy', { locale: it })
                          : '—'}
                      </TableCell>
                      <TableCell>{project.client_name}</TableCell>
                      <TableCell>{project.agent_name}</TableCell>
                      <TableCell>{project.project_name}</TableCell>
                      <TableCell className="font-semibold">
                        € {Number(project.value ?? 0).toLocaleString('it-IT')}
                      </TableCell>
                      <TableCell>
                        {project.pdf_url ? (
                          <a
                            href={project.pdf_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="h-5 w-5" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <ProjectSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        project={editing}
        sessionUserId={sessionUserId}
        localUserId={localUserId}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}
      />
    </div>
  )
}

function VibeSelector({ activeMood }: { activeMood: MoodStatus | string | null }) {
  const { username, localUserId } = useAuth()
  const queryClient = useQueryClient()
  const [updating, setUpdating] = useState(false)
  const mutation = useMutation({
    mutationFn: async (mood: MoodStatus) => {
      if (!localUserId) throw new Error('User not authenticated')
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: localUserId,
          full_name: username ?? 'Operatore',
          email: `${localUserId}@email.placeholder`, // Ensure email is not null
          mood_status: mood,
          updated_at: new Date().toISOString(),
        })
      if (error) throw error
      return mood
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
    onSettled: () => setUpdating(false),
  })

  const handleMood = (mood: MoodStatus) => {
    setUpdating(true)
    mutation.mutate(mood)
  }

  return (
    <div className="rounded-xl bg-primary/5 p-4">
      <p className="text-sm font-semibold text-slate-800">Seleziona il tuo mood</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {MOODS.map((mood) => {
          const active = activeMood === mood
          return (
            <button
              key={mood}
              onClick={() => handleMood(mood)}
              disabled={updating}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition-all',
                active
                  ? 'border-primary bg-primary/10 shadow-md shadow-primary/10'
                  : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow'
              )}
            >
              {mood}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface ProjectSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  sessionUserId: string | null
  localUserId: string
  onSaved: () => void
}

function ProjectSheet({
  open,
  onOpenChange,
  project,
  sessionUserId,
  localUserId,
  onSaved,
}: ProjectSheetProps) {
  const isEditing = Boolean(project)
  const [form, setForm] = useState<Project>(
    project ?? {
      id: crypto.randomUUID(),
      user_id: localUserId ?? '',
      status: 'Open',
      request_date: new Date().toISOString().slice(0, 10),
      client_name: '',
      agent_name: '',
      project_name: '',
      value: 0,
      notes: '',
      pdf_url: '',
    }
  )
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (project) {
      setForm(project)
    } else {
      setForm({
        id: crypto.randomUUID(),
        user_id: localUserId ?? '',
        status: 'Open',
        request_date: new Date().toISOString().slice(0, 10),
        client_name: '',
        agent_name: '',
        project_name: '',
        value: 0,
        notes: '',
        pdf_url: '',
      })
    }
  }, [project, localUserId, open])

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      if (!sessionUserId) throw new Error('User not authenticated for upload.')
      const path = `${sessionUserId}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('project-pdfs').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('project-pdfs').getPublicUrl(path)
      setForm((prev) => ({ ...prev, pdf_url: data.publicUrl }))
    } catch (err) {
      console.error(err)
      alert('Errore nel caricamento PDF')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (!localUserId) throw new Error('User not authenticated for saving.')
      const payload = { ...form, user_id: localUserId }
      const { error } = await supabase.from('projects').upsert(payload)
      if (error) throw error
      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      const e = err as { message?: string; details?: string; hint?: string; code?: string }
      alert(
        [
          'Errore durante il salvataggio del progetto',
          e.code ? `code: ${e.code}` : null,
          e.message ? `message: ${e.message}` : null,
          e.details ? `details: ${e.details}` : null,
          e.hint ? `hint: ${e.hint}` : null,
        ]
          .filter(Boolean)
          .join('\n')
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetHeader>
        <SheetTitle>{isEditing ? 'Modifica progetto' : 'Nuovo progetto'}</SheetTitle>
        <SheetDescription>
          Aggiorna lo stato, allega PDF e aggiungi note operative per l&apos;automazione.
        </SheetDescription>
      </SheetHeader>
      <SheetContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option>Open</option>
                <option>Negotiation</option>
                <option>Won</option>
                <option>Lost</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Request Date</Label>
              <Input
                type="date"
                value={form.request_date?.slice(0, 10)}
                onChange={(e) => setForm((p) => ({ ...p, request_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input
                value={form.client_name}
                onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Agent Name</Label>
              <Input
                value={form.agent_name}
                onChange={(e) => setForm((p) => ({ ...p, agent_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                value={form.project_name}
                onChange={(e) => setForm((p) => ({ ...p, project_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Value (€)</Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => setForm((p) => ({ ...p, value: Number(e.target.value) }))}
                min={0}
                step="1000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Project Notes</Label>
            <Textarea
              rows={4}
              value={form.notes ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Aggiornamenti chiave per automazioni / team"
            />
          </div>
          <div className="space-y-2">
            <Label>PDF Attachment</Label>
            <div className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Trascina e rilascia oppure scegli file</p>
                  <p className="text-xs text-slate-500">PDF automaticamente salvato in Supabase</p>
                </div>
              </div>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload(file)
                }}
                disabled={uploading}
              />
              {form.pdf_url && (
                <a href={form.pdf_url} target="_blank" rel="noreferrer" className="text-primary">
                  File caricato (clicca per aprire)
                </a>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? 'Salvataggio...' : 'Salva progetto'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
```
