
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  ChevronLeft,
  History,
  Database,
} from "lucide-react";
import { GraduationCap } from "@/components/icons";
import { SidebarLogo } from "@/components/app-logo";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import type { UserSession } from "@/app/page";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
    UsersTable, 
    CompaniesTable, 
    InstructorsTable,
    CoursesTable,
    ScheduledClassesTable
} from "@/components/crud-tables";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { SidebarMenuComponent } from "@/components/sidebar-menu";


// --- Main Page Component ---
export default function TabelaCrudPage() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [loggedInUser, setLoggedInUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const sessionData = localStorage.getItem('userSession');
    if (sessionData) {
      const parsedSession = JSON.parse(sessionData);
      setLoggedInUser(parsedSession);
      if (parsedSession.profile !== 'Administrador') {
        router.push('/dashboard');
      }
    } else {
      router.push('/');
    }
  }, [router]);
  
  const handleLogout = () => {
    localStorage.removeItem('userSession');
    router.push('/');
  };

  const renderTable = () => {
    switch (slug) {
      case 'usuarios':
        return <UsersTable />;
      case 'empresas':
        return <CompaniesTable />;
      case 'instrutores':
        return <InstructorsTable />;
      case 'cursos':
        return <CoursesTable />;
      case 'agendamentos':
        return <ScheduledClassesTable />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Tabela não encontrada</CardTitle>
            </CardHeader>
            <CardContent>
              <p>A tabela "{slug}" não foi implementada ainda.</p>
            </CardContent>
          </Card>
        );
    }
  };
  
  const pageTitle = useMemo(() => {
    if(!slug) return "Tabela";
    const titles: { [key: string]: string } = {
        'usuarios': 'Usuários',
        'empresas': 'Empresas',
        'instrutores': 'Instrutores',
        'cursos': 'Cursos',
        'agendamentos': 'Agendamentos'
    }
    return `Tabela: ${titles[slug] || (slug.charAt(0).toUpperCase() + slug.slice(1))}`;
  }, [slug]);

  if (!loggedInUser || loggedInUser.profile !== 'Administrador') {
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
          <SidebarMenuComponent user={loggedInUser} />
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-9 w-9"><AvatarImage src="https://placehold.co/40x40.png" alt={loggedInUser.name} data-ai-hint="person face" /><AvatarFallback>{loggedInUser.name.charAt(0)}</AvatarFallback></Avatar>
            <div className="flex flex-col min-w-0"><span className="text-sm font-medium text-sidebar-foreground truncate">{loggedInUser.name}</span><span className="text-xs text-sidebar-foreground/70 truncate">{loggedInUser.email}</span></div>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground/70 ml-auto flex-shrink-0" onClick={handleLogout}><LogOut className="h-4 w-4"/></Button>
          </div>
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <Button variant="ghost" size="icon" onClick={() => router.push('/configuracoes')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-headline font-bold">{pageTitle}</h1>
          </div>
           <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt={loggedInUser.name} data-ai-hint="person face" />
            <AvatarFallback>{loggedInUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {renderTable()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
