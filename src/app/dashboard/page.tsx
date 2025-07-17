
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
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
  MoreHorizontal,
  Building,
  UserCheck,
  LogOut,
  CalendarDays,
  CalendarIcon,
  Users,
  Settings,
  History,
  Award,
  Book,
  Database,
  FileDown,
} from "lucide-react";
import { GraduationCap } from "@/components/icons";
import { SidebarLogo } from "@/components/app-logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
// Removido: import { courses as allCourses, users as allUsers, instructors as allInstructors, companies as allCompanies, roles as allRoles } from "@/lib/data";
import type { UserSession } from "../page";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarMenuComponent } from "@/components/sidebar-menu";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import type { Course } from "@/lib/definitions";
import jsPDF from "jspdf";
// Removido: import html2canvas from "html2canvas"; - causa problemas de SSR
// Adicionado: imports dos serviços Firebase
import { getCursos } from "@/lib/cursos-firebase";
import { getUsers } from "@/lib/users-firebase";
import { getInstrutores } from "@/lib/instrutores-firebase";
import { getEmpresas } from "@/lib/empresas-firebase";
import { enrollmentService } from "@/lib/firebase-db";
import { useToast } from "@/hooks/use-toast";


const DashboardChart = dynamic(
  () => import('@/components/charts').then(mod => mod.DashboardChart),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[250px]" />
  }
);


