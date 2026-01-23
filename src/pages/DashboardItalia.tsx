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
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  FileText,
  LogOut,
  Plus,
  Smile,
  UploadCloud,
  Map as MapIcon,
  X,
  MapPin
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
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
import { cn } from '../lib/utils'
import { supabase } from '../lib/supabaseClient'
import { dataService } from '../lib/dataService'
import { useAuth } from '../context/AuthProvider'
import type { MoodStatus, Profile, Project } from '../types'
import { KpiCard } from '../components/KpiCard'

// GeoJSON delle Regioni Italiane (Fonte: openpolis/geojson-italy)
const geoUrlItalia = 'https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson';

const MOODS: MoodStatus[] = ['🚀', '🎉', '☕', '🛑', '🙂']
const ITALIAN_REGIONS = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 
  'Friuli Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche', 
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana', 
  'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'
];

const statusVariant: Record<string, 'success' | 'danger' | 'info' | 'warning'> = {
  Won: 'success',
  Lost: 'danger',
  Open: 'info',
  Negotiation: 'warning',
}

async function fetchItaliaProjects(): Promise<Project[]> {
  return dataService.getProjects(null, null);
}

async function fetchProfiles(): Promise<Profile[]> {
  const { turso } = await import('../lib/tursoClient');
  const result = await turso.execute("SELECT * FROM profiles ORDER BY updated_at DESC");
  return result.rows as unknown as Profile[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
}

export function DashboardItalia() {
  const { username, sessionUserId, localUserId, signOut } = useAuth()
  const queryClient = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [vibeModalOpen, setVibeModalOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  
  // Stati Mappa
  const [tooltipContent, setTooltipContent] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

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
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient])

  // --- LOGICA MAPPA ITALIA ---
  const projectsByRegion = useMemo(() => {
    return projects.reduce((acc, p) => {
      if (p.region) {
        // Normalizzazione base se necessario, ma assumiamo input da select
        const reg = p.region; 
        acc[reg] = (acc[reg] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });
  }, [projects]);

  const colorScale = useMemo(() => {
    const counts = Object.values(projectsByRegion);
    if (counts.length === 0) return () => '#E2E8F0';
    const max = Math.max(...counts, 1);
    
    return scaleLinear<string>()
      .domain([1, max])
      .range(["#93C5FD", "#1E40AF"]); // Light Blue to Deep Blue
  }, [projectsByRegion]);

  const selectedRegionData = useMemo(() => {
    if (!selectedRegion || !projects) return null;
    const regionProjects = projects.filter(p => p.region === selectedRegion);
    const totalValue = regionProjects.reduce((acc, p) => acc + Number(p.value || 0), 0);
    return {
      name: selectedRegion,
      totalValue,
      projectCount: regionProjects.length
    };
  }, [selectedRegion, projects]);

  // --- KPI CALCS ---
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedRegion && p.region !== selectedRegion) return false;
      return true;
    })
  }, [projects, selectedRegion])

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
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 border-b border-white/20 bg-white/60 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 blur-lg bg-blue-400/30 rounded-full" />
              <img src="/emu.1.png" alt="EMU" className="relative h-12 hover:scale-105 transition-transform duration-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold drop-shadow-sm">
                EMU Commercial Hub
              </p>
              <p className="text-sm text-slate-600 font-medium">Control room progetti commerciali</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Vibe Check Compact Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setVibeModalOpen(true)}
              className="bg-white/50 border-blue-200 text-blue-700 hover:bg-blue-50 transition-all gap-2"
            >
              <Smile className="h-4 w-4" />
              <span className="hidden sm:inline">Team Vibe</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </Button>

            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">
                {username ?? 'Operatore'}
              </p>
              <div className="flex items-center justify-end gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold">Secure</p>
              </div>
            </div>
            <Avatar name={username ?? 'User'} />
            <Button variant="outline" size="sm" onClick={() => signOut()} className="border-slate-200 bg-white/50 hover:bg-white hover:text-red-600 transition-colors">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl space-y-8 px-6 py-10"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* MAPPA ITALIA (Sostituisce Vibe Check grande) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 h-full">
            <Card className="h-full border-blue-100/50 min-h-[500px] flex flex-col">
              <CardHeader className="flex flex-col gap-1 border-b border-slate-100/50 pb-4">
                <div className="flex items-center gap-2 text-sm text-primary font-bold uppercase tracking-wider">
                  <MapIcon className="h-4 w-4" />
                  Territorio Nazionale
                </div>
                <CardTitle className="text-3xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-blue-800">
                  Mappa Progetti Italia
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 relative p-0 overflow-hidden bg-slate-50/30">
                <div className="w-full h-full min-h-[400px] relative">
                  <ReactTooltip id="italy-tooltip" style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', fontSize: '12px' }} />
                  <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                      center: [12.5, 42],
                      scale: 2400
                    }}
                    data-tooltip-id="italy-tooltip"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <ZoomableGroup center={[12.5, 42]} zoom={1}>
                      <Geographies geography={geoUrlItalia}>
                        {({ geographies }) =>
                          geographies.map((geo) => {
                            const regionName = geo.properties.reg_name; // Proprietà standard geojson-italy
                            const count = projectsByRegion[regionName] || 0;
                            const isSelected = regionName === selectedRegion;

                            return (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                onMouseEnter={() => setTooltipContent(`${regionName}: ${count} progetti`)}
                                onMouseLeave={() => setTooltipContent('')}
                                onClick={() => setSelectedRegion(isSelected ? null : regionName)}
                                style={{
                                  default: {
                                    fill: isSelected ? '#F59E0B' : (count > 0 ? colorScale(count) : '#E2E8F0'),
                                    stroke: '#FFFFFF',
                                    strokeWidth: 0.5,
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                  },
                                  hover: {
                                    fill: '#F59E0B',
                                    stroke: '#FFFFFF',
                                    strokeWidth: 1.5,
                                    outline: 'none',
                                    cursor: 'pointer'
                                  },
                                  pressed: {
                                    fill: '#D97706',
                                    outline: 'none'
                                  }
                                }}
                                data-tooltip-content={tooltipContent}
                              />
                            )
                          })
                        }
                      </Geographies>
                    </ZoomableGroup>
                  </ComposableMap>

                  {/* Info Tab Interattiva */}
                  <AnimatePresence>
                    {selectedRegionData && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/60 z-30 min-w-[220px]"
                      >
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          <h3 className="font-bold text-lg text-slate-800">{selectedRegionData.name}</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Fatturato Regione</p>
                            <p className="text-xl font-bold text-blue-600">€ {selectedRegionData.totalValue.toLocaleString('it-IT')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Progetti Attivi</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-slate-800">{selectedRegionData.projectCount}</span>
                              <Badge variant="info" className="text-xs">Live</Badge>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => { e.stopPropagation(); setSelectedRegion(null); }}
                          className="mt-4 w-full text-xs text-slate-400 hover:text-slate-600"
                        >
                          Chiudi scheda
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
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
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-blue-100/50">
          <CardHeader className="flex items-start justify-between gap-3 bg-gradient-to-r from-white/50 to-transparent">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-1">
                Performance Analytics
              </p>
              <CardTitle className="text-2xl text-slate-800">Valore Pipeline per Agente</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries()} className="bg-white/50 hover:bg-white text-slate-600">
              Aggiorna Dati
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                  <XAxis 
                    dataKey="agent" 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `€${value/1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    contentStyle={{ 
                      borderRadius: 16, 
                      border: '1px solid rgba(255,255,255,0.8)', 
                      background: 'rgba(255,255,255,0.95)',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(8px)',
                      padding: '12px 16px'
                    }}
                    formatter={(value: number) => [<span className="font-bold text-blue-600">€ {value.toLocaleString()}</span>, 'Valore']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#colorValue)" 
                    radius={[8, 8, 4, 4]} 
                    maxBarSize={60}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
        <Card className="border-blue-100/50">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-100/50 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-1">
                  Database Progetti
                </p>
                <CardTitle className="text-2xl text-slate-800">Pipeline Completa</CardTitle>
              </div>
              <Button onClick={handleNewProject} className="bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 rounded-full px-6">
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Progetto
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {projectsLoading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse">Caricamento progetti in corso...</div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-slate-700">Regione</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="font-bold text-slate-700">Data Richiesta</TableHead>
                    <TableHead className="font-bold text-slate-700">Cliente</TableHead>
                    <TableHead className="font-bold text-slate-700">Agente</TableHead>
                    <TableHead className="font-bold text-slate-700">Progetto</TableHead>
                    <TableHead className="font-bold text-slate-700">Valore (€)</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow 
                      key={project.id} 
                      onClick={() => handleRowClick(project)}
                      className="cursor-pointer transition-colors hover:bg-blue-50/50 group border-slate-100"
                    >
                      <TableCell className="font-medium text-slate-600">
                        {project.region ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-semibold">
                            {project.region}
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[project.status] ?? 'info'} className="shadow-sm">
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {project.request_date
                          ? format(new Date(project.request_date), 'dd MMM yyyy', { locale: it })
                          : '—'}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700">{project.client_name}</TableCell>
                      <TableCell className="text-slate-600">{project.agent_name}</TableCell>
                      <TableCell className="text-slate-600">{project.project_name}</TableCell>
                      <TableCell className="font-bold text-slate-800 tabular-nums">
                        € {Number(project.value ?? 0).toLocaleString('it-IT')}
                      </TableCell>
                      <TableCell className="text-center">
                        {project.pdf_url ? (
                          <a
                            href={project.pdf_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:scale-110 transition-all"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-300 font-medium">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        </motion.div>
      </motion.main>

      <ProjectSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        project={editing}
        sessionUserId={sessionUserId}
        localUserId={localUserId}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ['projects'] })}
      />

      {/* VIBE CHECK MODAL (Nuova posizione) */}
      <AnimatePresence>
        {vibeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Smile className="h-5 w-5 text-blue-600" />
                  Team Vibe Check
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setVibeModalOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-6 bg-slate-50/50">
                <VibeSelector activeMood={myMood} />
                <div className="mt-6 space-y-3 max-h-[300px] overflow-y-auto">
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Stato del Team</p>
                  {profilesLoading && <p className="text-sm text-slate-500">Caricamento...</p>}
                  {!profilesLoading && profiles.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <Avatar name={member.full_name ?? member.email} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{member.full_name ?? member.email}</p>
                        <p className="text-xs text-slate-500">
                          {member.updated_at ? format(new Date(member.updated_at), 'dd MMM HH:mm', { locale: it }) : ''}
                        </p>
                      </div>
                      <span className="text-2xl">{member.mood_status ?? '🙂'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
      await dataService.upsertProfile({
        id: localUserId,
        full_name: username ?? 'Operatore',
        email: `${localUserId}@emu.local`,
        mood_status: mood,
        updated_at: new Date().toISOString(),
      })
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
    <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100">
      <p className="text-sm font-semibold text-slate-800 mb-3">Come ti senti oggi?</p>
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {MOODS.map((mood) => {
          const active = activeMood === mood
          return (
            <button
              key={mood}
              onClick={() => handleMood(mood)}
              disabled={updating}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl border-2 text-2xl transition-all',
                active
                  ? 'border-blue-500 bg-blue-100 shadow-md scale-110'
                  : 'border-slate-200 bg-white hover:-translate-y-1 hover:shadow-lg'
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
      region: '', // Added region
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
        region: '',
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
      await dataService.saveProject(payload)
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
      <SheetContent className="w-full max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Modifica progetto' : 'Nuovo progetto'}</SheetTitle>
          <SheetDescription>
            Aggiorna lo stato, allega PDF e aggiungi note operative per l\'automazione.
          </SheetDescription>
        </SheetHeader>
        <form className="space-y-4 pt-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Regione (Italia)</Label>
              <Select
                value={form.region || ''}
                onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
                required
              >
                <option value="">Seleziona Regione...</option>
                {ITALIAN_REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </div>
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