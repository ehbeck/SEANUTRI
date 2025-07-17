
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
  Building,
  UserCheck,
  LogOut,
  CalendarDays,
  CalendarIcon,
  Settings,
  Search,
  Award,
  History,
  Database,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Trash2,
  Edit,
  Plus,
  Mail
} from "lucide-react";
import { GraduationCap } from "@/components/icons";
import { SidebarLogo } from "@/components/app-logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import type { UserSession } from "../page";
import { 
  courses as allCourses, 
  users as allUsers, 
  companies as allCompanies,
  instructors as allInstructors,
  certificateSettings
} from "@/lib/data";
import { getCursos } from '@/lib/cursos-firebase';
import { getUsers } from '@/lib/users-firebase';
import { getInstrutores } from '@/lib/instrutores-firebase';
import { getEmpresas } from '@/lib/empresas-firebase';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarMenuComponent } from "@/components/sidebar-menu";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { type DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { enrollmentService, type Enrollment } from "@/lib/firebase-db";
import { AddEnrollmentDialog, EditEnrollmentDialog, DeleteEnrollmentDialog, EditScheduledClassDialog, DeleteScheduledClassDialog, SendCertificateDialog } from "@/components/historico-dialogs";
import { getAgendamentosByStatus, updateAgendamento, deleteAgendamento, type ScheduledClass } from '@/lib/agendamentos-firebase';

import jsPDF from "jspdf";
// Removido: import html2canvas from "html2canvas"; - causa problemas de SSR
// Removido: import JSZip from "jszip"; - causa problemas de SSR
import QRCode from "qrcode.react";
import * as XLSX from 'xlsx';

type EnrollmentHistory = Enrollment & {
    userName: string;
    userAvatar: string;
    userHint: string;
    courseName: string;
    companyId: string;
    companyName: string;
};

type ScheduledClassHistory = ScheduledClass & {
    courseName: string;
    instructorName: string;
    studentCount: number;
    completionDate: Date;
};

type SortDescriptor = {
    column: keyof EnrollmentHistory | keyof ScheduledClassHistory | null;
    direction: 'ascending' | 'descending';
};

const ITEMS_PER_PAGE = 10;

export default function HistoricoPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  
  const [user, setUser] = useState<UserSession | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [instrutores, setInstrutores] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'enrollments' | 'scheduledClasses'>('enrollments');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterStudent, setFilterStudent] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({ column: 'completionDate', direction: 'descending' });
  const [isDownloading, setIsDownloading] = useState(false);

  // Estados para os diálogos de CRUD de matrículas
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  // Estados para os diálogos de CRUD de agendamentos
  const [isEditScheduledClassDialogOpen, setIsEditScheduledClassDialogOpen] = useState(false);
  const [isDeleteScheduledClassDialogOpen, setIsDeleteScheduledClassDialogOpen] = useState(false);
  const [selectedScheduledClass, setSelectedScheduledClass] = useState<ScheduledClass | null>(null);

  // Estados para o diálogo de envio de certificado
  const [isSendCertificateDialogOpen, setIsSendCertificateDialogOpen] = useState(false);
  const [selectedCertificateData, setSelectedCertificateData] = useState<{
    enrollment: Enrollment;
    course: any;
    user: any;
  } | null>(null);

  useEffect(() => {
    const sessionData = localStorage.getItem('userSession');
    if (sessionData) {
      setUser(JSON.parse(sessionData));
    } else {
      router.push('/');
    }
  }, [router]);

  // Ler parâmetros da URL para filtros
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get('user');
      if (userParam) {
        setFilterStudent(userParam);
      }
    }
  }, []);

  // Carregar dados do Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Iniciando carregamento de dados...');
        console.log('👤 Usuário atual:', user);
        
        const [enrollmentsData, scheduledClassesData, cursosData, usuariosData, instrutoresData, empresasData] = await Promise.all([
          enrollmentService.getAll(),
          getAgendamentosByStatus('Concluída'),
          getCursos(),
          getUsers(),
          getInstrutores(),
          getEmpresas()
        ]);
        
        console.log('📊 Dados carregados:');
        console.log('  - Matrículas:', enrollmentsData.length, enrollmentsData);
        console.log('  - Agendamentos Concluídos:', scheduledClassesData.length, scheduledClassesData);
        console.log('  - Cursos:', cursosData.length, cursosData);
        console.log('  - Usuários:', usuariosData.length, usuariosData);
        console.log('  - Instrutores:', instrutoresData.length, instrutoresData);
        console.log('  - Empresas:', empresasData.length, empresasData);
        
        setEnrollments(enrollmentsData);
        setScheduledClasses(scheduledClassesData);
        setCursos(cursosData);
        setUsuarios(usuariosData);
        setInstrutores(instrutoresData);
        setEmpresas(empresasData);
        
        console.log('✅ Dados definidos no estado');
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        console.log('🏁 Carregamento finalizado');
      }
    };

    if (user) {
      loadData();
    }
  }, [user, toast]);

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    router.push('/');
  };

  // Funções CRUD
  const handleAddEnrollment = async (data: Omit<Enrollment, 'id'>) => {
    try {
      await enrollmentService.create(data);
      toast({
        title: "Sucesso",
        description: "Matrícula criada com sucesso",
      });
      // Recarregar dados
      const updatedData = await enrollmentService.getAll();
      setEnrollments(updatedData);
    } catch (error) {
      console.error('Erro ao criar matrícula:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar matrícula",
        variant: "destructive",
      });
    }
  };

  const handleEditEnrollment = async (id: string, data: Partial<Enrollment>) => {
    try {
      await enrollmentService.update(id, data);
      toast({
        title: "Sucesso",
        description: "Matrícula atualizada com sucesso",
      });
      // Recarregar dados
      const updatedData = await enrollmentService.getAll();
      setEnrollments(updatedData);
    } catch (error) {
      console.error('Erro ao atualizar matrícula:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar matrícula",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEnrollment = async (id: string) => {
    try {
      await enrollmentService.delete(id);
      toast({
        title: "Sucesso",
        description: "Matrícula excluída com sucesso",
      });
      // Recarregar dados
      const updatedData = await enrollmentService.getAll();
      setEnrollments(updatedData);
    } catch (error) {
      console.error('Erro ao excluir matrícula:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir matrícula",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsDeleteDialogOpen(true);
  };

  // Funções CRUD para agendamentos
  const handleEditScheduledClass = async (id: string, data: Partial<ScheduledClass>) => {
    try {
      await updateAgendamento(id, data);
      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso",
      });
      
      // Recarregar dados
      const updatedScheduledClasses = await getAgendamentosByStatus('Concluída');
      setScheduledClasses(updatedScheduledClasses);
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar agendamento",
        variant: "destructive",
      });
    }
  };

  const handleDeleteScheduledClass = async (id: string) => {
    try {
      await deleteAgendamento(id);
      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso",
      });
      
      // Recarregar dados
      const updatedScheduledClasses = await getAgendamentosByStatus('Concluída');
      setScheduledClasses(updatedScheduledClasses);
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir agendamento",
        variant: "destructive",
      });
    }
  };

  const openEditScheduledClassDialog = (scheduledClass: ScheduledClass) => {
    setSelectedScheduledClass(scheduledClass);
    setIsEditScheduledClassDialogOpen(true);
  };

  const openDeleteScheduledClassDialog = (scheduledClass: ScheduledClass) => {
    setSelectedScheduledClass(scheduledClass);
    setIsDeleteScheduledClassDialogOpen(true);
  };

  const openSendCertificateDialog = (enrollment: Enrollment) => {
    const course = cursos.find(c => c.id === enrollment.courseId);
    const user = usuarios.find(u => u.id === enrollment.userId);
    
    if (!course || !user) {
      toast({
        title: "Erro",
        description: "Dados do curso ou usuário não encontrados",
        variant: "destructive",
      });
      return;
    }

    setSelectedCertificateData({ enrollment, course, user });
    setIsSendCertificateDialogOpen(true);
  };

  const handleStatusChange = async (enrollmentId: string, newStatus: 'Não Iniciado' | 'Em Progresso' | 'Concluído') => {
    try {
      await enrollmentService.update(enrollmentId, { 
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Atualizar o estado local
      setEnrollments(prev => prev.map(e => 
        e.id === enrollmentId 
          ? { ...e, status: newStatus, updatedAt: new Date() }
          : e
      ));
      
      toast({
        title: "Status atualizado",
        description: `Status alterado para ${newStatus}`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status",
        variant: "destructive",
      });
    }
  };
  
  const baseEnrollmentData = useMemo(() => {
    console.log('🔄 Processando dados do histórico...');
    console.log('👤 Usuário:', user);
    console.log('📝 Matrículas:', enrollments.length);
    console.log('👥 Usuários:', usuarios.length);
    console.log('📚 Cursos:', cursos.length);
    console.log('🏢 Empresas:', empresas.length);
    
    let enrollmentsHistory: EnrollmentHistory[] = [];
    if (!user || !enrollments.length) {
      console.log('⚠️ Retornando array vazio - sem usuário ou matrículas');
      return enrollmentsHistory;
    }

    let usersToProcess = usuarios;
    
    if (user.profile === 'Aluno') {
      usersToProcess = usuarios.filter(u => u.email === user.email);
      console.log('🎓 Filtro de Aluno aplicado, usuários:', usersToProcess.length);
    } else if (user.profile === 'Gestor de Empresa') {
      const userCompanyId = usuarios.find(u => u.email === user.email)?.companyId;
      usersToProcess = usuarios.filter(u => u.companyId === userCompanyId);
      console.log('👔 Filtro de Gestor aplicado, usuários:', usersToProcess.length);
    } else if (user.profile === 'Instrutor') {
        const instructor = allInstructors.find(i => i.email === user.email);
        const instructorCourses = cursos.filter(c => c.instructorId === instructor?.id).map(c => c.id);
        usersToProcess = usuarios.filter(u => enrollments.some(e => e.userId === u.id && instructorCourses.includes(e.courseId)));
        console.log('👨‍🏫 Filtro de Instrutor aplicado, usuários:', usersToProcess.length);
    } else {
      console.log('👑 Administrador - todos os usuários disponíveis');
    }
    
    console.log('📊 Dados detalhados:');
    console.log('  - Matrículas:', enrollments);
    console.log('  - Usuários para processar:', usersToProcess);
    console.log('  - Cursos:', cursos);
    console.log('  - Empresas:', empresas);

    enrollments.forEach((enrollment, index) => {
      const user = usersToProcess.find(u => u.id === enrollment.userId);
      const curso = cursos.find(c => c.id === enrollment.courseId);
      const empresa = empresas.find(c => c.id === user?.companyId);
      
      console.log(`📋 Matrícula ${index + 1}:`, {
        enrollmentId: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        userFound: !!user,
        courseFound: !!curso,
        empresaFound: !!empresa
      });
      
        enrollmentsHistory.push({
          ...enrollment,
        userName: user?.name || 'Usuário Desconhecido',
        userAvatar: user?.avatar || 'https://placehold.co/40x40.png',
        userHint: user?.hint || '',
        courseName: curso?.titulo ?? 'Curso Desconhecido',
        companyId: user?.companyId || '',
        companyName: empresa?.name ?? 'Empresa Desconhecida'
      });
    });
    
    console.log('✅ Histórico processado:', enrollmentsHistory.length, 'registros');
    return enrollmentsHistory;
  }, [user, enrollments, usuarios, cursos, empresas]);
  
  const filteredUsersForSelect = useMemo(() => {
    if (filterCompany === 'all') return baseEnrollmentData.map(e => ({id: e.userId, name: e.userName})).filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
    return baseEnrollmentData.filter(e => e.companyId === filterCompany).map(e => ({id: e.userId, name: e.userName})).filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
  }, [filterCompany, baseEnrollmentData]);
  
  const filteredCompaniesForSelect = useMemo(() => {
    const companyIds = new Set(baseEnrollmentData.map(e => e.companyId));
    return empresas.filter(c => companyIds.has(c.id));
  }, [baseEnrollmentData, empresas]);

  const baseScheduledClassData = useMemo(() => {
    console.log('🔄 Processando dados de agendamentos concluídos...');
    console.log('📝 Agendamentos:', scheduledClasses.length);
    console.log('📚 Cursos:', cursos.length);
    console.log('👥 Usuários:', usuarios.length);
    console.log('🏢 Empresas:', empresas.length);
    
    let scheduledClassesHistory: ScheduledClassHistory[] = [];
    if (!user || !scheduledClasses.length) {
      console.log('⚠️ Retornando array vazio - sem usuário ou agendamentos');
      return scheduledClassesHistory;
    }

    scheduledClasses.forEach((scheduledClass, index) => {
      const curso = cursos.find(c => c.id === scheduledClass.courseId);
      const instrutor = usuarios.find(u => u.id === scheduledClass.instructorId);
      
      console.log(`📋 Agendamento ${index + 1}:`, {
        scheduledClassId: scheduledClass.id,
        courseId: scheduledClass.courseId,
        instructorId: scheduledClass.instructorId,
        courseFound: !!curso,
        instructorFound: !!instrutor,
        studentCount: scheduledClass.studentIds.length
      });
      
      scheduledClassesHistory.push({
        ...scheduledClass,
        courseName: curso?.titulo || 'Curso Desconhecido',
        instructorName: instrutor?.name || 'Instrutor Desconhecido',
        studentCount: scheduledClass.studentIds.length,
        completionDate: scheduledClass.updatedAt
      });
    });
    
    console.log('✅ Agendamentos processados:', scheduledClassesHistory.length, 'registros');
    return scheduledClassesHistory;
  }, [user, scheduledClasses, cursos, usuarios, empresas]);

  const filteredScheduledClasses = useMemo(() => {
    console.log('🔍 Aplicando filtros aos agendamentos...');
    console.log('📊 Dados base:', baseScheduledClassData.length);
    console.log('🔎 Filtros ativos:', {
      searchQuery,
      filterCourse,
      filterCompany,
      filterStudent,
      dateRange
    });
    
    let filtered = baseScheduledClassData.filter(sc => {
      const searchMatch = !searchQuery || sc.courseName.toLowerCase().includes(searchQuery.toLowerCase()) || sc.instructorName.toLowerCase().includes(searchQuery.toLowerCase());
      const courseMatch = filterCourse === 'all' || sc.courseId === filterCourse;
      const dateMatch = !dateRange?.from || !sc.completionDate || (sc.completionDate >= dateRange.from && sc.completionDate <= (dateRange.to || dateRange.from));
      
      const matches = searchMatch && courseMatch && dateMatch;
      
      if (!matches) {
        console.log('❌ Agendamento filtrado:', {
          courseName: sc.courseName,
          instructorName: sc.instructorName,
          searchMatch,
          courseMatch,
          dateMatch
        });
      }
      
      return matches;
    });

    console.log('✅ Após filtros:', filtered.length, 'registros');

    if (sortDescriptor.column) {
      filtered.sort((a, b) => {
        const aVal = a[sortDescriptor.column! as keyof ScheduledClassHistory];
        const bVal = b[sortDescriptor.column! as keyof ScheduledClassHistory];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        let cmp = 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
            cmp = aVal.localeCompare(bVal);
        } else if (aVal instanceof Date && bVal instanceof Date) {
            cmp = aVal.getTime() - bVal.getTime();
        } else {
            if (aVal < bVal) cmp = -1;
            if (aVal > bVal) cmp = 1;
        }

        return sortDescriptor.direction === 'ascending' ? cmp : -cmp;
      });
    }

    return filtered;
  }, [searchQuery, filterCourse, filterCompany, filterStudent, dateRange, baseScheduledClassData, sortDescriptor]);

  const filteredHistory = useMemo(() => {
    console.log('🔍 Aplicando filtros...');
    console.log('📊 Dados base:', baseEnrollmentData.length);
    console.log('🔎 Filtros ativos:', {
      searchQuery,
      filterCourse,
      filterCompany,
      filterStudent,
      dateRange
    });
    
    let filtered = baseEnrollmentData.filter(e => {
      const searchMatch = !searchQuery || e.userName.toLowerCase().includes(searchQuery.toLowerCase()) || e.courseName.toLowerCase().includes(searchQuery.toLowerCase());
      const courseMatch = filterCourse === 'all' || e.courseId === filterCourse;
      const companyMatch = filterCompany === 'all' || e.companyId === filterCompany;
      const studentMatch = filterStudent === 'all' || e.userId === filterStudent;
      const dateMatch = !dateRange?.from || !e.completionDate || (e.completionDate >= dateRange.from && e.completionDate <= (dateRange.to || dateRange.from));
      
      const matches = searchMatch && courseMatch && companyMatch && studentMatch && dateMatch;
      
      if (!matches) {
        console.log('❌ Item filtrado:', {
          userName: e.userName,
          courseName: e.courseName,
          searchMatch,
          courseMatch,
          companyMatch,
          studentMatch,
          dateMatch
        });
      }
      
      return matches;
    });

    console.log('✅ Após filtros:', filtered.length, 'registros');

    if (sortDescriptor.column) {
      filtered.sort((a, b) => {
        const aVal = (a as any)[sortDescriptor.column!];
        const bVal = (b as any)[sortDescriptor.column!];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        let cmp = 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
            cmp = aVal.localeCompare(bVal);
        } else if (aVal instanceof Date && bVal instanceof Date) {
            cmp = aVal.getTime() - bVal.getTime();
        } else {
            if (aVal < bVal) cmp = -1;
            if (aVal > bVal) cmp = 1;
        }

        return sortDescriptor.direction === 'ascending' ? cmp : -cmp;
      });
    }

    return filtered;
  }, [searchQuery, filterCourse, filterCompany, filterStudent, dateRange, baseEnrollmentData, sortDescriptor]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredHistory, currentPage]);

  useEffect(() => {
    setFilterStudent('all');
  }, [filterCompany]);

  const paginatedScheduledClasses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredScheduledClasses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredScheduledClasses, currentPage]);

  const totalPages = Math.ceil((viewMode === 'enrollments' ? filteredHistory.length : filteredScheduledClasses.length) / ITEMS_PER_PAGE);

  const isPageAllSelected = useMemo(() => {
    const currentData = viewMode === 'enrollments' ? paginatedHistory : paginatedScheduledClasses;
    return currentData.length > 0 && currentData.every(row => selectedRows.includes(row.id));
  }, [viewMode, paginatedHistory, paginatedScheduledClasses, selectedRows]);

  const handleSelectAll = (checked: boolean | string) => {
    if (checked) {
        const currentData = viewMode === 'enrollments' ? paginatedHistory : paginatedScheduledClasses;
        setSelectedRows(currentData.map(row => row.id));
    } else {
        const currentData = viewMode === 'enrollments' ? paginatedHistory : paginatedScheduledClasses;
        const paginatedIds = currentData.map(row => row.id);
        setSelectedRows(prev => prev.filter(id => !paginatedIds.includes(id)));
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
        setSelectedRows(prev => [...prev, id]);
    } else {
        setSelectedRows(prev => prev.filter(rowId => rowId !== id));
    }
  }
  
  const handleSort = (column: keyof EnrollmentHistory | keyof ScheduledClassHistory) => {
    if (sortDescriptor.column === column) {
      setSortDescriptor({ column, direction: sortDescriptor.direction === 'ascending' ? 'descending' : 'ascending' });
    } else {
      setSortDescriptor({ column, direction: 'ascending' });
    }
  };

  const generateCertificatePDF = async (enrollmentId: string) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return;

    try {
      // Usar o wrapper seguro para html2canvas
      const { safeHtml2Canvas } = await import('@/lib/html2canvas-dynamic');
      
      const CertComponent = () => (
        <div className="w-[800px] h-[600px] bg-white p-8 flex flex-col items-center justify-center border-2 border-gray-300">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Certificado de Conclusão</h1>
            <p className="text-xl text-gray-600 mb-4">
              Certificamos que <strong>{enrollment.userId}</strong>
            </p>
            <p className="text-lg text-gray-600 mb-8">
              concluiu com êxito o curso <strong>{enrollment.courseId}</strong>
            </p>
            <p className="text-lg text-gray-600 mb-8">
              em {enrollment.completionDate ? format(enrollment.completionDate, 'dd/MM/yyyy') : 'N/A'}
            </p>
            <div className="mt-8">
              <QRCode value={`CERT-${enrollment.id}`} size={100} />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Código de Verificação: CERT-{enrollment.id}
            </p>
          </div>
        </div>
      );

      const element = document.createElement('div');
      element.innerHTML = '<div id="cert-component"></div>';
      document.body.appendChild(element);

      const canvas = await safeHtml2Canvas(element.querySelector('#cert-component') as HTMLElement);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`certificado-${enrollment.id}.pdf`);

      document.body.removeChild(element);
    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
      // Fallback: gerar PDF simples sem html2canvas
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      pdf.setFontSize(16);
      pdf.text('Certificado de Conclusão', 20, 20);
      pdf.setFontSize(12);
      pdf.text(`Aluno: ${enrollment.userId}`, 20, 40);
      pdf.text(`Curso: ${enrollment.courseId}`, 20, 50);
      pdf.text(`Data: ${enrollment.completionDate ? format(enrollment.completionDate, 'dd/MM/yyyy') : 'N/A'}`, 20, 60);
      pdf.save(`certificado-${enrollment.id}-simples.pdf`);
    }
  };

  const handleBulkDownload = async () => {
    setIsDownloading(true);
    try {
      // Simplificado: gerar certificados individuais sem ZIP
      for (const enrollmentId of selectedRows) {
        const enrollment = enrollments.find(e => e.id === enrollmentId);
        if (enrollment && enrollment.approved) {
          try {
            await generateCertificatePDF(enrollmentId);
          } catch (error) {
            console.error(`Erro ao gerar certificado para ${enrollmentId}:`, error);
          }
        }
      }
      
      toast({
        title: "Sucesso",
        description: "Certificados gerados individualmente",
      });
    } catch (error) {
      console.error('Erro ao gerar certificados:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar certificados",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportXLSX = () => {
    if (viewMode === 'enrollments') {
    const data = filteredHistory.map(item => ({
      'ID': item.id,
      'Aluno': item.userName,
      'Curso': item.courseName,
      'Status': item.status,
      'Nota': item.grade || 'N/A',
      'Aprovado': item.approved ? 'Sim' : item.approved === false ? 'Não' : 'N/A',
      'Data de Conclusão': item.completionDate ? format(item.completionDate, 'dd/MM/yyyy') : 'N/A',
      'Empresa': item.companyName,
      'Data de Criação': item.createdAt ? format(item.createdAt, 'dd/MM/yyyy HH:mm') : 'N/A',
      'Última Atualização': item.updatedAt ? format(item.updatedAt, 'dd/MM/yyyy HH:mm') : 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Histórico');
    XLSX.writeFile(wb, 'historico-matriculas.xlsx');
    } else {
      const data = filteredScheduledClasses.map(item => ({
        'ID': item.id,
        'Curso': item.courseName,
        'Instrutor': item.instructorName,
        'Alunos': item.studentCount,
        'Data Agendada': format(item.scheduledDate, 'dd/MM/yyyy'),
        'Horário': `${item.startTime} - ${item.endTime}`,
        'Local': item.locationType,
        'Data de Conclusão': format(item.completionDate, 'dd/MM/yyyy'),
        'Data de Criação': item.createdAt ? format(item.createdAt, 'dd/MM/yyyy HH:mm') : 'N/A',
        'Última Atualização': item.updatedAt ? format(item.updatedAt, 'dd/MM/yyyy HH:mm') : 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Histórico de Cursos');
      XLSX.writeFile(wb, 'historico-cursos.xlsx');
    }
  };

  const SortableHeader = ({ column, label }: { column: keyof EnrollmentHistory | keyof ScheduledClassHistory; label: string; }) => (
    <TableHead className="cursor-pointer" onClick={() => handleSort(column)}>
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-4 w-4" />
      </div>
    </TableHead>
  );

  if (!user) {
    return <div>Carregando...</div>;
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
            <h1 className="text-2xl font-headline font-bold">Histórico de Conclusão</h1>
          </div>
           <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person face" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {viewMode === 'enrollments' ? 'Cursos Realizados' : 'Histórico de Cursos Concluídos'}
                  </CardTitle>
                  <CardDescription>
                    {viewMode === 'enrollments' 
                      ? 'Consulte o histórico de cursos concluídos pelos usuários.'
                      : 'Visualize os agendamentos de turmas que foram concluídos.'
                    }
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    {viewMode === 'scheduledClasses' && (
                      <Button
                        variant="outline"
                        onClick={() => setViewMode('enrollments')}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Voltar
                      </Button>
                    )}
                    <Button
                      variant={viewMode === 'enrollments' ? 'default' : 'outline'}
                      onClick={() => setViewMode('enrollments')}
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Matrículas
                    </Button>
                    <Button
                      variant={viewMode === 'scheduledClasses' ? 'default' : 'outline'}
                      onClick={() => setViewMode('scheduledClasses')}
                    >
                      <History className="mr-2 h-4 w-4" />
                      Histórico de Cursos
                    </Button>
                    {user.profile === 'Administrador' && viewMode === 'enrollments' && (
                      <AddEnrollmentDialog
                        onSave={handleAddEnrollment}
                        isOpen={isAddDialogOpen}
                        setIsOpen={setIsAddDialogOpen}
                        courses={cursos}
                        users={usuarios}
                      >
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Matrícula
                        </Button>
                      </AddEnrollmentDialog>
                    )}
                    <Button variant="outline" onClick={handleExportXLSX}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar XLSX
                    </Button>
                    {selectedRows.length > 0 && viewMode === 'enrollments' && (
                      <Button onClick={handleBulkDownload} disabled={isDownloading}>
                        <Download className="mr-2 h-4 w-4" />
                        {isDownloading ? 'Gerando...' : `Baixar Certificados (.zip)`}
                      </Button>
                    )}
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder={viewMode === 'enrollments' ? "Buscar por aluno ou curso..." : "Buscar por curso ou instrutor..."}
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-full md:w-[300px] justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Escolha um intervalo de datas</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                locale={ptBR}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="w-full grid md:grid-cols-3 gap-4">
                  <Select value={filterCourse} onValueChange={setFilterCourse}>
                    <SelectTrigger><SelectValue placeholder="Filtrar por curso" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Cursos</SelectItem>
                      {cursos.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.titulo || course.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterCompany} onValueChange={setFilterCompany} disabled={user.profile !== 'Administrador'}>
                    <SelectTrigger><SelectValue placeholder="Filtrar por empresa" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Empresas</SelectItem>
                      {filteredCompaniesForSelect.map(company => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStudent} onValueChange={setFilterStudent} disabled={user.profile === 'Aluno'}>
                    <SelectTrigger><SelectValue placeholder="Filtrar por aluno" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Alunos</SelectItem>
                      {filteredUsersForSelect.map(person => (
                        <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">
                      {viewMode === 'enrollments' ? 'Carregando matrículas...' : 'Carregando agendamentos...'}
                    </p>
                  </div>
                </div>
              ) : viewMode === 'enrollments' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox checked={isPageAllSelected} onCheckedChange={handleSelectAll} />
                      </TableHead>
                      <SortableHeader column="userName" label="Aluno" />
                      <SortableHeader column="courseName" label="Curso" />
                      <SortableHeader column="status" label="Status" />
                      <SortableHeader column="completionDate" label="Data de Conclusão" />
                      <TableHead className="text-center">Aprovado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedHistory.length > 0 ? paginatedHistory.map((item) => (
                      <TableRow key={item.id} data-state={selectedRows.includes(item.id) && "selected"}>
                        <TableCell>
                          <Checkbox checked={selectedRows.includes(item.id)} onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)} />
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={item.userAvatar} alt={item.userName} data-ai-hint={item.userHint} />
                              <AvatarFallback>{item.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{item.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.courseName}</TableCell>
                        <TableCell>
                          {user.profile === 'Administrador' ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-auto p-0">
                          <Badge variant={item.status === 'Concluído' ? 'default' : item.status === 'Em Progresso' ? 'secondary' : 'outline'}>
                            {item.status}
                          </Badge>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'Não Iniciado')}>
                                  <Badge variant="outline">Não Iniciado</Badge>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'Em Progresso')}>
                                  <Badge variant="secondary">Em Progresso</Badge>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'Concluído')}>
                                  <Badge variant="default">Concluído</Badge>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Badge variant={item.status === 'Concluído' ? 'default' : item.status === 'Em Progresso' ? 'secondary' : 'outline'}>
                              {item.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{item.completionDate ? format(item.completionDate, 'dd/MM/yyyy') : 'N/A'}</TableCell>
                        <TableCell className="text-center">
                          {item.approved === null || item.approved === undefined ? '--' :
                            item.approved ? 
                            <Badge>Aprovado</Badge> :
                            <Badge variant="destructive">Reprovado</Badge>
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {user.profile === 'Administrador' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => openEditDialog(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => openDeleteDialog(item)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="outline" 
                              size="icon" 
                              disabled={!item.approved}
                              onClick={() => router.push(`/cursos/${item.courseId}/certificado/${item.userId}`)}
                            >
                              <Award className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => openSendCertificateDialog(item)}
                              title="Enviar certificado por email"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                       <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                              Nenhum histórico encontrado com os filtros aplicados.
                          </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox checked={isPageAllSelected} onCheckedChange={handleSelectAll} />
                      </TableHead>
                      <SortableHeader column="courseName" label="Curso" />
                      <SortableHeader column="instructorName" label="Instrutor" />
                      <SortableHeader column="studentCount" label="Alunos" />
                      <SortableHeader column="scheduledDate" label="Data Agendada" />
                      <SortableHeader column="completionDate" label="Data de Conclusão" />
                      <SortableHeader column="status" label="Status" />
                      <TableHead className="text-center">Local</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedScheduledClasses.length > 0 ? paginatedScheduledClasses.map((item) => (
                      <TableRow key={item.id} data-state={selectedRows.includes(item.id) && "selected"}>
                        <TableCell>
                          <Checkbox checked={selectedRows.includes(item.id)} onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.courseName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="https://placehold.co/24x24.png" alt={item.instructorName} />
                              <AvatarFallback className="text-xs">
                                {item.instructorName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{item.instructorName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {item.studentCount} alunos
                          </Badge>
                        </TableCell>
                        <TableCell>{format(item.scheduledDate, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                        <TableCell>{format(item.completionDate, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'Concluída' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{item.locationType}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {user.profile === 'Administrador' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => openEditScheduledClassDialog(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => openDeleteScheduledClassDialog(item)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => router.push(`/agendamentos`)}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                       <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                              Nenhum agendamento concluído encontrado com os filtros aplicados.
                          </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t pt-4">
                 <div className="text-sm text-muted-foreground">
                    {selectedRows.length} de {viewMode === 'enrollments' ? filteredHistory.length : filteredScheduledClasses.length} linha(s) selecionada(s).
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4 mr-1"/>
                        Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        Próxima
                        <ChevronRight className="h-4 w-4 ml-1"/>
                    </Button>
                </div>
            </CardFooter>
          </Card>
        </main>
      </SidebarInset>

      {/* Diálogos de CRUD de matrículas */}
      <EditEnrollmentDialog
        enrollmentData={selectedEnrollment}
        onSave={handleEditEnrollment}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        courses={cursos}
        users={usuarios}
      />

      <DeleteEnrollmentDialog
        enrollmentData={selectedEnrollment}
        onDelete={handleDeleteEnrollment}
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
      />

      {/* Diálogos de CRUD de agendamentos */}
      <EditScheduledClassDialog
        scheduledClassData={selectedScheduledClass}
        onSave={handleEditScheduledClass}
        isOpen={isEditScheduledClassDialogOpen}
        setIsOpen={setIsEditScheduledClassDialogOpen}
        courses={cursos}
        instructors={instrutores}
      />

      <DeleteScheduledClassDialog
        scheduledClassData={selectedScheduledClass}
        onDelete={handleDeleteScheduledClass}
        isOpen={isDeleteScheduledClassDialogOpen}
        setIsOpen={setIsDeleteScheduledClassDialogOpen}
      />

      {/* Diálogo de envio de certificado */}
      <SendCertificateDialog
        enrollment={selectedCertificateData?.enrollment}
        course={selectedCertificateData?.course}
        user={selectedCertificateData?.user}
        isOpen={isSendCertificateDialogOpen}
        setIsOpen={setIsSendCertificateDialogOpen}
      />
    </SidebarProvider>
  );
}