// --- Admin Dashboard ---
const AdminDashboard = () => {
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterStudent, setFilterStudent] = useState('all');
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar dados do Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Carregando dados do dashboard...');
        const [cursosData, usuariosData, empresasData, matriculasData] = await Promise.all([
          getCursos(),
          getUsers(),
          getEmpresas(),
          enrollmentService.getAll()
        ]);

        console.log('📊 Dados carregados:');
        console.log('  - Cursos:', cursosData.length);
        console.log('  - Usuários:', usuariosData.length);
        console.log('  - Empresas:', empresasData.length);
        console.log('  - Matrículas:', matriculasData.length);

        setCourses(cursosData);
        setUsers(usuariosData);
        setCompanies(empresasData);
        setEnrollments(matriculasData);
        setLoading(false);
      } catch (error) {
        console.error('❌ Erro ao carregar dados do dashboard:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados do dashboard",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const filteredUsersForSelect = useMemo(() => {
    if (filterCompany === 'all') {
      return users.filter(u => u.profile === 'Aluno');
    }
    return users.filter(p => p.companyId === filterCompany && p.profile === 'Aluno');
  }, [users, filterCompany]);

  useEffect(() => {
    setFilterStudent('all');
  }, [filterCompany]);

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(u => u.profile === 'Aluno');
    if (filterCompany !== 'all') {
        filtered = filtered.filter(u => u.companyId === filterCompany);
    }
    if (filterStudent !== 'all') {
        filtered = filtered.filter(u => u.id === filterStudent);
    }
    return filtered;
  }, [users, filterCompany, filterStudent]);
  

  const { totalUsers, totalEnrollments, totalCompletedEnrollments, completionRate } = useMemo(() => {
    const totalUsers = filteredUsers.length;
    const userEnrollments = enrollments.filter(e => filteredUsers.some(u => u.id === e.userId));
    const totalEnrollments = userEnrollments.length;
    const totalCompletedEnrollments = userEnrollments.filter(e => e.status === 'Concluído' && e.approved).length;
    const completionRate = totalEnrollments > 0 ? Math.round((totalCompletedEnrollments / totalEnrollments) * 100) : 0;
    return { totalUsers, totalEnrollments, totalCompletedEnrollments, completionRate };
  }, [filteredUsers, enrollments]);

  const totalCourses = useMemo(() => courses.length, [courses]);
  
  const courseData = useMemo(() => {
    return courses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.courseId === course.id && filteredUsers.some(u => u.id === e.userId));
      const enrolledCount = courseEnrollments.length;
      const completedCount = courseEnrollments.filter(e => e.status === 'Concluído' && e.approved).length;
      return {
        ...course,
        enrolled: enrolledCount,
        completed: completedCount,
      };
    }).filter(c => c.enrolled > 0);
  }, [courses, enrollments, filteredUsers]);

  const chartData = useMemo(() => {
    return courseData.map(course => ({
      name: course.titulo || course.title,
      "Matriculados": course.enrolled,
      "Concluídos": course.completed
    })).slice(0, 5);
  }, [courseData]);

  const recentEnrollments = useMemo(() => {
    const userEnrollments = enrollments
      .filter(e => filteredUsers.some(u => u.id === e.userId))
      .map(enrollment => {
        const user = users.find(u => u.id === enrollment.userId);
        const course = courses.find(c => c.id === enrollment.courseId);
        return {
          id: enrollment.id,
            courseId: enrollment.courseId,
          userId: enrollment.userId,
          user: { 
            name: user?.name || 'Usuário Desconhecido', 
            avatar: user?.avatar || 'https://placehold.co/40x40.png', 
            hint: user?.hint || 'person face' 
          },
          course: course?.titulo || course?.title || 'Curso Desconhecido',
          date: enrollment.completionDate || enrollment.createdAt || new Date()
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
    
    return userEnrollments;
  }, [enrollments, filteredUsers, users, courses]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Carregando Dashboard...</CardTitle>
            <CardDescription>Aguarde enquanto carregamos os dados do Firebase.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>Filtros do Dashboard</CardTitle>
            <CardDescription>Use os filtros abaixo para refinar os dados exibidos no painel.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
            <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger>
                    <SelectValue placeholder="Filtrar por empresa" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as Empresas</SelectItem>
                    {companies.map((company: any) => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={filterStudent} onValueChange={setFilterStudent} disabled={filteredUsersForSelect.length === 0}>
                <SelectTrigger>
                    <SelectValue placeholder="Filtrar por aluno" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Alunos</SelectItem>
                    {filteredUsersForSelect.map((person: any) => (
                    <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Total de Cursos</CardTitle>
            <CardDescription>Nº de cursos ativos</CardDescription>
          </CardHeader>
          <CardContent><div className="text-4xl font-bold">{totalCourses}</div></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Usuários Ativos</CardTitle>
            <CardDescription>Total de usuários cadastrados</CardDescription>
          </CardHeader>
          <CardContent><div className="text-4xl font-bold">{totalUsers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Taxa de Conclusão</CardTitle>
            <CardDescription>% geral de conclusão dos cursos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{completionRate}%</div>
            <Progress value={completionRate} className="h-3" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Visão Geral das Matrículas</CardTitle>
              <CardDescription>Status de todos os cursos</CardDescription>
            </div>
            <Link href="/cursos" passHref><Button variant="outline">Ver Todos</Button></Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Nome do Curso</TableHead><TableHead className="text-center">Matriculados</TableHead><TableHead>Progresso de Conclusão</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {courseData.length > 0 ? courseData.slice(0, 5).map((course) => {
                  const progress = course.enrolled > 0 ? Math.round((course.completed / course.enrolled) * 100) : 0;
                  return (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.titulo || course.title}</TableCell>
                      <TableCell className="text-center"><Badge variant="secondary">{course.enrolled}</Badge></TableCell>
                      <TableCell><div className="flex items-center gap-2"><Progress value={progress} className="w-24 h-2" /><span className="text-sm text-muted-foreground">{progress}%</span></div></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent><Link href={`/cursos/${course.id}`} passHref><DropdownMenuItem>Ver Detalhes</DropdownMenuItem></Link></DropdownMenuContent></DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                }) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            Nenhuma matrícula encontrada com os filtros aplicados.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Progresso dos Cursos</CardTitle>
            <CardDescription>Matriculados vs. Concluídos nos principais cursos.</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
                <DashboardChart data={chartData} />
            ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    Nenhum dado para exibir no gráfico.
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader><CardTitle className="font-headline">Matrículas Recentes</CardTitle><CardDescription>Últimas matrículas.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Usuário</TableHead><TableHead>Curso</TableHead><TableHead className="text-right">Data</TableHead></TableRow></TableHeader>
            <TableBody>
              {recentEnrollments.length > 0 ? recentEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={enrollment.user.avatar} alt={enrollment.user.name} data-ai-hint={enrollment.user.hint} />
                        <AvatarFallback>{enrollment.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Link href={`/historico?user=${enrollment.userId}`} passHref>
                        <span className="font-medium hover:underline cursor-pointer text-primary">
                          {enrollment.user.name}
                        </span>
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>{enrollment.course}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{format(enrollment.date, 'dd/MM/yyyy')}</TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        Nenhuma matrícula recente encontrada.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

// --- Student Dashboard ---
const StudentDashboard = ({ user }: { user: UserSession }) => {
    const [courses, setCourses] = useState<any[]>([]);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Carregar dados do Firebase
    useEffect(() => {
        const loadData = async () => {
            try {
                const [cursosData, matriculasData] = await Promise.all([
                    getCursos(),
                    enrollmentService.getByUser(user.id)
                ]);
                setCourses(cursosData);
                setEnrollments(matriculasData);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao carregar dados do aluno:', error);
                toast({
                    title: "Erro",
                    description: "Falha ao carregar dados do aluno",
                    variant: "destructive",
                });
                setLoading(false);
            }
        };
        loadData();
    }, [user.id, toast]);

    const studentData = useMemo(() => {
        if (loading) return { inProgress: [], completed: [] };
        
        const inProgress = enrollments
            .filter((e: any) => e.status === 'Em Progresso')
            .map((e: any) => courses.find((c: any) => c.id === e.courseId))
            .filter((c): c is Course => c !== undefined);
            
        const completed = enrollments
            .filter((e: any) => e.status === 'Concluído' && e.approved)
            .map((e: any) => courses.find((c: any) => c.id === e.courseId))
            .filter((c): c is Course => c !== undefined);
            
        return { inProgress, completed };
    }, [enrollments, courses, loading]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Book className="text-primary"/> Cursos em Andamento</CardTitle>
                        <CardDescription>Continue seu aprendizado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Skeleton className="h-12" />
                            <Skeleton className="h-12" />
                            <Skeleton className="h-12" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Award className="text-primary"/> Cursos Concluídos</CardTitle>
                        <CardDescription>Veja seus certificados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Skeleton className="h-12" />
                            <Skeleton className="h-12" />
                            <Skeleton className="h-12" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Book className="text-primary"/> Cursos em Andamento</CardTitle>
                    <CardDescription>Continue seu aprendizado.</CardDescription>
                </CardHeader>
                <CardContent>
                    {studentData.inProgress.length > 0 ? (
                        <ul className="space-y-3">
                            {studentData.inProgress.map(course => (
                                <li key={course.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                    <span className="font-medium">{course.title}</span>
                                    <Button asChild size="sm"><Link href={`/cursos/${course.id}`}>Continuar</Link></Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">Nenhum curso em andamento.</p>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Award className="text-primary"/> Cursos Concluídos</CardTitle>
                    <CardDescription>Veja seus certificados.</CardDescription>
                </CardHeader>
                <CardContent>
                     {studentData.completed.length > 0 ? (
                        <ul className="space-y-3">
                            {studentData.completed.map(course => (
                                <li key={course.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                    <span className="font-medium">{course.title}</span>
                                    <Button asChild variant="outline" size="sm"><Link href={`/cursos/${course.id}/certificado/${user.id}`}>Ver Certificado</Link></Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">Nenhum curso concluído ainda.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

// --- Instructor/Company Manager Dashboard ---
const ManagerDashboard = ({ user }: { user: UserSession }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar dados do Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cursosData, usuariosData, empresasData, matriculasData, instrutoresData] = await Promise.all([
          getCursos(),
          getUsers(),
          getEmpresas(),
          enrollmentService.getAll(),
          getInstrutores()
        ]);
        setCourses(cursosData);
        setUsers(usuariosData);
        setCompanies(empresasData);
        setEnrollments(matriculasData);
        setInstructors(instrutoresData);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do gestor:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados do gestor",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);

  const { filteredUsers, title, description, companyName } = useMemo(() => {
    if (loading) return { filteredUsers: [], title: '', description: '', companyName: '' };
    
    if (user.profile === 'Instrutor') {
      const instructor = instructors.find((i: any) => i.id === user.id);
      const instructorCourseIds = courses.filter((c: any) => c.instructorId === instructor?.id).map((c: any) => c.id);
      const instructorEnrollments = enrollments.filter((e: any) => instructorCourseIds.includes(e.courseId));
      const instructorUserIds = [...new Set(instructorEnrollments.map((e: any) => e.userId))];
      
      return {
        filteredUsers: users.filter((u: any) => instructorUserIds.includes(u.id)),
        title: "Dashboard do Instrutor",
        description: "Visão geral dos seus cursos e alunos.",
        companyName: ''
      }
    } else { // Gestor de Empresa
      const company = companies.find((c: any) => c.id === user.companyId);
      return {
        filteredUsers: users.filter((u: any) => u.companyId === user.companyId),
        title: "Dashboard da Empresa",
        description: `Visão geral dos colaboradores da ${company?.name}.`,
        companyName: company?.name || ''
      }
    }
  }, [user, loading, courses, users, companies, enrollments, instructors]);

  const { totalUsers, totalEnrollments, completionRate } = useMemo(() => {
    const totalUsers = filteredUsers.length;
    const userEnrollments = enrollments.filter((e: any) => filteredUsers.some((u: any) => u.id === e.userId));
    const totalEnrollments = userEnrollments.length;
    const totalCompletedEnrollments = userEnrollments.filter((e: any) => e.status === 'Concluído' && e.approved).length;
    const completionRate = totalEnrollments > 0 ? Math.round((totalCompletedEnrollments / totalEnrollments) * 100) : 0;
    return { totalUsers, totalEnrollments, completionRate };
  }, [filteredUsers, enrollments]);

  const chartData = useMemo(() => {
    let coursesToConsider = courses;
    if (user.profile === 'Instrutor') {
      coursesToConsider = courses.filter((c: any) => c.instructorId === user.id);
    }

    return coursesToConsider.map((course: any) => {
      const courseEnrollments = enrollments.filter((e: any) => e.courseId === course.id && filteredUsers.some((u: any) => u.id === e.userId));
      const enrolledCount = courseEnrollments.length;
      const completedCount = courseEnrollments.filter((e: any) => e.status === 'Concluído' && e.approved).length;
      return { name: course.title, "Matriculados": enrolledCount, "Concluídos": completedCount };
    }).filter((d: any) => d.Matriculados > 0).slice(0, 5);
  }, [user, filteredUsers, courses, enrollments]);


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Progresso dos Cursos</CardTitle>
            <CardDescription>Matriculados vs. Concluídos nos cursos relevantes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-headline">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader><CardTitle>Total de Colaboradores</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-bold">{totalUsers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total de Matrículas</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-bold">{totalEnrollments}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Taxa de Conclusão</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{completionRate}%</div>
            <Progress value={completionRate} className="h-3" />
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle className="font-headline">Progresso dos Cursos</CardTitle>
            <CardDescription>Matriculados vs. Concluídos nos cursos relevantes.</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardChart data={chartData} />
          </CardContent>
        </Card>
    </>
  );
};


export default function Dashboard() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useFirebaseAuth();
  const [user, setUser] = useState<UserSession | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  console.log('Dashboard render:', { pathname, user });
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    console.log('Dashboard useEffect: Carregando sessão...');
    const sessionData = localStorage.getItem('userSession');
    if (sessionData) {
      const parsedSession = JSON.parse(sessionData);
      console.log('Dashboard useEffect: Sessão encontrada:', parsedSession);
      
      // Criar usuário baseado na sessão do Firebase
      const fullUser = {
          id: parsedSession.id,
          name: parsedSession.name,
          email: parsedSession.email,
        profile: parsedSession.profile || 'Administrador', // Perfil com acesso total
        companyId: parsedSession.companyId || '',
        avatar: parsedSession.avatar || '',
        hint: parsedSession.hint || '',
          enrollments: [],
        role: parsedSession.role || 'user',
        status: parsedSession.status || 'Ativo'
        };
      
      console.log('Dashboard useEffect: Usuário final:', fullUser);
      
      if (fullUser) {
        setUser({ ...parsedSession, id: fullUser.id, companyId: fullUser.companyId });
        // Definir permissões baseadas no perfil
        const permissions = {
          'Administrador': ['dashboard:view', 'scheduling:view', 'scheduling:create', 'scheduling:delete', 'history:view', 'reports:view', 'db_courses:view', 'db_courses:create', 'db_courses:update', 'db_courses:delete', 'db_companies:view', 'db_companies:create', 'db_companies:update', 'db_companies:delete', 'db_users:view', 'db_users:create', 'db_users:update', 'db_users:delete', 'db_instructors:view', 'db_instructors:create', 'db_instructors:update', 'db_instructors:delete', 'settings:manage'],
          'Instrutor': ['dashboard:view', 'db_courses:view', 'db_courses:update'],
          'Aluno': ['dashboard:view', 'history:view', 'db_courses:view'],
          'Gestor de Empresa': ['dashboard:view', 'history:view', 'reports:view']
        };
        setUserPermissions(permissions[fullUser.profile as keyof typeof permissions] || ['dashboard:view']);
      }
      console.log('Dashboard useEffect: Usuário configurado com sucesso');
    } else {
      console.log('Dashboard useEffect: Nenhuma sessão encontrada, redirecionando...');
      router.push('/');
    }
  }, [router]);

  const hasPermission = (permission: string) => userPermissions.includes(permission);
  
  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('userSession');
    router.push('/');
  };

  const renderDashboardContent = () => {
    if (!user) return null;
    switch (user.profile) {
      case 'Administrador':
        return <AdminDashboard />;
      case 'Aluno':
        return <StudentDashboard user={user} />;
      case 'Instrutor':
      case 'Gestor de Empresa':
        return <ManagerDashboard user={user} />;
      default:
        return <p>Dashboard não disponível para este perfil.</p>;
    }
  };

  const handleExportPDF = async () => {
    const input = printRef.current;
    if (!input) return;
    
    try {
      // Usar o wrapper seguro para html2canvas
      const { safeHtml2Canvas } = await import('@/lib/html2canvas-dynamic');
      const canvas = await safeHtml2Canvas(input, { 
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false
      });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Definir margens (em mm)
    const margin = 20;
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2) - 30; // Espaço para título e rodapé
    
    // Calcular dimensões da imagem mantendo proporção
    const imgAspectRatio = canvas.width / canvas.height;
    const contentAspectRatio = contentWidth / contentHeight;
    
    let imgWidth, imgHeight;
    if (imgAspectRatio > contentAspectRatio) {
      // Imagem mais larga que o conteúdo
      imgWidth = contentWidth;
      imgHeight = contentWidth / imgAspectRatio;
    } else {
      // Imagem mais alta que o conteúdo
      imgHeight = contentHeight;
      imgWidth = contentHeight * imgAspectRatio;
    }
    
    // Centralizar a imagem
    const x = margin + (contentWidth - imgWidth) / 2;
    const y = margin + 25; // Espaço para título
    
    // Adicionar título ao PDF
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Dashboard - Sistema de Gestão de Cursos', pdfWidth / 2, margin, { align: 'center' });
    
    // Adicionar data
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    pdf.text(`Gerado em: ${currentDate}`, pdfWidth / 2, margin + 8, { align: 'center' });
    
    // Adicionar a imagem do dashboard
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    
    // Adicionar rodapé
    const footerY = pdfHeight - 15;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Sistema de Gestão de Cursos - Dashboard', pdfWidth / 2, footerY, { align: 'center' });
    
    // Adicionar número da página
    pdf.setFontSize(8);
    pdf.text(`Página 1`, pdfWidth - margin, footerY, { align: 'right' });
    
      pdf.save("dashboard_seanutri.pdf");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Fallback: gerar PDF simples sem html2canvas
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.setFontSize(16);
      pdf.text('Dashboard - Sistema de Gestão de Cursos', 20, 20);
      pdf.setFontSize(12);
      pdf.text('Relatório gerado em: ' + new Date().toLocaleDateString('pt-BR'), 20, 30);
      pdf.save("dashboard_seanutri_simples.pdf");
    }
  };

  if (!user) {
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
          <SidebarMenuComponent user={user} hasPermission={hasPermission} />
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
            <h1 className="text-2xl font-headline font-bold">Dashboard</h1>
            {/* Removido: <SupabaseStatusBadge /> */}
          </div>
          <div className="flex items-center gap-4">
             {user.profile === 'Administrador' && (
                <Button onClick={handleExportPDF} variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar PDF
                </Button>
             )}
             <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person face" />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6" ref={printRef}>
          <div className="space-y-6">
            {renderDashboardContent()}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

