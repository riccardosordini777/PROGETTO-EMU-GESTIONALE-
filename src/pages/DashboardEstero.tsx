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
import { dataService } from '../lib/dataService'
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
  // Passiamo userId = null per vedere i progetti di tutti
  // Passiamo countryFilter = undefined per prendere tutti quelli che HANNO un paese (IS NOT NULL)
  return dataService.getProjects(null, undefined);
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
    // Polling ogni 30 secondi per aggiornare i dati
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['projectsEstero'] });
    }, 30000);

    return () => clearInterval(interval);
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
      
      await dataService.saveProject(payload);

      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error('Save error:', err)
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
