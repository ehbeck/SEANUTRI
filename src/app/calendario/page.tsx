
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator
} from "@/components/ui/sidebar";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Users,
  Building,
  UserCheck,
  LogOut,
  CalendarDays,
  CalendarIcon,
  Settings,
  History,
  MapPin,
  Link as LinkIcon,
  Database,
} from "lucide-react";
import { GraduationCap } from "@/components/icons";
import { SidebarLogo } from "@/components/app-logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import type { UserSession } from "../page";
import { getAgendamentos } from "@/lib/agendamentos-firebase";
import { getCursos } from "@/lib/cursos-firebase";
import { getUsers } from "@/lib/users-firebase";
import { getInstrutores } from "@/lib/instrutores-firebase";
import { getEmpresas } from "@/lib/empresas-firebase";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ThemeToggle } from "@/components/theme-toggle";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

export default function CalendarioPage() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [user, setUser] = useState<UserSession | null>(null);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [instrutores, setInstrutores] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionData = localStorage.getItem('userSession');
    if (sessionData) {
      const parsedSession = JSON.parse(sessionData);
      setUser(parsedSession);
      if (parsedSession.profile !== 'Administrador') {
        router.push('/dashboard');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  // Carregar dados do Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Carregando dados do calendário...');
        
        const [agendamentosData, cursosData, usuariosData, instrutoresData, empresasData] = await Promise.all([
          getAgendamentos(),
          getCursos(),
          getUsers(),
          getInstrutores(),
          getEmpresas()
        ]);

        console.log('📅 Agendamentos carregados:', agendamentosData.length);
        console.log('📚 Cursos carregados:', cursosData.length);
        console.log('👥 Usuários carregados:', usuariosData.length);
        console.log('👨‍🏫 Instrutores carregados:', instrutoresData.length);
        console.log('🏢 Empresas carregadas:', empresasData.length);

        setAgendamentos(agendamentosData);
        setCursos(cursosData);
        setUsuarios(usuariosData);
        setInstrutores(instrutoresData);
        setEmpresas(empresasData);
      } catch (error) {
        console.error('❌ Erro ao carregar dados do calendário:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.profile === 'Administrador') {
      loadData();
    }
  }, [user]);

  const [filterCourse, setFilterCourse] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterStudent, setFilterStudent] = useState('all');

  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([]);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const filteredUsers = useMemo(() => {
    if (filterCompany === 'all') {
      return usuarios.filter(u => u.profile === 'Aluno');
    }
    return usuarios.filter(p => p.companyId === filterCompany && p.profile === 'Aluno');
  }, [filterCompany, usuarios]);

  useEffect(() => {
    setFilterStudent('all');
  }, [filterCompany]);

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    router.push('/');
  };

  const filteredEvents = useMemo(() => {
    let events = agendamentos;

    if (filterCourse !== 'all') {
      events = events.filter((e: any) => e.courseId === filterCourse);
    }

    if (filterStudent !== 'all') {
      events = events.filter((e: any) => e.studentIds.includes(filterStudent));
    } else if (filterCompany !== 'all') {
      const studentIdsInCompany = usuarios
        .filter((p: any) => p.companyId === filterCompany)
        .map((p: any) => p.id);
      events = events.filter((e: any) => e.studentIds.some((sid: string) => studentIdsInCompany.includes(sid)));
    }
    
    return events.map((e: any) => ({
        ...e,
        course: cursos.find((c: any) => c.id === e.courseId),
        instructor: instrutores.find((i: any) => i.id === e.instructorId),
        students: usuarios.filter((p: any) => e.studentIds.includes(p.id))
    }));
  }, [filterCourse, filterStudent, filterCompany, agendamentos, cursos, instrutores, usuarios]);
  
  const scheduledDays = useMemo(() => filteredEvents.map(event => event.scheduledDate), [filteredEvents]);
  
  // Separar eventos por status para coloração diferente
  const agendadosDays = useMemo(() => {
    const agendados = filteredEvents.filter(event => event.status === 'Agendada');
    console.log('📅 Agendamentos com status "Agendada":', agendados.length);
    return agendados.map(event => event.scheduledDate);
  }, [filteredEvents]);
  
  const concluidosDays = useMemo(() => {
    const concluidos = filteredEvents.filter(event => event.status === 'Concluída');
    console.log('✅ Agendamentos com status "Concluída":', concluidos.length);
    return concluidos.map(event => event.scheduledDate);
  }, [filteredEvents]);

  const handleDayClick = (day: Date) => {
    const eventsOnDay = filteredEvents.filter(event => isSameDay(event.scheduledDate, day));
    if (eventsOnDay.length > 0) {
      setSelectedDayEvents(eventsOnDay);
      setSelectedDate(day);
      setIsDetailsDialogOpen(true);
    }
  };

  if (!user || user.profile !== 'Administrador') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Carregando dados do calendário...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/dashboard" passHref>
            <SidebarLogo />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard" passHref>
                <SidebarMenuButton isActive={pathname === '/dashboard'} tooltip="Dashboard">
                  <LayoutDashboard />
                  Dashboard
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/historico" passHref>
                <SidebarMenuButton isActive={pathname.startsWith('/historico')} tooltip="Histórico">
                  <History />
                  Histórico
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            
            {user.profile === 'Administrador' && (
              <>
                <SidebarMenuItem>
                  <Link href="/agendamentos" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/agendamentos')} tooltip="Agendamentos">
                      <CalendarDays />
                      Agendamentos
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/calendario" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/calendario')} tooltip="Calendário">
                      <CalendarIcon />
                      Calendário
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                             <SidebarMenuButton isSubmenu>
                                <Database />
                                Banco de Dados
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-4">
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <Link href="/cursos" passHref>
                                        <SidebarMenuButton isActive={pathname.startsWith('/cursos')} tooltip="Cursos">
                                            <BookOpen/> Cursos
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <Link href="/empresas" passHref>
                                        <SidebarMenuButton isActive={pathname.startsWith('/empresas')} tooltip="Empresas">
                                            <Building/> Empresas
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <Link href="/usuarios" passHref>
                                        <SidebarMenuButton isActive={pathname.startsWith('/usuarios')} tooltip="Usuários">
                                            <Users/> Usuários
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <Link href="/instrutores" passHref>
                                        <SidebarMenuButton isActive={pathname.startsWith('/instrutores')} tooltip="Instrutores">
                                            <UserCheck/> Instrutores
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </CollapsibleContent>
                    </Collapsible>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/relatorios" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/relatorios')} tooltip="Relatórios">
                      <FileText />
                      Relatórios
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/configuracoes" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/configuracoes')} tooltip="Configurações">
                      <Settings />
                      Configurações
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person face" />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</span>
              <span className="text-xs text-sidebar-foreground/70 truncate">{user.email}</span>
            </div>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground/70 ml-auto flex-shrink-0" onClick={handleLogout}>
              <LogOut className="h-4 w-4"/>
            </Button>
          </div>
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <Button 
              variant="outline" 
              onClick={() => router.push('/agendamentos')}
              className="flex items-center gap-2"
            >
              <LinkIcon className="h-4 w-4" />
              Voltar para Agendamentos
            </Button>
            <h1 className="text-2xl font-headline font-bold">Calendário de Agendamentos</h1>
          </div>
           <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person face" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Filtre os agendamentos para visualizar no calendário.</CardDescription>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <Select value={filterCourse} onValueChange={setFilterCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Cursos</SelectItem>
                    {cursos.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <Select value={filterCompany} onValueChange={setFilterCompany}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Empresas</SelectItem>
                    {empresas.map((company: any) => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <Select value={filterStudent} onValueChange={setFilterStudent} disabled={filteredUsers.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Alunos</SelectItem>
                    {filteredUsers.map(person => (
                      <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {/* Legenda das cores */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span>Agendado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-800"></div>
                  <span>Concluído</span>
                </div>
              </div>
              
              <Calendar
                locale={ptBR}
                mode="single"
                modifiers={{ 
                  agendado: agendadosDays,
                  concluido: concluidosDays
                }}
                modifiersClassNames={{ 
                  agendado: 'bg-green-500/20 rounded-full',
                  concluido: 'bg-gray-800/20 rounded-full'
                }}
                onDayClick={handleDayClick}
                className="rounded-md border p-4"
                components={{
                    DayContent: ({ date }) => {
                        const isAgendado = agendadosDays.some(scheduledDay => isSameDay(scheduledDay, date));
                        const isConcluido = concluidosDays.some(scheduledDay => isSameDay(scheduledDay, date));
                        
                        return (
                          <div className="relative flex items-center justify-center h-full w-full">
                            <span>{format(date, 'd')}</span>
                            {isAgendado && <div className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-green-500"></div>}
                            {isConcluido && <div className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-gray-800"></div>}
                          </div>
                        );
                    }
                }}
              />
            </CardContent>
          </Card>
        </main>

        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-md">
             <DialogHeader>
                <DialogTitle>Agendamentos para {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : ''}</DialogTitle>
                <DialogDescription>Detalhes das turmas agendadas para este dia.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] -mx-4 px-4">
              <div className="space-y-4 py-4 pr-2">
                  {selectedDayEvents.map(event => (
                      <div key={event.id} className="text-sm border rounded-md p-4 space-y-4">
                          <div className="font-semibold text-base flex justify-between items-start">
                            <span>{event.course?.title}</span>
                            <Badge variant="outline">{event.startTime} - {event.endTime}</Badge>
                          </div>
                          <p className="text-muted-foreground">Instrutor: {event.instructor?.name}</p>
                          <div>
                            <h5 className="font-medium mb-1 text-xs text-muted-foreground uppercase tracking-wider">Local</h5>
                            <div className="flex items-center gap-2">
                               {event.locationType === 'Online' ? <LinkIcon className="h-4 w-4 text-primary" /> : <MapPin className="h-4 w-4 text-primary" />}
                               {event.locationType === 'Online' ? (
                                    <a href={event.location} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                                        {event.location}
                                    </a>
                                ) : (
                                    <span className="text-foreground">{event.location}</span>
                                )}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2 text-xs text-muted-foreground uppercase tracking-wider">Alunos Matriculados ({event.students.length})</h5>
                            <ul className="space-y-2 max-h-40 overflow-y-auto">
                              {event.students.map((student: any) => (
                                <li key={student.id} className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={student.avatar} alt={student.name} data-ai-hint={student.hint} />
                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{student.name}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                      </div>
                  ))}
              </div>
            </ScrollArea>
             <DialogFooter>
              <Button onClick={() => setIsDetailsDialogOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
