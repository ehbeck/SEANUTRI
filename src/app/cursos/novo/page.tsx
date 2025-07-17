
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
  ChevronLeft,
  Building,
  UserCheck,
  LogOut,
  CalendarDays,
  CalendarIcon,
  PlusCircle,
  X,
  Settings,
  History,
  Database,
} from "lucide-react";
import { GraduationCap } from "@/components/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState, useEffect } from "react";
import Image from "next/image";
import { addCourse, roles as allRoles } from "@/lib/data";
import type { UserSession } from "@/app/page";
import { ThemeToggle } from "@/components/theme-toggle";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

const formSchema = z.object({
  title: z.string().min(1, { message: "O título é obrigatório." }),
  description: z.string().min(1, { message: "A descrição é obrigatória." }),
  image: z.string().optional(),
  syllabus: z.array(z.object({ value: z.string().min(1, "O item não pode ser vazio.") })).optional(),
});


export default function NovoCursoPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  
  const [user, setUser] = useState<UserSession | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    const sessionData = localStorage.getItem('userSession');
    if (sessionData) {
      const parsedSession = JSON.parse(sessionData);
      setUser(parsedSession);
      const userRole = allRoles.find(r => r.name === parsedSession.profile);
      setUserPermissions(userRole?.permissions || []);
      if (!userRole?.permissions.includes('db_courses:create')) {
        router.push('/dashboard');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  const hasPermission = (permission: string) => userPermissions.includes(permission);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      syllabus: [{ value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "syllabus"
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addCourse({
      title: values.title,
      description: values.description,
      image: 'https://placehold.co/600x400.png',
      hint: 'new course',
    });
    toast({
      title: "Sucesso!",
      description: "Curso cadastrado com sucesso.",
    });
    router.push('/cursos');
  };

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    router.push('/');
  };

  if (!user || !hasPermission('db_courses:create')) {
    return null; // Or a loading spinner while redirecting
  }

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
            <h1 className="text-2xl font-headline font-bold">Adicionar Novo Curso</h1>
          </div>
           <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person face" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Curso</CardTitle>
              <CardDescription>Preencha as informações abaixo para criar um novo curso.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Curso</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Higiene Alimentar Avançada" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                         <div className="flex items-center justify-between">
                           <FormLabel>Descrição</FormLabel>
                         </div>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o conteúdo e os objetivos do curso." 
                            rows={5}
                            {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label>Conteúdo Programático</Label>
                    <div className="mt-2 space-y-2">
                      {fields.map((field, index) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={`syllabus.${index}.value`}
                          render={({ field }) => (
                             <FormItem>
                               <div className="flex items-center gap-2">
                                <FormControl>
                                  <Input {...field} placeholder={`Item ${index + 1} do conteúdo`}/>
                                </FormControl>
                                {fields.length > 1 && (
                                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                    <X className="h-4 w-4 text-destructive"/>
                                  </Button>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                     <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => append({ value: "" })}
                    >
                      <PlusCircle className="mr-2" />
                      Adicionar Item
                    </Button>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                       <FormItem>
                        <FormLabel>Imagem de Capa</FormLabel>
                        <div className="mt-4 relative aspect-video w-full max-w-lg mx-auto rounded-lg overflow-hidden border">
                          <Image src="https://placehold.co/600x400.png" alt="Imagem de capa padrão" layout="fill" objectFit="cover" data-ai-hint="placeholder" />
                        </div>
                        <FormDescription>
                          A imagem de capa padrão será usada.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/cursos')}>Cancelar</Button>
                    <Button type="submit">Salvar Curso</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
