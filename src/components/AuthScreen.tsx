import { useState } from 'react'
import { Mail } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useAuth } from '../context/AuthProvider'

export function AuthScreen() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signInWithEmail(email)
      setStatus('sent')
    } catch (err) {
      setStatus('error')
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
              <CardTitle>Accedi con Magic Link</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Inserisci la tua email aziendale. Riceverai un link sicuro per accedere
            alla dashboard in tempo reale.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="nome.cognome@azienda.it"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Invio in corso...' : 'Invia Magic Link'}
            </Button>
            {status === 'sent' && (
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Email inviata! Controlla la posta e clicca sul link per entrare.
              </div>
            )}
            {status === 'error' && error && (
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

