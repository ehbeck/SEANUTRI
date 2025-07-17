
'use client';

import { Button } from "@/components/ui/button";
import { certificateSettings, type User, type Instructor } from "@/lib/data";
import type { Course } from "@/lib/definitions";
import type { Enrollment } from "@/lib/firebase-db";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import type { UserSession } from "@/app/page";
import { Logo } from "@/components/icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Printer, BookOpen, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import QRCode from "qrcode.react";
import jsPDF from "jspdf";
// Removido: import html2canvas from "html2canvas"; - causa problemas de SSR
import { AddEnrollmentDialog } from "@/components/historico-dialogs";
import { enrollmentService } from "@/lib/firebase-db";
import { useToast } from "@/hooks/use-toast";
import { getCursos } from "@/lib/cursos-firebase";
import { getUsers } from "@/lib/users-firebase";
import { getInstrutores } from "@/lib/instrutores-firebase";


export default function CertificadoPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [session, setSession] = useState<UserSession | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  const [person, setPerson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [instructor, setInstructor] = useState<any>(null);
  const [formattedCompletionDate, setFormattedCompletionDate] = useState('');
  
  // Estados para o diálogo de adicionar matrícula
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [cursos, setCursos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    const sessionData = localStorage.getItem('userSession');
    if (sessionData) {
      setSession(JSON.parse(sessionData));
    }
  }, []);

  // Carregar dados do certificado
  useEffect(() => {
    const loadCertificateData = async () => {
      if (!params.id || !params.personId) return;

      try {
        console.log('🔍 Carregando dados do certificado...');
        console.log('📚 Course ID:', params.id);
        console.log('👤 Person ID:', params.personId);

        // Buscar dados do Firebase
        const [cursosData, usuariosData, instrutoresData] = await Promise.all([
          getCursos(),
          getUsers(),
          getInstrutores()
        ]);

        console.log('📊 Dados carregados:');
        console.log('  - Cursos:', cursosData.length);
        console.log('  - Usuários:', usuariosData.length);
        console.log('  - Instrutores:', instrutoresData.length);

        // Encontrar usuário
        const foundPerson = usuariosData.find((p: any) => p.id === params.personId);
        console.log('👤 Usuário encontrado:', foundPerson);

        if (foundPerson) {
          setPerson(foundPerson);

          // Buscar matrícula específica
          const enrollments = await enrollmentService.getAll();
          console.log('📝 Total de matrículas:', enrollments.length);
          
          const foundEnrollment = enrollments.find((en: any) => {
            console.log(`🔍 Verificando matrícula: courseId=${en.courseId}, userId=${en.userId}, approved=${en.approved}`);
            return en.courseId === params.id && en.userId === params.personId && en.approved === true;
          });

          console.log('📝 Matrícula encontrada:', foundEnrollment);

          if (foundEnrollment) {
            setEnrollment(foundEnrollment);

            // Encontrar curso
            const foundCourse = cursosData.find((c: any) => c.id === foundEnrollment.courseId);
            console.log('📚 Curso encontrado:', foundCourse);
            setCourse(foundCourse || null);

            // Encontrar instrutor
            const foundInstructor = instrutoresData.find((inst: any) => inst.id === foundEnrollment.instructorId);
            console.log('👨‍🏫 Instrutor encontrado:', foundInstructor);
            setInstructor(foundInstructor || null);

            // Formatar data de conclusão
            if (foundEnrollment.completionDate) {
              const dateToFormat = foundEnrollment.completionDate;
              setFormattedCompletionDate(format(dateToFormat, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }));
            }
          } else {
            console.log('❌ Matrícula não encontrada ou não aprovada');
          }
        } else {
          console.log('❌ Usuário não encontrado');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do certificado:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados do certificado",
          variant: "destructive",
        });
      }
    };

    loadCertificateData();
  }, [params, toast]);

  // Carregar dados para o diálogo (usando os mesmos dados do certificado)
  useEffect(() => {
    const loadDialogData = async () => {
      try {
        const [cursosData, usuariosData] = await Promise.all([
          getCursos(),
          getUsers()
        ]);
        setCursos(cursosData);
        setUsuarios(usuariosData);
      } catch (error) {
        console.error('Erro ao carregar dados para diálogo:', error);
      }
    };
    loadDialogData();
  }, []);

  // Função para adicionar matrícula
  const handleAddEnrollment = async (data: Omit<Enrollment, 'id'>) => {
    try {
      console.log('📝 Criando nova matrícula:', data);
      const newEnrollment = await enrollmentService.create(data);
      console.log('✅ Matrícula criada:', newEnrollment);
      
      toast({
        title: "Sucesso",
        description: "Matrícula criada com sucesso",
      });
      setIsAddDialogOpen(false);
      
      // Se a matrícula foi aprovada, recarregar a página para mostrar o certificado
      if (data.approved) {
        window.location.reload();
      } else {
        // Redirecionar para o histórico se não foi aprovada
        router.push('/historico');
      }
    } catch (error) {
      console.error('Erro ao criar matrícula:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar matrícula",
        variant: "destructive",
      });
    }
  };

  if (!course || !person || !enrollment || enrollment.approved !== true) {
    console.log('❌ Certificado inválido - Debug:');
    console.log('  - Course:', course);
    console.log('  - Person:', person);
    console.log('  - Enrollment:', enrollment);
    console.log('  - Approved:', enrollment?.approved);
    
    return (
        <div className="flex items-center justify-center h-screen bg-muted">
            <div className="text-center p-8 bg-card rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-destructive">Certificado Inválido</h1>
                <p className="text-muted-foreground mt-2">
                  {!course ? 'Curso não encontrado.' : 
                   !person ? 'Aluno não encontrado.' : 
                   !enrollment ? 'Matrícula não encontrada.' : 
                   enrollment.approved !== true ? 'Aluno não foi aprovado no curso.' : 
                   'Erro desconhecido.'}
                </p>
                <div className="flex flex-col gap-3 mt-6">
                    <Button onClick={() => router.back()} variant="outline">
                        Voltar
                    </Button>
                    <Button 
                        onClick={() => setIsAddDialogOpen(true)}
                        className="bg-primary hover:bg-primary/90"
                    >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Gerar Novo Certificado
                    </Button>
                </div>
            </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };
  
  const handleExportPDF = async () => {
    const printContainer = printRef.current;
    if (!printContainer) return;
    
    try {
      // Usar o wrapper seguro para html2canvas
      const { safeHtml2Canvas } = await import('@/lib/html2canvas-dynamic');
      
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const page1Element = printContainer.querySelector('#cert-page-1') as HTMLElement;
      const page2Element = printContainer.querySelector('#cert-page-2') as HTMLElement;
      
      // Process Page 1
      const canvas1 = await safeHtml2Canvas(page1Element, { scale: 2 });
      const imgData1 = canvas1.toDataURL('image/png');
      const pdfHeight1 = (canvas1.height * pdfWidth) / canvas1.width;
      pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidth, pdfHeight1);

      // Process Page 2
      if (page2Element) {
          pdf.addPage();
          const canvas2 = await safeHtml2Canvas(page2Element, { scale: 2 });
          const imgData2 = canvas2.toDataURL('image/png');
          const pdfHeight2 = (canvas2.height * pdfWidth) / canvas2.width;
          pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, pdfHeight2);
      }
      
      pdf.save(`certificado-${person.name}-${course.title}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Fallback: gerar PDF simples sem html2canvas
      const pdf = new jsPDF('l', 'mm', 'a4');
      pdf.setFontSize(16);
      pdf.text('Certificado de Conclusão', 20, 20);
      pdf.setFontSize(12);
      pdf.text(`Aluno: ${person.name}`, 20, 40);
      pdf.text(`Curso: ${course.title}`, 20, 50);
      pdf.text(`Data: ${formattedCompletionDate}`, 20, 60);
      pdf.save(`certificado-${person.name}-${course.title}-simples.pdf`);
    }
  };

  const verificationUrl = `${certificateSettings.qrCode.baseUrl}/${enrollment.verificationCode}`;

  return (
    <div className="bg-muted min-h-screen flex flex-col items-center justify-center p-4 print:p-0">
        
        <header className="w-full max-w-5xl flex justify-between items-center mb-4 print:hidden">
            <div className="flex items-center gap-3">
                <Logo className="size-10 text-primary" />
                <h1 className="text-xl font-headline font-bold">Certificado Digital</h1>
            </div>
            <div className="flex items-center gap-2">
                {session && <Button onClick={() => router.push(`/cursos/${params.id}`)} variant="outline">Voltar ao Curso</Button>}
                <Button onClick={handlePrint}>
                    <Printer className="mr-2"/>
                    Imprimir
                </Button>
                 <Button onClick={handleExportPDF}>
                    <FileDown className="mr-2"/>
                    Exportar PDF
                </Button>
            </div>
        </header>

        <div className="w-full max-w-5xl space-y-8 print:space-y-0" ref={printRef}>
            {/* Page 1: Certificate */}
            <div 
                id="cert-page-1"
                className="print-page bg-white rounded-lg shadow-2xl p-8 border-4 border-primary print:shadow-none print:border-0 print:rounded-none flex flex-col aspect-[297/210] text-gray-800 relative"
                style={{
                    backgroundImage: certificateSettings.page1Background ? `url(${certificateSettings.page1Background})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <main className="text-center py-16 flex-1 flex flex-col justify-center relative">
                    <p className={cn("absolute", certificateSettings.header.classes)} style={{ top: `${certificateSettings.header.top}%`, left: `${certificateSettings.header.left}%`, fontSize: `${certificateSettings.header.size}px` }}>{certificateSettings.header.text}</p>
                    <h2 className={cn("absolute", certificateSettings.studentName.classes)} style={{ top: `${certificateSettings.studentName.top}%`, left: `${certificateSettings.studentName.left}%`, fontSize: `${certificateSettings.studentName.size}px` }}>{person.name}</h2>
                    <p className={cn("absolute", certificateSettings.body.classes)} style={{ top: `${certificateSettings.body.top}%`, left: `${certificateSettings.body.left}%`, fontSize: `${certificateSettings.body.size}px` }}>{certificateSettings.body.text}</p>
                    <h3 className={cn("absolute", certificateSettings.courseName.classes)} style={{ top: `${certificateSettings.courseName.top}%`, left: `${certificateSettings.courseName.left}%`, fontSize: `${certificateSettings.courseName.size}px` }}>{course.title}</h3>
                    
                    {certificateSettings.customTexts?.filter(t => t.page === 1).map(text => (
                        <p key={text.id} className="absolute" style={{ top: `${text.top}%`, left: `${text.left}%`, fontSize: `${text.size}px` }}>{text.text}</p>
                    ))}
                </main>
                <footer className="relative w-full h-28">
                    {/* Instructor Name */}
                    <div 
                        className={cn("absolute", certificateSettings.instructorName.classes)}
                        style={{ top: `${certificateSettings.instructorName.top}%`, left: `${certificateSettings.instructorName.left}%`, fontSize: `${certificateSettings.instructorName.size}px`}}
                    >
                        {instructor?.name ?? 'Instrutor não definido'}
                         {certificateSettings.instructorName.showUnderline && (
                            <div className="mt-1 border-b-2 border-dotted border-gray-700 w-full"></div>
                        )}
                    </div>
                    
                    {/* Instructor Title */}
                    <p 
                        className={cn("absolute", certificateSettings.instructorTitle.classes)}
                        style={{ top: `${certificateSettings.instructorTitle.top}%`, left: `${certificateSettings.instructorTitle.left}%`, fontSize: `${certificateSettings.instructorTitle.size}px`}}
                    >
                        {certificateSettings.instructorTitle.text}
                    </p>

                    {/* Verification Code */}
                     <p 
                        className={cn("absolute", certificateSettings.verificationCode.classes)}
                        style={{ top: `${certificateSettings.verificationCode.top}%`, left: `${certificateSettings.verificationCode.left}%`, fontSize: `${certificateSettings.verificationCode.size}px`}}
                    >
                        {certificateSettings.verificationCode.text} {enrollment.verificationCode}
                    </p>

                    {/* Issue Date */}
                    <div 
                        className={cn("absolute text-center", certificateSettings.issueDate.classes)}
                        style={{ top: `${certificateSettings.issueDate.top}%`, left: `${certificateSettings.issueDate.left}%`, fontSize: `${certificateSettings.issueDate.size}px`}}
                    >
                        {certificateSettings.issueDate.text}
                        <p>{formattedCompletionDate}</p>
                    </div>

                    {/* QR Code */}
                    {certificateSettings.qrCode.enabled && (
                        <div className="absolute" style={{ top: `${certificateSettings.qrCode.top}%`, left: `${certificateSettings.qrCode.left}%` }}>
                           <QRCode value={verificationUrl} size={certificateSettings.qrCode.size} level="L" />
                        </div>
                    )}
                </footer>
            </div>

            {/* Page 2: Syllabus - this will be on a new page when printing */}
            <div 
                id="cert-page-2"
                className="print-page bg-white rounded-lg shadow-2xl p-8 border-4 border-primary print:shadow-none print:border-0 print:rounded-none print:break-before-page flex flex-col aspect-[297/210] text-gray-800 relative"
                 style={{
                    backgroundImage: certificateSettings.page2Background ? `url(${certificateSettings.page2Background})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                 <header className="flex justify-between items-center border-b-2 pb-4 border-primary/50">
                    <div className="flex items-center gap-3">
                        <BookOpen className="size-10 text-primary" />
                        <h1 
                            className={cn("text-3xl font-headline font-bold", certificateSettings.syllabusTitle.classes)} 
                            style={{ fontSize: `${certificateSettings.syllabusTitle.size}px` }}
                        >
                            {certificateSettings.syllabusTitle.text}
                        </h1>
                    </div>
                     <p className="text-lg font-semibold">{course.title}</p>
                </header>
                <main className="py-8 flex-1">
                    <ul className="space-y-4">
                        {course.syllabus && course.syllabus.length > 0 ? (
                            course.syllabus.map((item: string, index: number) => (
                                <li key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                                    <div className="flex-shrink-0 bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</div>
                                    <span>{item}</span>
                                </li>
                            ))
                        ) : (
                            <p className="text-center">Nenhum conteúdo programático cadastrado para este curso.</p>
                        )}
                    </ul>
                    {certificateSettings.customTexts?.filter(t => t.page === 2).map(text => (
                        <p key={text.id} className="absolute" style={{ top: `${text.top}%`, left: `${text.left}%`, fontSize: `${text.size}px` }}>{text.text}</p>
                    ))}
                </main>
                 <footer className="pt-8 border-t-2 border-primary/50 text-sm text-center">
                    <p>Certificado emitido para <span className="font-semibold">{person.name}</span> em {formattedCompletionDate}.</p>
                    <p className="font-bold mt-2">Seanutri</p>
                 </footer>
            </div>
        </div>
        {!session && <Button variant="link" onClick={() => router.push('/')} className="mt-8 text-muted-foreground print:hidden">Voltar para a página de verificação</Button>}
        
        {/* Diálogo de Adicionar Matrícula */}
        <AddEnrollmentDialog
          onSave={handleAddEnrollment}
          isOpen={isAddDialogOpen}
          setIsOpen={setIsAddDialogOpen}
          courses={cursos}
          users={usuarios}
        >
          <div></div>
        </AddEnrollmentDialog>
    </div>
  );
}
