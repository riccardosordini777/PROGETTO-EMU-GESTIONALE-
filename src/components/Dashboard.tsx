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
  ArrowUpRight,
  FileText,
  Filter,
  LogOut,
  Plus,
  Search,
  Smile,
  UploadCloud,
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Avatar } from './ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Select } from './ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet'
import { Textarea } from './ui/textarea'
import { cn } from '../lib/utils'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthProvider'
import type { MoodStatus, Profile, Project } from '../types'

const MOODS: MoodStatus[] = ['🚀', '🎉', '☕', '🛑', '🙂']

const statusVariant: Record<string, 'success' | 'danger' | 'info' | 'warning'> = {
  Won: 'success',
  Lost: 'danger',
  Open: 'info',
  Negotiation: 'warning',
}

async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Project[]
}

async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Profile[]
}

export function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [agentFilter, setAgentFilter] = useState('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
  })

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
    return projects.filter((project) => {
      const matchSearch =
        project.client_name.toLowerCase().includes(search.toLowerCase()) ||
        project.project_name.toLowerCase().includes(search.toLowerCase())
      const matchAgent = agentFilter === 'all' || project.agent_name === agentFilter
      return matchSearch && matchAgent
    })
  }, [agentFilter, projects, search])

  const agents = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.agent_name)))
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
                {profile?.full_name ?? user?.email}
              </p>
              <p className="text-xs text-slate-500">Accesso protetto</p>
            </div>
            <Avatar name={profile?.full_name ?? user?.email ?? 'User'} />
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
              <VibeSelector />
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
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cerca cliente o progetto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <Select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}>
                  <option value="all">Tutti gli agenti</option>
                  {agents.map((agent) => (
                    <option key={agent} value={agent}>
                      {agent}
                    </option>
                  ))}
                </Select>
              </div>
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
        userId={user?.id ?? ''}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}
      />
    </div>
  )
}

function VibeSelector() {
  const { user, profile, refreshProfile } = useAuth()
  const queryClient = useQueryClient()
  const [updating, setUpdating] = useState(false)
  const mutation = useMutation({
    mutationFn: async (mood: MoodStatus) => {
      const { error } = await supabase
        .from('profiles')
        .update({ mood_status: mood, updated_at: new Date().toISOString() })
        .eq('id', user?.id)
      if (error) throw error
      return mood
    },
    onSuccess: async () => {
      await refreshProfile()
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
          const active = profile?.mood_status === mood
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

function KpiCard({
  title,
  value,
  description,
  suffix,
}: {
  title: string
  value: number
  description: string
  suffix?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {title}
          </p>
          <CardTitle className="text-3xl">
            {suffix ? (
              <span>
                {value} <span className="text-base text-slate-500">{suffix}</span>
              </span>
            ) : (
              `€ ${value.toLocaleString('it-IT')}`
            )}
          </CardTitle>
        </div>
        <ArrowUpRight className="h-5 w-5 text-slate-400" />
      </CardHeader>
      <CardContent className="text-sm text-slate-600">{description}</CardContent>
    </Card>
  )
}

interface ProjectSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  userId: string
  onSaved: () => void
}

function ProjectSheet({ open, onOpenChange, project, userId, onSaved }: ProjectSheetProps) {
  const isEditing = Boolean(project)
  const [form, setForm] = useState<Project>(
    project ?? {
      id: crypto.randomUUID(),
      user_id: userId,
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
        user_id: userId,
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
  }, [project, userId, open])

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const path = `${userId}/${Date.now()}-${file.name}`
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
      const payload = { ...form, user_id: userId }
      const { error } = await supabase.from('projects').upsert(payload)
      if (error) throw error
      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      alert('Errore durante il salvataggio del progetto')
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

