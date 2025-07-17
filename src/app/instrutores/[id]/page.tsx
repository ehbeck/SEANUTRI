
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  ChevronLeft,
  FileText,
  LayoutDashboard,
  Users,
  Building,
  UserCheck,
  LogOut,
  Mail,
  CalendarDays,
  CalendarIcon,
  Settings,
  History,
  Database,
} from "lucide-react";
import { GraduationCap } from "@/components/icons";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { 
  instructors as allInstructors,
  courses as allCourses,
  users as allUsers,
} from "@/lib/data";
import type { Course } from "@/lib/definitions";
import type { UserSession } from "@/app/page";
import { ThemeToggle } from "@/components/theme-toggle";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

interface CourseWithEnrollmentCount extends Course {
  enrolledCount: number;
}

export default function InstrutorDetalhePage() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams() as { id: string };
  
  const [user, setUser] = useState<UserSession | null>(null);

  const instructor = useMemo(() => allInstructors.find(i => i.id === params.id), [params.id]);
  
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

  const instructorCourses: CourseWithEnrollmentCount[] = useMemo(() => {
    if (!params.id) return [];
    return allCourses
      .filter(course => course.instructorId === params.id)
      .map(course => {
        const enrolledCount = allUsers.filter(p => p.enrollments.some(e => e.courseId === course.id)).length;
        return { ...course, enrolledCount };
      });
  }, [params.id]);


  if (!instructor || !user || user.profile !== 'Administrador') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Acesso negado ou instrutor não encontrado.</p>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    router.push('/');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/dashboard" passHref className="flex items-center gap-3">
            <GraduationCap className="size-8 text-sidebar-primary" />
            <h1 className="font-headline text-xl font-bold text-sidebar-foreground">Seanutri</h1>
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
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-headline font-bold truncate">{instructor.name}</h1>
          </div>
           <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person face" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
               <Avatar className="h-16 w-16">
                  <AvatarImage src={instructor.avatar} alt={instructor.name} data-ai-hint={instructor.hint} />
                  <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
              <div>
                <CardTitle className="font-headline text-2xl">{instructor.name}</CardTitle>
                <CardDescription>Informações de contato e especialização.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
               <div className="flex items-center gap-3">
                 <Mail className="h-5 w-5 text-muted-foreground" />
                 <span className="text-sm">{instructor.email}</span>
               </div>
               <div className="flex items-center gap-3">
                 <BookOpen className="h-5 w-5 text-muted-foreground" />
                 <span className="text-sm font-medium">{instructor.specialization}</span>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cursos Ministrados</CardTitle>
              <CardDescription>Lista de cursos que estão sob a responsabilidade deste instrutor.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título do Curso</TableHead>
                    <TableHead className="text-center">Alunos Matriculados</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instructorCourses.length > 0 ? instructorCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{course.enrolledCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <Button asChild variant="outline" size="sm">
                          <Link href={`/cursos/${course.id}`}>Ver Curso</Link>
                         </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Nenhum curso atribuído a este instrutor.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
