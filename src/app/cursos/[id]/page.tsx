
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ChevronLeft,
  FileText,
  LayoutDashboard,
  Users,
  Pencil,
  Building,
  UserCheck,
  LogOut,
  User as UserIcon,
  CalendarDays,
  CalendarIcon,
  Settings,
  History,
  PlusCircle,
  Trash2,
  Database,
} from "lucide-react";
import { GraduationCap } from "@/components/icons";
import { SidebarLogo } from "@/components/app-logo";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { 
  roles as allRoles,
} from "@/lib/data";
import type { UserSession } from "@/app/page";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ThemeToggle } from "@/components/theme-toggle";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { BulkEnrollDialog } from "@/components/cursos-dialogs";
import { getCursoById, updateCurso, type Curso } from "@/lib/cursos-firebase";
import { getUsers } from "@/lib/users-firebase";

const EditCourseDialog = ({ course, onSave, children }: { course: Curso, onSave: (data: { titulo: string, descricao: string }) => void, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [titulo, setTitulo] = useState(course.titulo);
  const [descricao, setDescricao] = useState(course.descricao);

  useEffect(() => {
    if (isOpen) {
        setTitulo(course.titulo);
        setDescricao(course.descricao);
    }
  }, [isOpen, course]);

  const handleSave = () => {
    onSave({ titulo, descricao });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Curso</DialogTitle>
          <DialogDescription>
            Faça alterações no título e na descrição do curso.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={5} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditSyllabusDialog = ({ course, onSave, children }: { course: Curso, onSave: (conteudo: string) => void, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conteudo, setConteudo] = useState(course.conteudo || '');

  useEffect(() => {
    if (isOpen) {
        setConteudo(course.conteudo || '');
    }
  },[isOpen, course]);

  const handleSave = () => {
    onSave(conteudo);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Conteúdo Programático</DialogTitle>
          <DialogDescription>
            Edite o conteúdo programático do curso.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea 
            value={conteudo} 
            onChange={(e) => setConteudo(e.target.value)} 
            placeholder="Descreva o conteúdo programático do curso..."
            rows={10}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Conteúdo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const AssignInstructorDialog = ({ course, onSave, children }: { course: Curso, onSave: (instructorId: string) => void, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | undefined>(course.instrutorId);
  const [instrutores, setInstrutores] = useState<any[]>([]);
  
  useEffect(() => {
    const loadInstrutores = async () => {
      try {
        const users = await getUsers();
        const instrutoresFiltrados = users.filter(u => u.profile === 'Instrutor');
        setInstrutores(instrutoresFiltrados);
      } catch (error) {
        console.error('Erro ao carregar instrutores:', error);
      }
    };
    
    if (isOpen) {
      loadInstrutores();
    }
  }, [isOpen]);
  
  const handleSave = () => {
    if (selectedInstructorId) {
      onSave(selectedInstructorId);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atribuir Instrutor</DialogTitle>
          <DialogDescription>
            Selecione o instrutor que será responsável por este curso.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={selectedInstructorId} onValueChange={setSelectedInstructorId}>
            <div className="space-y-2 max-h-60 overflow-y-auto p-1">
              {instrutores.map((instructor) => (
                <Label
                  key={instructor.id}
                  htmlFor={instructor.id}
                  className="flex items-center gap-3 p-3 rounded-md border has-[:checked]:bg-accent cursor-pointer"
                >
                  <RadioGroupItem value={instructor.id} id={instructor.id} />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={instructor.avatar} alt={instructor.name} />
                    <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{instructor.name}</span>
                    <span className="text-xs text-muted-foreground">{instructor.email}</span>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!selectedInstructorId}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function CursoDetalhePage() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Curso | undefined>();
  const [user, setUser] = useState<UserSession | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const sessionData = localStorage.getItem('userSession');
    if (sessionData) {
      const parsedSession = JSON.parse(sessionData);
      setUser(parsedSession);
      const userRole = allRoles.find(r => r.name === parsedSession.profile);
      setUserPermissions(userRole?.permissions || []);
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const loadCurso = async () => {
      const courseId = params.id as string;
      if (courseId) {
        try {
          setLoading(true);
          const cursoData = await getCursoById(courseId);
          if (cursoData) {
            setCourse(cursoData);
          } else {
            toast({
              variant: 'destructive',
              title: 'Erro',
              description: 'Curso não encontrado'
            });
            router.push('/cursos');
          }
        } catch (error) {
          console.error('Erro ao carregar curso:', error);
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Falha ao carregar dados do curso'
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (user) {
      loadCurso();
    }
  }, [params, user, toast, router]);
  
  const hasPermission = (permission: string) => userPermissions.includes(permission);

  const instructor = useMemo(() => {
    if (!course?.instrutorId) return undefined;
    return { id: course.instrutorId, name: course.instrutorNome };
  }, [course?.instrutorId, course?.instrutorNome]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!course || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Curso não encontrado</p>
      </div>
    );
  }
  
  const handleSaveCourse = async (data: { titulo: string, descricao: string }) => {
    try {
      await updateCurso(course.id, data);
      setCourse({ ...course, ...data });
      toast({
        title: "Sucesso!",
        description: "Curso atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Erro!",
        description: "Falha ao atualizar curso.",
      });
    }
  };

  const handleSaveSyllabus = async (conteudo: string) => {
    try {
      await updateCurso(course.id, { conteudo });
      setCourse({ ...course, conteudo });
      toast({
        title: "Sucesso!",
        description: "Conteúdo programático atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Erro!",
        description: "Falha ao atualizar conteúdo programático.",
      });
    }
  }

  const handleSaveInstructor = async (instructorId: string) => {
    try {
      // Buscar o nome do instrutor
      const users = await getUsers();
      const instrutor = users.find(u => u.id === instructorId);
      
      await updateCurso(course.id, { 
        instrutorId,
        instrutorNome: instrutor?.name || 'Instrutor não encontrado'
      });
      setCourse({ 
        ...course, 
        instrutorId,
        instrutorNome: instrutor?.name || 'Instrutor não encontrado'
      });
      toast({
        title: "Sucesso!",
        description: "Instrutor atribuído com sucesso.",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Erro!",
        description: "Falha ao atribuir instrutor.",
      });
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    router.push('/');
  };

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
            {hasPermission('dashboard:view') && (
              <SidebarMenuItem>
                <Link href="/dashboard" passHref>
                  <SidebarMenuButton isActive={pathname === '/dashboard'} tooltip="Dashboard">
                    <LayoutDashboard />
                    Dashboard
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}
            
            {hasPermission('scheduling:view') && (
              <SidebarMenuItem>
                <Link href="/agendamentos" passHref>
                  <SidebarMenuButton isActive={pathname.startsWith('/agendamentos')} tooltip="Agendamentos">
                    <CalendarDays />
                    Agendamentos
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}

            {hasPermission('scheduling:view') && (
               <SidebarMenuItem>
                <Link href="/calendario" passHref>
                  <SidebarMenuButton isActive={pathname.startsWith('/calendario')} tooltip="Calendário">
                    <CalendarIcon />
                    Calendário
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}
            
            {hasPermission('history:view') && (
              <SidebarMenuItem>
                <Link href="/historico" passHref>
                  <SidebarMenuButton isActive={pathname.startsWith('/historico')} tooltip="Histórico">
                    <History />
                    Histórico
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}
            
            {hasPermission('reports:view') && (
              <SidebarMenuItem>
                <Link href="/relatorios" passHref>
                  <SidebarMenuButton isActive={pathname.startsWith('/relatorios')} tooltip="Relatórios">
                    <FileText />
                    Relatórios
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}
            
            {(hasPermission('db_courses:view') || hasPermission('db_companies:view') || hasPermission('db_users:view') || hasPermission('db_instructors:view')) && (
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
                                {hasPermission('db_courses:view') && (
                                    <SidebarMenuItem>
                                        <Link href="/cursos" passHref>
                                            <SidebarMenuButton isActive={pathname.startsWith('/cursos')} tooltip="Cursos">
                                                <BookOpen/> Cursos
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>
                                )}
                                {hasPermission('db_companies:view') && (
                                    <SidebarMenuItem>
                                        <Link href="/empresas" passHref>
                                            <SidebarMenuButton isActive={pathname.startsWith('/empresas')} tooltip="Empresas">
                                                <Building/> Empresas
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>
                                )}
                                {hasPermission('db_users:view') && (
                                    <SidebarMenuItem>
                                        <Link href="/usuarios" passHref>
                                            <SidebarMenuButton isActive={pathname.startsWith('/usuarios')} tooltip="Usuários">
                                                <Users/> Usuários
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>
                                )}
                                {hasPermission('db_instructors:view') && (
                                    <SidebarMenuItem>
                                        <Link href="/instrutores" passHref>
                                            <SidebarMenuButton isActive={pathname.startsWith('/instrutores')} tooltip="Instrutores">
                                                <UserCheck/> Instrutores
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>
                                )}
                            </SidebarMenu>
                        </CollapsibleContent>
                    </Collapsible>
                </SidebarMenuItem>
            )}
            
            {hasPermission('settings:manage') && (
              <SidebarMenuItem>
                <Link href="/configuracoes" passHref>
                  <SidebarMenuButton isActive={pathname.startsWith('/configuracoes')} tooltip="Configurações">
                    <Settings />
                    Configurações
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
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
            <h1 className="text-2xl font-headline font-bold truncate">{course.titulo}</h1>
          </div>
           <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person face" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader className="p-0">
                    <Image 
                    src={course.imagem || "https://placehold.co/600x400/2563eb/ffffff?text=Curso"} 
                    alt={course.titulo} 
                    width={1200} 
                    height={600} 
                    className="object-cover rounded-t-lg aspect-[2/1]"
                    />
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                        <CardTitle className="font-headline text-2xl mb-2">{course.titulo}</CardTitle>
                        {hasPermission('db_courses:update') && course && (
                            <EditCourseDialog course={course} onSave={handleSaveCourse}>
                                <Button variant="outline" size="icon">
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Editar Curso</span>
                                </Button>
                            </EditCourseDialog>
                        )}
                    </div>
                    <CardDescription>{course.descricao}</CardDescription>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Duração:</span>
                        <span>{course.duracao}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Preço:</span>
                        <span>R$ {course.preco.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Categoria:</span>
                        <span>{course.categoria}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nível:</span>
                        <span>{course.nivel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span>{course.status}</span>
                      </div>
                      {course.vagas && (
                        <div className="flex justify-between">
                          <span>Vagas:</span>
                          <span>{course.vagasDisponiveis || course.vagas}/{course.vagas}</span>
                        </div>
                      )}
                    </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-2">
                    {hasPermission('scheduling:view') && (
                        <Link href={`/agendamentos`} passHref className="w-full">
                            <Button className="w-full" variant="outline">Ver Agendamentos</Button>
                        </Link>
                    )}
                    {hasPermission('scheduling:create') && (
                        <BulkEnrollDialog course={course}>
                            <Button className="w-full"><Users className="mr-2" /> Matricular Alunos em Lote</Button>
                        </BulkEnrollDialog>
                    )}
                </CardFooter>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Conteúdo Programático</CardTitle>
                  <CardDescription>O que será abordado no curso.</CardDescription>
                </div>
                 {hasPermission('db_courses:update') && course && (
                  <EditSyllabusDialog course={course} onSave={handleSaveSyllabus}>
                    <Button variant="outline" size="sm">
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar Conteúdo
                    </Button>
                  </EditSyllabusDialog>
                 )}
              </CardHeader>
              <CardContent>
                {course.conteudo ? (
                  <div className="whitespace-pre-wrap">{course.conteudo}</div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum conteúdo programático cadastrado.</p>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Instrutor Responsável</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-start gap-3">
                    {instructor ? (
                        <div className="flex items-center gap-2">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src="https://placehold.co/40x40.png" alt={instructor.name}/>
                                <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{instructor.name}</span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-sm text-muted-foreground">Não atribuído</span>
                    )}
                    {hasPermission('db_courses:update') && course && (
                        <AssignInstructorDialog course={course} onSave={handleSaveInstructor}>
                            <Button variant="outline" size="sm" className="mt-1">
                                <UserIcon className="mr-2 h-4 w-4" />
                                {instructor ? "Alterar Instrutor" : "Atribuir Instrutor"}
                            </Button>
                        </AssignInstructorDialog>
                    )}
                </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
