import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Globe,
  LogOut,
  Plus,
  FileText,
  UploadCloud,
  Trash2
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
import { motion } from 'framer-motion'

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

// Helper function per aprire i PDF
const openPdf = async (projectId: string, existingUrl: string | null) => {
  if (!existingUrl) return;
  
  if (existingUrl.startsWith('turso://')) {
    try {
      const doc = await dataService.getDocumentByProject(projectId);
      if (doc) {
        const win = window.open();
        if (win) {
          win.document.write(`<iframe src="${doc.file_data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        }
      } else {
        alert("Documento non trovato nel database.");
      }
    } catch (e) {
      console.error(e);
      alert("Errore nel recupero del PDF.");
    }
  } else {
    window.open(existingUrl, '_blank');
  }
}

export function DashboardEstero() {
  const { username, localUserId, signOut } = useAuth()
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
                EMU Foreign Hub
              </p>
              <p className="text-sm text-slate-600 font-medium">Control room progetti internazionali</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
        <motion.div variants={itemVariants}>
        <Card className="border-blue-100/50">
          <CardHeader className="flex flex-col gap-1 border-b border-slate-100/50 pb-4">
            <div className="flex items-center gap-2 text-sm text-primary font-bold uppercase tracking-wider">
              <Globe className="h-4 w-4" />
              Mappa Progetti
            </div>
            <CardTitle className="text-3xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-blue-800">
              Distribuzione Globale
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden rounded-b-2xl">
            <div className="relative w-full border-t border-white/50" style={{ paddingTop: '56.25%', backgroundColor: 'rgba(230, 238, 245, 0.5)' }}>
              <ReactTooltip id="map-tooltip" style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', fontSize: '12px' }} />
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
                    {({
                      geographies
                    }) =>
                      geographies
                        .filter(geo => geo.properties.name !== "Antarctica")
                        .map((geo) => {
                          const countryName = normalizeCountryName(geo.properties.name);
                          const projectCount = projectsByCountry[countryName] || 0;
                          const fillColor = projectCount > 0 ? colorScale(projectCount) : '#CBD5E1';
                          const isSelected = countryName === selectedCountry;
                          
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
                                  fill: isSelected ? '#F59E0B' : fillColor,
                                  stroke: '#ffffff',
                                  strokeWidth: 0.5,
                                  outline: 'none',
                                  transition: 'all 0.3s ease',
                                },
                                hover: {
                                  fill: '#F59E0B',
                                  stroke: '#ffffff',
                                  strokeWidth: 1,
                                  outline: 'none',
                                  cursor: 'pointer',
                                },
                                pressed: {
                                  fill: '#D97706',
                                  stroke: '#ffffff',
                                  strokeWidth: 1,
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
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 z-30 min-w-[200px]"
                >
                  <h3 className="font-bold text-lg text-slate-800 border-b border-slate-200 pb-2 mb-2">{selectedCountryData.name}</h3>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Fatturato Totale</p>
                    <p className="text-lg font-bold text-blue-600">€ {selectedCountryData.totalValue.toLocaleString('it-IT')}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mt-2">Progetti Attivi</p>
                    <p className="text-lg font-bold text-slate-800">{selectedCountryData.projectCount}</p>
                  </div>
                </motion.div>
              )}

              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <Button onClick={handleZoomIn} size="sm" className="h-8 w-8 rounded-full shadow-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200">
                  +
                </Button>
                <Button onClick={handleZoomOut} size="sm" className="h-8 w-8 rounded-full shadow-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200">
                  -
                </Button>
                {selectedCountry && (
                  <Button onClick={() => setSelectedCountry(null)} size="sm" variant="outline" className="mt-2 text-xs bg-white/90 backdrop-blur-sm shadow-md border-blue-200 text-blue-600 hover:bg-blue-50">
                    Reset Filtro
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
        
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Total Pipeline" value={pipelineValue} description="Open + Negotiation" />
            <KpiCard title={`Top Country: ${topCountry.name}`} value={topCountry.value} description="Highest value country" />
            <KpiCard title="Projects Won (mese)" value={projectsWonThisMonth} description="Successi recenti" suffix="progetti" />
            <KpiCard title="Progetti Attivi" value={activeCount} description="Non persi" suffix="attivi" />
        </motion.div>

        <motion.div variants={itemVariants}>
        <Card className="border-blue-100/50">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-100/50 pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-1">
                  Database Progetti
                </p>
                <CardTitle className="text-2xl text-slate-800">Pipeline progetti internazionali</CardTitle>
              </div>
              <Button onClick={handleNewProject} className="bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 rounded-full px-6">
                <Plus className="h-4 w-4 mr-2" />
                Nuovo progetto
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {projectsLoading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse">Caricamento progetti...</div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-slate-700">Paese</TableHead>
                    <TableHead className="font-bold text-slate-700">Status</TableHead>
                    <TableHead className="font-bold text-slate-700">Request Date</TableHead>
                    <TableHead className="font-bold text-slate-700">Client</TableHead>
                    <TableHead className="font-bold text-slate-700">Agent</TableHead>
                    <TableHead className="font-bold text-slate-700">Project</TableHead>
                    <TableHead className="font-bold text-slate-700">Value (€)</TableHead>
                    <TableHead className="font-bold text-slate-700 text-center">PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => {
                    const countryCode = getCountryCode(project.Country || '');
                    return (
                      <TableRow 
                        key={project.id} 
                        onClick={() => handleRowClick(project)}
                        className="cursor-pointer transition-colors hover:bg-blue-50/50 group border-slate-100"
                      >
                        <TableCell>
                          {countryCode ? (
                            <span className="flex items-center gap-2 font-medium text-slate-700">
                              <ReactCountryFlag countryCode={countryCode} svg className="drop-shadow-sm" />
                              {project.Country}
                            </span>
                          ) : (
                            <span className="text-slate-500">{project.Country || 'N/A'}</span>
                          )}
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPdf(project.id, project.pdf_url || null);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:scale-110 transition-all"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-xs text-slate-300 font-medium">—</span>
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
        </motion.div>
      </motion.main>

      <ProjectSheetEstero
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        project={editing}
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
  localUserId,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
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
  const [pendingDoc, setPendingDoc] = useState<{ name: string, type: string, base64: string } | null>(null)

  useEffect(() => {
    if (project) {
      setForm(project)
      setPendingDoc(null)
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
      setPendingDoc(null)
    }
  }, [project, localUserId, open])

  const handleUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("Il file è troppo grande. Massimo 2MB per i PDF su database.");
      return;
    }

    setUploading(true)
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        if (!base64) throw new Error("Errore lettura file");
        
        await dataService.saveDocument(form.id, file.name, file.type, base64);
        setForm((prev) => ({ ...prev, pdf_url: `turso://${form.id}` }));
        setUploading(false);
      };
      reader.onerror = () => { throw new Error("Errore FileReader"); };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Upload error:', err)
      alert(`Errore nel caricamento PDF: ${err.message || 'Errore sconosciuto'}`)
      setUploading(false)
    }
  }

  const openPdf = async (projectId: string, existingUrl: string | null) => {
    if (!existingUrl) return;
    
    if (existingUrl.startsWith('turso://')) {
      try {
        const doc = await dataService.getDocumentByProject(projectId);
        if (doc) {
          const win = window.open();
          if (win) {
            win.document.write(`<iframe src="${doc.file_data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
          }
        } else {
          alert("Documento non trovato nel database.");
        }
      } catch (e) {
        console.error(e);
        alert("Errore nel recupero del PDF.");
      }
    } else {
      window.open(existingUrl, '_blank');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (!localUserId) throw new Error('User not authenticated for saving.')
      const payload = { ...form, user_id: localUserId }
      
      // 1. Salviamo progetto
      await dataService.saveProject(payload);

      // 2. Salviamo PDF se presente
      if (pendingDoc) {
        await dataService.saveDocument(payload.id, pendingDoc.name, pendingDoc.type, pendingDoc.base64);
        setPendingDoc(null);
      }

      onSaved()
      onOpenChange(false)
    } catch (err: any) {
      console.error('Save error:', err)
      alert(`Errore salvataggio: ${err.message || 'Sconosciuto'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Eliminare definitivamente questo progetto internazionale?')) return
    
    setSaving(true)
    try {
      await dataService.deleteProject(form.id)
      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      alert('Errore durante l\'eliminazione')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full max-w-2xl">
        <SheetHeader>
          <div className="flex items-center justify-between pr-8">
            <SheetTitle>{isEditing ? 'Modifica progetto' : 'Nuovo progetto'}</SheetTitle>
            {isEditing && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Elimina
              </Button>
            )}
          </div>
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
                <button 
                  type="button"
                  onClick={() => {
                    if (pendingDoc) {
                      const win = window.open();
                      if (win) {
                        win.document.write(`<iframe src="${pendingDoc.base64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                      }
                    } else {
                      openPdf(form.id, form.pdf_url || null);
                    }
                  }} 
                  className="text-primary hover:underline text-left"
                >
                  File caricato (clicca per aprire) {pendingDoc ? '(da salvare)' : ''}
                </button>
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