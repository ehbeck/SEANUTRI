
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Users,
  MoreHorizontal,
  PlusCircle,
  Building,
  UserCheck,
  LogOut,
  CalendarDays,
  CalendarIcon,
  Settings,
  Search,
  History,
  Link as LinkIcon,
  MapPin,
  CheckCircle2,
  Database,
  Download,
} from "lucide-react";
import { GraduationCap } from "@/components/icons";
import { SidebarLogo } from "@/components/app-logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { UserSession } from "../page";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    AddClassDialog,
    EditClassDialog,
    ViewClassDialog,
    ConcludeClassDialog,
    SendCertificateDialog,
    EmailConfirmationDialog,
    CertificateGeneratedDialog
} from "@/components/agendamentos-dialogs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { SidebarMenuComponent } from "@/components/sidebar-menu";
import * as XLSX from 'xlsx';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase.config';
import { getAgendamentos, addAgendamento, updateAgendamento, deleteAgendamento, type ScheduledClass } from '@/lib/agendamentos-firebase';
import { getCursos } from '@/lib/cursos-firebase';
import { getUsers } from '@/lib/users-firebase';
import { getEmpresas } from '@/lib/empresas-firebase';
import { getInstrutores } from '@/lib/instrutores-firebase';

export default function AgendamentosPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [instrutores, setInstrutores] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [classToDelete, setClassToDelete] = useState<ScheduledClass | null>(null);
  const [classToView, setClassToView] = useState<any | null>(null);
  const [classToEdit, setClassToEdit] = useState<ScheduledClass | null>(null);
  const [classToConclude, setClassToConclude] = useState<any | null>(null);
  
  const [approvedStudentsForNotification, setApprovedStudentsForNotification] = useState<any[]>([]);
  const [courseNameForNotification, setCourseNameForNotification] = useState<string>('');
  const [courseIdForNotification, setCourseIdForNotification] = useState<string>('');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConcludeOpen, setIsConcludeOpen] = useState(false);
  const [isSendCertificatesOpen, setIsSendCertificatesOpen] = useState(false);
  const [isEmailConfirmationOpen, setIsEmailConfirmationOpen] = useState(false);
  const [isCertificateGeneratedOpen, setIsCertificateGeneratedOpen] = useState(false);
  const [savedAgendamentoData, setSavedAgendamentoData] = useState<any>(null);
  
  const [user, setUser] = useState<UserSession | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterStudent, setFilterStudent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('Agendada');

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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [agendamentosData, cursosData, usuariosData, instrutoresData, empresasData] = await Promise.all([
        getAgendamentos(),
        getCursos(),
        getUsers(),
        getInstrutores(),
        getEmpresas()
      ]);

      // Enriquecer dados dos agendamentos com nomes dos cursos e instrutores
      const agendamentosEnriquecidos = agendamentosData.map(agendamento => {
        const curso = cursosData.find(c => c.id === agendamento.courseId);
        const instrutor = instrutoresData.find(i => i.id === agendamento.instructorId);
        
        return {
          ...agendamento,
          courseName: curso?.titulo || 'Curso não encontrado',
          instructorName: instrutor?.name || 'Instrutor não encontrado',
        };
      });
      console.log('Dados carregados:', {
        agendamentos: agendamentosData.length,
        agendamentosEnriquecidos: agendamentosEnriquecidos.length,
        cursos: cursosData.length,
        instrutores: instrutoresData.length,
        usuarios: usuariosData.length,
        empresas: empresasData.length
      });
      
      console.log('Agendamentos:', agendamentosData.map(a => ({ 
        id: a.id, 
        courseId: a.courseId, 
        instructorId: a.instructorId, 
        status: a.status 
      })));
      console.log('Cursos:', cursosData.map(c => ({ id: c.id, titulo: c.titulo })));
      console.log('Instrutores:', instrutoresData.map(i => ({ id: i.id, name: i.name })));
      
      // Verificar se os IDs dos agendamentos existem nas outras coleções
      agendamentosData.forEach(agendamento => {
        const curso = cursosData.find(c => c.id === agendamento.courseId);
        const instrutor = instrutoresData.find(i => i.id === agendamento.instructorId);
        console.log(`Agendamento ${agendamento.id}:`, {
          courseId: agendamento.courseId,
          cursoEncontrado: !!curso,
          instructorId: agendamento.instructorId,
          instrutorEncontrado: !!instrutor,
          status: agendamento.status
        });
      });
      
      setScheduledClasses(agendamentosEnriquecidos);
      setCursos(cursosData);
      setUsuarios(usuariosData);
      setInstrutores(instrutoresData);
      setEmpresas(empresasData);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      // Não usar toast aqui para evitar loop infinito
    } finally {
      setLoading(false);
    }
  }, []); // Dependências vazias para evitar recriação

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]); // Remover loadData da dependência

  const filteredUsers = useMemo(() => {
    if (filterCompany === 'all') {
      return usuarios.filter(u => u.profile === 'Aluno');
    }
    return usuarios.filter(p => p.companyId === filterCompany && p.profile === 'Aluno');
  }, [usuarios, filterCompany]);

  useEffect(() => {
    setFilterStudent('all');
  }, [filterCompany]);

  const handleDeleteConfirm = async () => {
    if (!classToDelete) return;
    
    try {
      await deleteAgendamento(classToDelete.id);
      const course = cursos.find(c => c.id === classToDelete.courseId);
      toast({
        title: "Excluída!",
        description: `A turma do curso ${course?.titulo} foi removida.`
      });
      setClassToDelete(null);
      loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir agendamento',
        description: error.message || 'Falha ao excluir agendamento'
      });
    }
  };
  
  const handleSaveClass = async (data: Omit<ScheduledClass, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Enriquecer dados com nomes
      const curso = cursos.find(c => c.id === data.courseId);
      const instrutor = instrutores.find(i => i.id === data.instructorId);
      
      const agendamentoData = {
        ...data,
        courseName: curso?.titulo || '',
        instructorName: instrutor?.name || '',
        status: 'Agendada' as const,
      };

      await addAgendamento(agendamentoData);
      toast({
        title: "Sucesso!",
        description: `A turma para o curso ${curso?.titulo} foi agendada.`
      });
      
      // Abrir diálogo de confirmação de emails
      setSavedAgendamentoData(agendamentoData);
      setIsEmailConfirmationOpen(true);
      
      loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar agendamento',
        description: error.message || 'Falha ao salvar agendamento'
      });
    }
  };

  const handleUpdateClass = async (id: string, data: Partial<Omit<ScheduledClass, 'id'>>) => {
    try {
      // Enriquecer dados com nomes se necessário
      let agendamentoData = { ...data };
      if (data.courseId) {
        const curso = cursos.find(c => c.id === data.courseId);
        agendamentoData.courseName = curso?.titulo || '';
      }
      if (data.instructorId) {
        const instrutor = instrutores.find(i => i.id === data.instructorId);
        agendamentoData.instructorName = instrutor?.name || '';
      }

      await updateAgendamento(id, agendamentoData);
      const course = cursos.find(c => c.id === data.courseId);
      toast({
        title: "Sucesso!",
        description: `A turma para o curso ${course?.titulo} foi atualizada.`
      });
      loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar agendamento',
        description: error.message || 'Falha ao atualizar agendamento'
      });
    }
  }

  const handleOpenViewDialog = (turma: any) => {
    setClassToView(turma);
    setIsViewOpen(true);
  }

  const handleOpenEditDialog = (turma: ScheduledClass) => {
    setClassToEdit(turma);
    setIsEditOpen(true);
  }
  
  const handleOpenConcludeDialog = (turma: any) => {
    setClassToConclude(turma);
    setIsConcludeOpen(true);
  }
  
  const handleOnConclude = async (classId: string, approvedStudents: any[], updatedFields: Partial<ScheduledClass>) => {
    try {
      console.log('🔍 handleOnConclude - Debug:');
      console.log('  - classId:', classId);
      console.log('  - approvedStudents:', approvedStudents);
      console.log('  - approvedStudents.length:', approvedStudents.length);
      console.log('  - classToConclude:', classToConclude);
      
      // Atualizar o agendamento para status "Concluída"
      await updateAgendamento(classId, { ...updatedFields, status: 'Concluída' });
      
      // Criar matrículas no histórico para os alunos aprovados
      if (approvedStudents.length > 0) {
        const { enrollmentService } = await import('@/lib/firebase-db');
        
        for (const student of approvedStudents) {
          try {
            console.log(`📝 Criando matrícula para aluno:`, {
              id: student.id,
              name: student.name,
              email: student.email,
              courseId: classToConclude?.courseId,
              instructorId: classToConclude?.instructorId
            });
            
            await enrollmentService.create({
              courseId: classToConclude?.courseId || '',
              userId: student.id,
              status: 'Concluído',
              grade: student.grade || 0,
              approved: student.approved || false,
              completionDate: new Date(),
              verificationCode: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              instructorId: classToConclude?.instructorId || null
            } as any);
          } catch (error) {
            console.error(`Erro ao criar matrícula para aluno ${student.id}:`, error);
          }
        }
        
        toast({
          title: "Turma Concluída!",
          description: `A turma foi concluída e ${approvedStudents.length} alunos foram movidos para o histórico.`
        });
      }
      
      loadData();
      if (approvedStudents.length > 0) {
        console.log('✅ Configurando dados para o diálogo de certificados:');
        console.log('  - approvedStudents:', approvedStudents);
        console.log('  - courseName:', classToConclude?.courseName);
        console.log('  - courseId:', classToConclude?.courseId);
        
        setApprovedStudentsForNotification(approvedStudents);
        setCourseNameForNotification(classToConclude?.courseName || '');
        setCourseIdForNotification(classToConclude?.courseId || '');
        setIsCertificateGeneratedOpen(true);
      }
    } catch (error: any) {
      console.error('❌ Erro em handleOnConclude:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao concluir agendamento',
        description: error.message || 'Falha ao concluir agendamento'
      });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('userSession');
    router.push('/');
  };

  const handleOpenSendNotifications = () => {
    setIsSendCertificatesOpen(true);
  };

  const handleSendEmails = async (studentEmails: string[], companyEmails: string[]) => {
    try {
      const { sendEmail } = await import('@/services/email');
      const { notificationSettings } = await import('@/lib/data');
      
      // Obter template de "Matrícula em Curso"
      const template = notificationSettings.templates.find(t => t.id === 'course-enrollment');
      
      if (!template || !notificationSettings.enabled || !template.enabled) {
        toast({
          variant: 'destructive',
          title: 'Notificações Desabilitadas',
          description: 'O envio de emails de notificação está desabilitado nas configurações.'
        });
        return;
      }

      let sentCount = 0;
      const course = cursos.find(c => c.id === savedAgendamentoData?.courseId);
      
      if (!course) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Curso não encontrado para enviar notificações.'
        });
        return;
      }

      // Enviar emails para alunos
      for (const email of studentEmails) {
        try {
          const student = usuarios.find(u => u.email === email);
          const studentName = student?.name || 'Aluno';
          
          let subject = template.subject
            .replace('{{nome_aluno}}', studentName)
            .replace('{{nome_curso}}', course.titulo);
          
          let content = template.content
            .replace('{{nome_aluno}}', studentName)
            .replace('{{nome_curso}}', course.titulo);

          const result = await sendEmail({
            to: email,
            subject: subject,
            text: content,
            html: `<p>${content.replace(/\n/g, '<br>')}</p>`,
          });

          if (result.success) {
            sentCount++;
          }
        } catch (error) {
          console.error(`Erro ao enviar email para ${email}:`, error);
        }
      }

      // Enviar emails para empresas
      for (const email of companyEmails) {
        try {
          const company = empresas.find(e => e.email === email);
          const companyName = company?.name || 'Empresa';
          
          // Template personalizado para empresas
          const companySubject = `Notificação: Alunos matriculados no curso ${course.titulo}`;
          const companyContent = `Olá ${companyName},\n\nInformamos que seus funcionários foram matriculados no curso "${course.titulo}".\n\nDetalhes do agendamento:\n- Data: ${savedAgendamentoData?.scheduledDate ? format(savedAgendamentoData.scheduledDate, "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}\n- Horário: ${savedAgendamentoData?.startTime} - ${savedAgendamentoData?.endTime}\n- Local: ${savedAgendamentoData?.location}\n\nAtenciosamente,\nEquipe Seanutri`;

          const result = await sendEmail({
            to: email,
            subject: companySubject,
            text: companyContent,
            html: `<p>${companyContent.replace(/\n/g, '<br>')}</p>`,
          });

          if (result.success) {
            sentCount++;
          }
        } catch (error) {
          console.error(`Erro ao enviar email para empresa ${email}:`, error);
        }
      }

      toast({
        title: "Emails Enviados!",
        description: `${sentCount} email(s) foram enviados com sucesso.`
      });

    } catch (error: any) {
      console.error('Erro ao enviar emails:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Enviar Emails',
        description: error.message || 'Falha ao enviar emails de notificação'
      });
    }
  };

  const tableData = useMemo(() => {
    const studentIdsInCompany = filterCompany === 'all' 
      ? usuarios.map(p => p.id)
      : usuarios.filter(p => p.companyId === filterCompany).map(p => p.id);

    return scheduledClasses
      .map(sc => ({
        ...sc,
        studentCount: sc.studentIds.length,
      }))
      .filter(item => {
          const courseMatch = filterCourse === 'all' || item.courseId === filterCourse;
          const companyMatch = filterCompany === 'all' || item.studentIds.some(sid => studentIdsInCompany.includes(sid));
          const studentMatch = filterStudent === 'all' || item.studentIds.includes(filterStudent);
          const statusMatch = filterStatus === 'all' || item.status === filterStatus;
          const searchMatch = !searchQuery || item.courseName?.toLowerCase().includes(searchQuery.toLowerCase());
          return courseMatch && companyMatch && studentMatch && statusMatch && searchMatch;
      });
  }, [scheduledClasses, filterCourse, filterCompany, filterStudent, filterStatus, searchQuery, usuarios]);
  
  const handleExportXLSX = () => {
    const dataToExport = tableData.map(item => ({
        'Curso': item.courseName || 'N/A',
        'Instrutor': item.instructorName || 'N/A',
        'Alunos': item.studentCount,
        'Data': format(item.scheduledDate, "dd/MM/yyyy", { locale: ptBR }),
        'Horário': `${item.startTime} - ${item.endTime}`,
        'Local': item.locationType
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Agendamentos");
    XLSX.writeFile(workbook, "agendamentos.xlsx");
  };

  if (!user || user.profile !== 'Administrador') {
    return null;
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
          <SidebarMenuComponent user={user} />
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
            <h1 className="text-2xl font-headline font-bold">Agendamentos</h1>
            <Link href="/calendario" passHref>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary shadow-lg"
                title="Ver Calendário"
              >
                <CalendarIcon className="h-6 w-6" />
              </Button>
            </Link>
          </div>
           <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person face" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>
                    {filterStatus === 'Agendada' ? 'Turmas Agendadas' : 
                     filterStatus === 'Concluída' ? 'Histórico de Turmas Concluídas' : 
                     'Todas as Turmas'}
                  </CardTitle>
                  <CardDescription>
                    {filterStatus === 'Agendada' ? 'Gerencie as turmas agendadas e acompanhe o progresso dos alunos.' :
                     filterStatus === 'Concluída' ? 'Visualize o histórico de turmas concluídas e certificados emitidos.' :
                     'Visualize todas as turmas, agendadas e concluídas.'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportXLSX}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                  <AddClassDialog
                    onSave={handleSaveClass}
                    isOpen={isAddOpen}
                    setIsOpen={setIsAddOpen}
                    courses={cursos}
                    instructors={instrutores}
                    students={usuarios}
                    companies={empresas}
                  >
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Agendar Nova Turma
                    </Button>
                  </AddClassDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por curso..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterCourse} onValueChange={setFilterCourse}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Curso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Cursos</SelectItem>
                      {cursos.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterCompany} onValueChange={setFilterCompany}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Empresas</SelectItem>
                      {empresas.map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStudent} onValueChange={setFilterStudent}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Alunos</SelectItem>
                      {filteredUsers.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Agendada">Agendadas</SelectItem>
                      <SelectItem value="Concluída">Concluídas (Histórico)</SelectItem>
                      <SelectItem value="all">Todos os Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tabela */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando agendamentos...</p>
                  </div>
                </div>
              ) : tableData.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum agendamento encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterCourse !== "all" || filterCompany !== "all" || filterStudent !== "all" || filterStatus !== "all"
                      ? "Tente ajustar os filtros de busca."
                      : "Comece agendando sua primeira turma."}
                  </p>
                  {!searchQuery && filterCourse === "all" && filterCompany === "all" && filterStudent === "all" && filterStatus === "all" && (
                    <AddClassDialog
                      onSave={handleSaveClass}
                      isOpen={isAddOpen}
                      setIsOpen={setIsAddOpen}
                      courses={cursos}
                      instructors={instrutores}
                      students={usuarios}
                      companies={empresas}
                    >
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Agendar Primeira Turma
                      </Button>
                    </AddClassDialog>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Curso</TableHead>
                        <TableHead>Instrutor</TableHead>
                        <TableHead>Alunos</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.map((turma) => (
                        <TableRow key={turma.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              {turma.courseName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src="https://placehold.co/24x24.png" alt={turma.instructorName} />
                                <AvatarFallback className="text-xs">
                                  {turma.instructorName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{turma.instructorName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {turma.studentCount} alunos
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(turma.scheduledDate, "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {turma.startTime} - {turma.endTime}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{turma.locationType}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={turma.status === 'Concluída' ? 'default' : 'secondary'}>
                              {turma.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleOpenViewDialog(turma)}>
                                  <LinkIcon className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenEditDialog(turma)}>
                                  <BookOpen className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleOpenConcludeDialog(turma)}>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  {turma.status === 'Agendada' ? 'Concluir Turma' : 'Ver Detalhes da Conclusão'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => setClassToDelete(turma)}
                                  className="text-destructive"
                                >
                                  <LogOut className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      {/* Dialogs */}
      <ViewClassDialog
        classData={classToView}
        isOpen={isViewOpen}
        setIsOpen={setIsViewOpen}
        students={usuarios}
      />

      <EditClassDialog
        classData={classToEdit}
        onSave={handleUpdateClass}
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        courses={cursos}
        instructors={instrutores}
        students={usuarios.filter(u => u.profile === 'Aluno')}
        companies={empresas}
      />

      <ConcludeClassDialog
        classData={classToConclude}
        onConclude={handleOnConclude}
        isOpen={isConcludeOpen}
        setIsOpen={setIsConcludeOpen}
        students={usuarios}
        companies={empresas}
      />

      <SendCertificateDialog
        approvedStudents={approvedStudentsForNotification}
        courseName={courseNameForNotification}
        courseId={courseIdForNotification}
        isOpen={isSendCertificatesOpen}
        setIsOpen={setIsSendCertificatesOpen}
        courses={cursos}
      />

      <CertificateGeneratedDialog
        isOpen={isCertificateGeneratedOpen}
        setIsOpen={setIsCertificateGeneratedOpen}
        approvedStudents={approvedStudentsForNotification}
        courseName={courseNameForNotification}
        courseId={courseIdForNotification}
        onOpenSendNotifications={handleOpenSendNotifications}
      />

      <EmailConfirmationDialog
        isOpen={isEmailConfirmationOpen}
        setIsOpen={setIsEmailConfirmationOpen}
        agendamentoData={savedAgendamentoData}
        students={usuarios}
        companies={empresas}
        onSendEmails={handleSendEmails}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!classToDelete} onOpenChange={() => setClassToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
