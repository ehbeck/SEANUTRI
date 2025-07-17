'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import { Logo } from "@/components/icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Award, ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import { enrollmentService } from "@/lib/firebase-db";
import { getCursos } from "@/lib/cursos-firebase";
import { getUsers } from "@/lib/users-firebase";
import { getInstrutores } from "@/lib/instrutores-firebase";

export default function VerificarCertificadoPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    course: any;
    person: any;
    enrollment: any;
    instructor: any;
  } | null>(null);

  useEffect(() => {
    const verifyCertificate = async () => {
      if (!params.code) return;

      try {
        setLoading(true);
        const decodedCode = decodeURIComponent(params.code as string);
        
        console.log('🔍 Verificando certificado:', decodedCode);

        // Buscar dados do Firebase
        const [enrollments, cursos, usuarios, instrutores] = await Promise.all([
          enrollmentService.getAll(),
          getCursos(),
          getUsers(),
          getInstrutores()
        ]);

        console.log('📊 Dados carregados:');
        console.log('  - Matrículas:', enrollments.length);
        console.log('  - Cursos:', cursos.length);
        console.log('  - Usuários:', usuarios.length);
        console.log('  - Instrutores:', instrutores.length);

        // Encontrar matrícula com o código de verificação
        const foundEnrollment = enrollments.find(en => en.verificationCode === decodedCode);
        
        if (foundEnrollment && foundEnrollment.approved) {
          console.log('✅ Matrícula encontrada:', foundEnrollment);
          
          // Encontrar usuário
          const foundPerson = usuarios.find(u => u.id === foundEnrollment.userId);
          
          // Encontrar curso
          const foundCourse = cursos.find(c => c.id === foundEnrollment.courseId);
          
          // Encontrar instrutor
          const foundInstructor = foundEnrollment.instructorId 
            ? instrutores.find(i => i.id === foundEnrollment.instructorId)
            : null;

          if (foundPerson && foundCourse) {
            setData({
              person: foundPerson,
              enrollment: foundEnrollment,
              course: foundCourse,
              instructor: foundInstructor
            });
          } else {
            console.log('❌ Usuário ou curso não encontrado');
            setData(null);
          }
        } else {
          console.log('❌ Matrícula não encontrada ou não aprovada');
          setData(null);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar certificado:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    verifyCertificate();
  }, [params.code]);

  if (loading) {
    return (
      <div className="bg-muted min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl text-center">
          <div className="flex justify-center mb-6">
            <Logo className="size-16 text-primary" />
          </div>
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Verificando certificado...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { course, person, enrollment, instructor } = data || {};

  return (
    <div className="bg-muted min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl text-center">
            <div className="flex justify-center mb-6">
                <Logo className="size-16 text-primary" />
            </div>
            {enrollment && person && course ? (
                <Card className="text-left">
                    <CardHeader>
                        <div className="flex items-center gap-3 text-green-600">
                           <ShieldCheck className="h-8 w-8"/>
                           <div>
                                <CardTitle className="text-2xl">Certificado Autêntico</CardTitle>
                                <CardDescription>Este certificado foi emitido pela Seanutri e é válido.</CardDescription>
                           </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Nome</p>
                          <p className="text-lg font-semibold">{person.name}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Curso Concluído</p>
                          <p className="text-lg font-semibold">{course.title || course.titulo}</p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Data de Conclusão</p>
                                <p className="font-semibold">
                                  {enrollment.completionDate 
                                    ? format(enrollment.completionDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                    : 'Data não informada'
                                  }
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Instrutor</p>
                                <p className="font-semibold">{instructor?.name ?? 'Não definido'}</p>
                            </div>
                       </div>
                        <div className="space-y-1 pt-4 text-center">
                            <p className="text-sm text-muted-foreground">Código de Verificação</p>
                            <p className="font-mono text-sm tracking-wider">{enrollment.verificationCode}</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                         <div className="flex items-center gap-3 text-destructive">
                           <ShieldX className="h-8 w-8"/>
                           <div>
                                <CardTitle className="text-2xl">Certificado Inválido</CardTitle>
                                <CardDescription>Não foi encontrado nenhum certificado com o código "{decodeURIComponent(params.code as string)}".</CardDescription>
                           </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Por favor, verifique se o código foi digitado corretamente e tente novamente. Se o problema persistir, entre em contato com o emissor do certificado.
                        </p>
                    </CardContent>
                </Card>
            )}
             <Button variant="outline" onClick={() => router.push('/')} className="mt-8">
                Voltar
            </Button>
        </div>
    </div>
  );
}
