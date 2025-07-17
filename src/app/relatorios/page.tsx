
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Users,
  Download,
  Building,
  UserCheck,
  LogOut,
  CalendarDays,
  CalendarIcon,
  Settings,
  History,
  FileDown,
  Database,
} from "lucide-react";
import { GraduationCap } from "@/components/icons";
import { SidebarLogo } from "@/components/app-logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { courses as allCourses, users as allUsers, instructors as allInstructors, companies as allCompanies } from "@/lib/data";
import { format } from 'date-fns';
import { ptBR } from "date-fns/locale";
import type { UserSession } from "../page";
import { ThemeToggle } from "@/components/theme-toggle";
import jsPDF from "jspdf";
// Removido: import html2canvas from "html2canvas"; - causa problemas de SSR
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarMenuComponent } from "@/components/sidebar-menu";

const ReportsChart = dynamic(
  () => import('@/components/charts').then(mod => mod.ReportsChart),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[300px]" />
  }
);


export default function RelatoriosPage() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [user, setUser] = useState<UserSession | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [filterCompany, setFilterCompany] = useState('all');

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

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    router.push('/');
  };

  const filteredEnrollments = useMemo(() => {
    const usersInCompany = filterCompany === 'all' 
        ? allUsers.map(u => u.id)
        : allUsers.filter(u => u.companyId === filterCompany).map(u => u.id);

    return allUsers
      .filter(u => usersInCompany.includes(u.id))
      .flatMap(p => 
        p.enrollments.map(e => ({
            ...e,
            userId: p.id,
            userName: p.name,
            courseName: allCourses.find(c => c.id === e.courseId)?.title ?? 'Curso Desconhecido',
            courseId: e.courseId
        }))
      );
  }, [filterCompany]);
  
  const completedEnrollments = useMemo(() => filteredEnrollments.filter(e => e.status === 'Concluído'), [filteredEnrollments]);
  const approvedEnrollments = useMemo(() => completedEnrollments.filter(e => e.approved), [completedEnrollments]);
  const totalCertificates = approvedEnrollments.length;
  
  const averageGrade = useMemo(() => {
    const validGrades = completedEnrollments.map(e => e.grade).filter((g): g is number => g !== null && g !== undefined);
    return validGrades.length > 0 ? parseFloat((validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(1)) : 0;
  }, [completedEnrollments]);
  
  const approvalRate = useMemo(() => completedEnrollments.length > 0 ? Math.round((approvedEnrollments.length / completedEnrollments.length) * 100) : 0, [approvedEnrollments, completedEnrollments]);
  
  const completionByCourse = useMemo(() => allCourses.map(course => {
      const enrollmentsForCourse = filteredEnrollments.filter(e => e.courseId === course.id);
      return {
          name: course.title,
          "Concluído": enrollmentsForCourse.filter(e => e.status === 'Concluído').length,
          "Em Progresso": enrollmentsForCourse.filter(e => e.status === 'Em Progresso').length,
      };
  }).filter(c => c['Concluído'] > 0 || c['Em Progresso'] > 0), [allCourses, filteredEnrollments]);
  
  const recentCertificates = useMemo(() => approvedEnrollments
      .filter(e => e.completionDate)
      .sort((a, b) => b.completionDate!.getTime() - a.completionDate!.getTime())
      .slice(0, 4)
      .map((cert) => ({
          ...cert,
          date: format(cert.completionDate!, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      })), [approvedEnrollments]);

  if (!user || user.profile !== 'Administrador') {
    return null; // Or a loading spinner
  }

  const handleExportCSV = () => {
    const headers = ["Aluno", "Curso", "Data de Conclusão", "Nota", "Instrutor"];
    
    const data = approvedEnrollments.map(enrollment => {
        const course = allCourses.find(c => c.id === enrollment.courseId);
        const instructor = allInstructors.find(i => i.id === enrollment.instructorId);
        return [
            `"${enrollment.userName}"`,
            `"${enrollment.courseName}"`,
            `"${enrollment.completionDate ? format(enrollment.completionDate, 'yyyy-MM-dd') : 'N/A'}"`,
            enrollment.grade ?? 'N/A',
            `"${instructor?.name ?? 'Não atribuído'}"`
        ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...data].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_certificados.csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };
  
  const handleExportPDF = async () => {
    const input = printRef.current;
    if (!input) return;
    
    try {
      // Usar o wrapper seguro para html2canvas
      const { safeHtml2Canvas } = await import('@/lib/html2canvas-dynamic');
      const canvas = await safeHtml2Canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("relatorio_seanuri.pdf");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Fallback: gerar PDF simples sem html2canvas
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.setFontSize(16);
      pdf.text('Relatório - Sistema de Gestão de Cursos', 20, 20);
      pdf.setFontSize(12);
      pdf.text('Relatório gerado em: ' + new Date().toLocaleDateString('pt-BR'), 20, 30);
      pdf.save("relatorio_seanuri_simples.pdf");
    }
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
            <h1 className="text-2xl font-headline font-bold">Relatórios</h1>
          </div>
          <div className="flex items-center gap-4">
             <Button onClick={handleExportPDF} variant="outline">
              <FileDown className="mr-2" />
              Exportar PDF
            </Button>
            <Button onClick={handleExportCSV}>
              <Download className="mr-2" />
              Exportar CSV
            </Button>
             <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person face" />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main ref={printRef} className="flex-1 p-4 md:p-6 space-y-6">
           <Card>
                <CardHeader>
                    <CardTitle>Filtros do Relatório</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={filterCompany} onValueChange={setFilterCompany}>
                        <SelectTrigger className="w-full md:w-1/3">
                            <SelectValue placeholder="Filtrar por empresa" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Empresas</SelectItem>
                            {allCompanies.map(company => (
                                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
           </Card>

          <div className="grid gap-4 md:grid-cols-3">
             <Card>
              <CardHeader>
                <CardTitle>Certificados Emitidos</CardTitle>
                <CardDescription>Total de certificados gerados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{totalCertificates}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Nota Média Geral</CardTitle>
                <CardDescription>Média de todas as avaliações</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{averageGrade}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Aprovação</CardTitle>
                <CardDescription>Percentual de alunos aprovados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{approvalRate}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Progresso por Curso</CardTitle>
              <CardDescription>Visualização do número de alunos concluídos vs. em progresso.</CardDescription>
            </CardHeader>
            <CardContent>
              {completionByCourse.length > 0 ? (
                  <ReportsChart data={completionByCourse} />
              ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">Nenhum dado para exibir.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certificados Emitidos Recentemente</CardTitle>
              <CardDescription>Lista dos últimos certificados que foram gerados.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Data de Emissão</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {recentCertificates.length > 0 ? recentCertificates.map(cert => (
                    <TableRow key={`${cert.userId}-${cert.courseId}`}>
                      <TableCell className="font-medium">{cert.userName}</TableCell>
                      <TableCell>{cert.courseName}</TableCell>
                      <TableCell>{cert.date}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/cursos/${cert.courseId}/certificado/${cert.userId}`)}
                        >
                          Ver Certificado
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            Nenhum certificado emitido recentemente para a seleção atual.
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
