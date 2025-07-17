
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
import { SidebarLogo } from "@/components/app-logo";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { 
  companies as allCompanies, 
  users as allUsers,
  type Company,
  type User
} from "@/lib/data";
import type { UserSession } from "@/app/page";
import { ThemeToggle } from "@/components/theme-toggle";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

export default function EmpresaDetalhePage() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams() as { id: string };
  
  const [user, setUser] = useState<UserSession | null>(null);

  const company: Company | undefined = useMemo(() => allCompanies.find(c => c.id === params.id), [params.id]);

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

  const companyUsers: User[] = useMemo(() => allUsers.filter(p => p.companyId === params.id), [params.id]);

  if (!company || !user || user.profile !== 'Administrador') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Acesso negado ou empresa não encontrada.</p>
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
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-headline font-bold truncate">{company.name}</h1>
          </div>
           <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person face" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{company.name}</CardTitle>
              <CardDescription>Informações de contato e status da empresa.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
               <div className="flex items-center gap-3">
                 <Mail className="h-5 w-5 text-muted-foreground" />
                 <span className="text-sm">{company.contact}</span>
               </div>
               <div className="flex items-center gap-3">
                 <Badge variant={company.status === 'Ativa' ? 'default' : 'destructive'}>
                    {company.status}
                </Badge>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuários da Empresa</CardTitle>
              <CardDescription>Lista de usuários desta empresa cadastrados na plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyUsers.length > 0 ? companyUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.hint} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.profile}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'Ativo' ? 'default' : 'destructive'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Nenhum funcionário desta empresa foi encontrado.
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
