
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getEmpresas } from "@/lib/empresas-firebase";
import { getUsers } from "@/lib/users-firebase";
import { getAgendamentos, updateAgendamento } from "@/lib/agendamentos-firebase";
import type { Curso } from "@/lib/cursos-firebase";

export const BulkEnrollDialog = ({ course, children }: { course: Curso, children: React.ReactNode }) => {
    const { toast } = useToast();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [companyId, setCompanyId] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [agendamentos, setAgendamentos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [empresasData, usersData, agendamentosData] = await Promise.all([
                    getEmpresas(),
                    getUsers(),
                    getAgendamentos()
                ]);
                setEmpresas(empresasData);
                setUsers(usersData);
                setAgendamentos(agendamentosData);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                toast({
                    variant: 'destructive',
                    title: 'Erro',
                    description: 'Falha ao carregar dados'
                });
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            loadData();
        }
    }, [isOpen, toast]);

    const studentsInCompany = useMemo(() => {
        if (!companyId) return [];
        return users.filter(u => u.companyId === companyId && u.profile === 'Aluno');
    }, [companyId, users]);

    const availableClasses = useMemo(() => {
        return agendamentos.filter(sc => sc.courseId === course.id && sc.status === 'Agendada');
    }, [agendamentos, course.id]);
    
    useEffect(() => {
        if (!isOpen) {
            // Reset state on close
            setStep(1);
            setCompanyId('');
            setSelectedStudents([]);
            setSelectedClassId('');
        }
    }, [isOpen]);

    const handleSelectStudent = (studentId: string) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId) 
                : [...prev, studentId]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudents(studentsInCompany.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };
    
    const handleNextStep = () => {
        if (step === 1 && !companyId) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione uma empresa.' });
            return;
        }
        if (step === 2 && selectedStudents.length === 0) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Selecione pelo menos um aluno.' });
            return;
        }
        setStep(prev => prev + 1);
    };
    
    const handlePrevStep = () => {
        setStep(prev => prev - 1);
    }
    
    const handleFinish = async () => {
        if (!selectedClassId) {
             toast({ variant: 'destructive', title: 'Erro', description: 'Selecione uma turma para matricular os alunos.' });
            return;
        }

        const scheduledClass = agendamentos.find(sc => sc.id === selectedClassId);
        if (!scheduledClass) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Turma selecionada não encontrada.' });
            return;
        }
        
        try {
            // Combine old and new student IDs, removing duplicates
            const updatedStudentIds = Array.from(new Set([...scheduledClass.studentIds, ...selectedStudents]));
            
            await updateAgendamento(selectedClassId, { studentIds: updatedStudentIds });
            
                         toast({
                 title: "Sucesso!",
                 description: `${selectedStudents.length} aluno(s) matriculado(s) na turma de ${format(scheduledClass.scheduledDate, "dd/MM/yyyy")}.`
             });
            setIsOpen(false);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Falha ao matricular alunos'
            });
        }
    }

    if (loading) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                            <p>Carregando...</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Matrícula em Lote: {course.titulo}</DialogTitle>
                    <DialogDescription>
                        Siga os passos para matricular múltiplos alunos de uma empresa. (Passo {step} de 3)
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {step === 1 && (
                        <div className="space-y-2">
                            <Label htmlFor="company">1. Selecione a Empresa</Label>
                            <Select value={companyId} onValueChange={setCompanyId}>
                                <SelectTrigger id="company">
                                    <SelectValue placeholder="Escolha uma empresa..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {empresas.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {step === 2 && (
                         <div className="space-y-2">
                            <Label>2. Selecione os Alunos</Label>
                             <div className="flex items-center p-2 border rounded-md">
                                <Checkbox 
                                    id="select-all" 
                                    checked={selectedStudents.length === studentsInCompany.length && studentsInCompany.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                                <Label htmlFor="select-all" className="ml-2 font-medium">Selecionar Todos</Label>
                            </div>
                            <ScrollArea className="h-64 rounded-md border p-2">
                                <div className="space-y-2">
                                    {studentsInCompany.length > 0 ? studentsInCompany.map(student => (
                                        <div key={student.id} className="flex items-center gap-2 p-1">
                                            <Checkbox 
                                                id={`student-${student.id}`}
                                                checked={selectedStudents.includes(student.id)}
                                                onCheckedChange={() => handleSelectStudent(student.id)}
                                            />
                                            <Label htmlFor={`student-${student.id}`} className="font-normal flex-1 cursor-pointer">{student.name}</Label>
                                        </div>
                                    )) : (
                                        <p className="text-center text-sm text-muted-foreground p-4">Nenhum aluno encontrado para esta empresa.</p>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                     {step === 3 && (
                         <div className="space-y-2">
                            <Label>3. Atribuir a uma Turma</Label>
                            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma turma agendada..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableClasses.length > 0 ? availableClasses.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            Turma de {format(c.scheduledDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </SelectItem>
                                    )) : (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            Nenhuma turma agendada para este curso.
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                             <p className="text-xs text-muted-foreground text-center pt-2">
                                Não encontrou uma turma?{' '}
                                <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => router.push('/agendamentos')}>
                                    Agende uma nova turma primeiro.
                                </Button>
                             </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="justify-between">
                    <div>
                        {step > 1 && <Button variant="outline" onClick={handlePrevStep}>Voltar</Button>}
                    </div>
                    <div>
                        {step < 3 && <Button onClick={handleNextStep}>Próximo</Button>}
                        {step === 3 && <Button onClick={handleFinish}>Concluir Matrícula</Button>}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
