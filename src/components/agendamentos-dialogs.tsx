
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  courses as allCourses,
  instructors as allInstructors,
  companies as allCompanies,
  type User,
} from "@/lib/data";
import { updateEvaluation, addNotificationLog } from "@/lib/firebase-db";
import { type ScheduledClass } from "@/lib/agendamentos-firebase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, ChevronDown, Link as LinkIcon, MapPin, Send, Mail, Building, CheckCircle2, ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";

export const AddClassDialog = ({ onSave, children, isOpen, setIsOpen, courses = [], instructors = [], students = [], companies = [] }: { onSave: (data: Omit<ScheduledClass, 'id' | 'status'>) => void, children: React.ReactNode, isOpen: boolean, setIsOpen: (open: boolean) => void, courses?: any[], instructors?: any[], students?: any[], companies?: any[] }) => {
  const [courseId, setCourseId] = useState<string>('');
  const [instructorId, setInstructorId] = useState<string>('');
  const [companyId, setCompanyId] = useState<string>('');
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [locationType, setLocationType] = useState<'Presencial' | 'Online'>('Presencial');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const availableStudents = useMemo(() => {
    if (!companyId || companyId === 'all') return students.filter(u => u.profile === 'Aluno');
    return students.filter(u => u.profile === 'Aluno' && u.companyId === companyId);
  }, [companyId, students]);

  useEffect(() => {
    setStudentIds([]);
  }, [companyId]);

  const handleSelectStudent = useCallback((studentId: string) => {
    setStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  }, []);
  
  const handleSave = () => {
    setError('');
    if (!courseId || !instructorId || studentIds.length === 0 || !scheduledDate || !startTime || !endTime || !location) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    onSave({ 
      courseId, 
      instructorId, 
      studentIds, 
      scheduledDate, 
      startTime, 
      endTime, 
      locationType, 
      location,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setIsOpen(false);
    // Reset state
    setCourseId('');
    setInstructorId('');
    setCompanyId('');
    setStudentIds([]);
    setScheduledDate(undefined);
    setStartTime('');
    setEndTime('');
    setLocationType('Presencial');
    setLocation('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agendar Nova Turma</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para criar uma nova turma.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="course">Curso</Label>
                    <Select value={courseId} onValueChange={setCourseId}>
                        <SelectTrigger id="course">
                            <SelectValue placeholder="Selecione um curso" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map(course => (
                                <SelectItem key={course.id} value={course.id}>{course.titulo || course.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="instructor">Instrutor</Label>
                    <Select value={instructorId} onValueChange={setInstructorId}>
                        <SelectTrigger id="instructor">
                            <SelectValue placeholder="Selecione um instrutor" />
                        </SelectTrigger>
                        <SelectContent>
                            {instructors.map(instructor => (
                                <SelectItem key={instructor.id} value={instructor.id}>{instructor.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="date">Data do Agendamento</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !scheduledDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {scheduledDate ? format(scheduledDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={scheduledDate}
                                onSelect={setScheduledDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start-time">Hora de Início</Label>
                        <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end-time">Hora de Término</Label>
                        <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Tipo de Local</Label>
                     <RadioGroup value={locationType} onValueChange={(v) => setLocationType(v as any)} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Presencial" id="presencial" />
                            <Label htmlFor="presencial">Presencial</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Online" id="online" />
                            <Label htmlFor="online">Online</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">{locationType === 'Presencial' ? 'Endereço do Local' : 'Link da Reunião'}</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={locationType === 'Presencial' ? 'Ex: Rua Exemplo, 123' : 'Ex: https://meet.google.com/...'}/>
                </div>
            </div>
            <div className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Select value={companyId} onValueChange={setCompanyId}>
                        <SelectTrigger id="company">
                            <SelectValue placeholder="Filtrar alunos por empresa" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">Todas as Empresas</SelectItem>
                            {companies.map(company => (
                                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Alunos</Label>
                    <ScrollArea className="h-[360px] rounded-md border p-2">
                        <div className="space-y-2">
                            {availableStudents.map(person => (
                            <div key={person.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                                <Checkbox 
                                id={`person-${person.id}`} 
                                checked={studentIds.includes(person.id)}
                                onCheckedChange={() => handleSelectStudent(person.id)}
                                />
                                <Avatar className="h-8 w-8">
                                <AvatarImage src={person.avatar} alt={person.name} data-ai-hint={person.hint}/>
                                <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Label htmlFor={`person-${person.id}`} className="font-medium cursor-pointer flex-1">{person.name}</Label>
                            </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Agendamento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const EditClassDialog = ({ 
  classData, 
  onSave, 
  isOpen, 
  setIsOpen,
  courses = [],
  instructors = [],
  students = [],
  companies = []
}: { 
  classData: ScheduledClass | null, 
  onSave: (id: string, data: Partial<Omit<ScheduledClass, 'id'>>) => void, 
  isOpen: boolean, 
  setIsOpen: (open: boolean) => void,
  courses?: any[],
  instructors?: any[],
  students?: any[],
  companies?: any[]
}) => {
  const [courseId, setCourseId] = useState<string>('');
  const [instructorId, setInstructorId] = useState<string>('');
  const [companyId, setCompanyId] = useState<string>('');
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [locationType, setLocationType] = useState<'Presencial' | 'Online'>('Presencial');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const availableStudents = useMemo(() => {
    if (!companyId || companyId === 'all') return students.filter(u => u.profile === 'Aluno');
    return students.filter(u => u.profile === 'Aluno' && u.companyId === companyId);
  }, [companyId, students]);
  
  useEffect(() => {
    if (classData) {
      setCourseId(classData.courseId);
      setInstructorId(classData.instructorId);
      setStudentIds(classData.studentIds);
      setScheduledDate(classData.scheduledDate);
      setStartTime(classData.startTime);
      setEndTime(classData.endTime);
      setLocationType(classData.locationType);
      setLocation(classData.location);
      
      const firstStudentCompany = students.find(u => u.id === classData.studentIds[0])?.companyId;
      if (firstStudentCompany && classData.studentIds.every(sid => students.find(u => u.id === sid)?.companyId === firstStudentCompany)) {
        setCompanyId(firstStudentCompany);
      } else {
        setCompanyId('');
      }

    }
  }, [classData, students]);
  
  const handleSelectStudent = useCallback((studentId: string) => {
    setStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  }, []);
  
  const handleSave = () => {
    setError('');
    if (!classData) return;
    if (!courseId || !instructorId || studentIds.length === 0 || !scheduledDate || !startTime || !endTime || !location) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    // Buscar nomes pelo ID
    const course = courses.find(c => c.id === courseId);
    const instructor = instructors.find(i => i.id === instructorId);
    onSave(classData.id, {
      courseId,
      courseName: course?.titulo || course?.title || '',
      instructorId,
      instructorName: instructor?.name || '',
      studentIds,
      scheduledDate,
      startTime,
      endTime,
      locationType,
      location
    });
    setIsOpen(false);
  };

  if (!classData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Turma Agendada</DialogTitle>
          <DialogDescription>
            Faça alterações nos detalhes da turma abaixo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="course-edit">Curso</Label>
                    <Select value={courseId} onValueChange={setCourseId}>
                        <SelectTrigger id="course-edit">
                            <SelectValue placeholder="Selecione um curso" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map(course => (
                                <SelectItem key={course.id} value={course.id}>{course.titulo || course.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="instructor-edit">Instrutor</Label>
                    <Select value={instructorId} onValueChange={setInstructorId}>
                        <SelectTrigger id="instructor-edit">
                            <SelectValue placeholder="Selecione um instrutor" />
                        </SelectTrigger>
                        <SelectContent>
                            {instructors.map(instructor => (
                                <SelectItem key={instructor.id} value={instructor.id}>{instructor.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="date-edit">Data do Agendamento</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date-edit"
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !scheduledDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {scheduledDate ? format(scheduledDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={scheduledDate}
                                onSelect={setScheduledDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start-time-edit">Hora de Início</Label>
                        <Input id="start-time-edit" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end-time-edit">Hora de Término</Label>
                        <Input id="end-time-edit" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Tipo de Local</Label>
                     <RadioGroup value={locationType} onValueChange={(v) => setLocationType(v as any)} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Presencial" id="presencial-edit" />
                            <Label htmlFor="presencial-edit">Presencial</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Online" id="online-edit" />
                            <Label htmlFor="online-edit">Online</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location-edit">{locationType === 'Presencial' ? 'Endereço do Local' : 'Link da Reunião'}</Label>
                    <Input id="location-edit" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={locationType === 'Presencial' ? 'Ex: Rua Exemplo, 123' : 'Ex: https://meet.google.com/...'}/>
                </div>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="company-edit">Empresa</Label>
                    <Select value={companyId} onValueChange={setCompanyId}>
                        <SelectTrigger id="company-edit">
                            <SelectValue placeholder="Filtrar alunos por empresa" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">Todas as Empresas</SelectItem>
                            {companies.map(company => (
                                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Alunos</Label>
                    <ScrollArea className="h-[360px] rounded-md border p-2">
                        <div className="space-y-2">
                            {availableStudents.map(person => (
                            <div key={person.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                                <Checkbox 
                                id={`edit-person-${person.id}`} 
                                checked={studentIds.includes(person.id)}
                                onCheckedChange={() => handleSelectStudent(person.id)}
                                />
                                <Avatar className="h-8 w-8">
                                <AvatarImage src={person.avatar} alt={person.name} data-ai-hint={person.hint}/>
                                <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Label htmlFor={`edit-person-${person.id}`} className="font-medium cursor-pointer flex-1">{person.name}</Label>
                            </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ViewClassDialog = ({ classData, isOpen, setIsOpen, students = [] }: { classData: any | null, isOpen: boolean, setIsOpen: (open: boolean) => void, students?: any[] }) => {
    if (!classData) return null;

    console.log('🔍 ViewClassDialog - Debug:');
    console.log('  - classData:', classData);
    console.log('  - classData.studentIds:', classData.studentIds);
    console.log('  - students:', students);
    console.log('  - students.length:', students.length);

    const enrolledStudents = students.filter(p => classData.studentIds.includes(p.id));
    
    console.log('  - enrolledStudents:', enrolledStudents);
    console.log('  - enrolledStudents.length:', enrolledStudents.length);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{classData.courseName}</DialogTitle>
                    <DialogDescription>
                        Agendado para {format(classData.scheduledDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} das {classData.startTime} às {classData.endTime}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Instrutor</Label>
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={classData.instructorAvatar} alt={classData.instructorName} data-ai-hint={classData.instructorHint} />
                                <AvatarFallback>{classData.instructorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{classData.instructorName}</span>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Local</Label>
                         <div className="flex items-center gap-3 text-sm">
                            {classData.locationType === 'Presencial' ? <MapPin className="h-4 w-4 text-muted-foreground" /> : <LinkIcon className="h-4 w-4 text-muted-foreground" />}
                            {classData.locationType === 'Online' ? (
                                <a href={classData.location} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                                    {classData.location}
                                </a>
                            ) : (
                                <span className="text-foreground">{classData.location}</span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Alunos Matriculados ({enrolledStudents.length})</Label>
                        <ScrollArea className="h-48 rounded-md border p-2">
                            <div className="space-y-2">
                                {enrolledStudents.map(student => (
                                    <div key={student.id} className="flex items-center gap-3 p-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={student.avatar} alt={student.name} data-ai-hint={student.hint}/>
                                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{student.name}</span>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => setIsOpen(false)}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type EvaluationState = {
    [studentId: string]: {
        grade: number | undefined;
        approved: boolean | undefined;
    }
}

export const ConcludeClassDialog = ({ classData, isOpen, setIsOpen, onConclude, students = [], companies = [] }: { classData: any | null, isOpen: boolean, setIsOpen: (open: boolean) => void, onConclude: (classId: string, approvedStudents: User[], updatedFields: Partial<ScheduledClass>) => void, students?: any[], companies?: any[] }) => {
    const { toast } = useToast();
    const [evaluations, setEvaluations] = useState<EvaluationState>({});
    const [error, setError] = useState('');

    const [actualDate, setActualDate] = useState<Date | undefined>();
    const [actualStartTime, setActualStartTime] = useState('');
    const [actualEndTime, setActualEndTime] = useState('');

    const classStudents = useMemo(() => {
        if (!classData) return [];
        return students
            .filter(p => classData.studentIds.includes(p.id))
            .map(s => ({ ...s, companyName: companies.find(c => c.id === s.companyId)?.name ?? 'N/A' }));
    }, [classData, students, companies]);

    useEffect(() => {
        if (classData) {
            const initialEvals: EvaluationState = {};
            classData.studentIds.forEach((studentId: string) => {
                initialEvals[studentId] = { grade: undefined, approved: undefined };
            });
            setEvaluations(initialEvals);

            setActualDate(classData.scheduledDate);
            setActualStartTime(classData.startTime);
            setActualEndTime(classData.endTime);
        }
    }, [classData]);

    const handleEvaluationChange = (studentId: string, field: 'grade' | 'approved', value: number | boolean | undefined) => {
        setEvaluations(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const handleConclude = () => {
        setError('');
        if (!actualDate || !actualStartTime || !actualEndTime) {
            setError('Por favor, confirme a data e hora de realização.');
            return;
        }

        console.log('🔍 ConcludeClassDialog - handleConclude - Debug:');
        console.log('  - evaluations:', evaluations);
        console.log('  - students:', students);
        console.log('  - classData:', classData);

        let evaluationsCount = 0;
        const approvedStudents: User[] = [];

        for (const studentId in evaluations) {
            const evalData = evaluations[studentId];
            console.log(`📊 Avaliando aluno ${studentId}:`, evalData);
            
            if(evalData.grade !== undefined && evalData.approved !== undefined) {
                 updateEvaluation(studentId, classData.courseId, { grade: evalData.grade, approved: evalData.approved, completionDate: actualDate });
                 if (evalData.approved) {
                    const student = students.find(u => u.id === studentId);
                    if (student) {
                        console.log(`✅ Aluno aprovado encontrado:`, {
                            id: student.id,
                            name: student.name,
                            email: student.email
                        });
                        approvedStudents.push(student);
                    } else {
                        console.log(`❌ Aluno aprovado não encontrado na lista de estudantes:`, studentId);
                    }
                 }
                 evaluationsCount++;
            } else {
                console.log(`⚠️ Avaliação incompleta para aluno ${studentId}:`, evalData);
            }
        }
        
        console.log('📋 Resumo das avaliações:');
        console.log('  - Total de avaliações:', evaluationsCount);
        console.log('  - Alunos aprovados:', approvedStudents.length);
        console.log('  - Lista de aprovados:', approvedStudents);
        
        if (evaluationsCount === 0) {
            setError('Nenhuma avaliação foi preenchida. Avalie pelo menos um aluno para concluir.');
            return;
        }

        toast({
            title: "Sucesso!",
            description: `${evaluationsCount} aluno(s) foram avaliados e a turma foi concluída.`
        });
        
        onConclude(classData.id, approvedStudents, {
            scheduledDate: actualDate,
            startTime: actualStartTime,
            endTime: actualEndTime
        });
        setIsOpen(false);
    };

    if (!classData) return null;
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Concluir e Avaliar Turma</DialogTitle>
                    <DialogDescription>
                        Confirme a data de realização e registre as notas e o status final dos alunos para o curso <strong>{classData.courseName}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="p-4 bg-muted/50 rounded-md border space-y-4">
                        <Label>Confirmação de Data e Horário de Realização</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-full justify-start text-left font-normal", !actualDate && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {actualDate ? format(actualDate, "PPP", { locale: ptBR }) : <span>Data Real</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={actualDate} onSelect={setActualDate} initialFocus /></PopoverContent>
                            </Popover>
                            <Input type="time" value={actualStartTime} onChange={(e) => setActualStartTime(e.target.value)} />
                            <Input type="time" value={actualEndTime} onChange={(e) => setActualEndTime(e.target.value)} />
                        </div>
                     </div>
                    <ScrollArea className="h-64 pr-4">
                        <div className="space-y-2">
                             {classStudents.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">Nenhum aluno encontrado para esta turma.</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        IDs dos alunos: {classData.studentIds.join(', ')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Total de alunos disponíveis: {students.length}
                                    </p>
                                </div>
                             ) : (
                                classStudents.map(student => (
                                <Collapsible key={student.id} className="border rounded-md group">
                                    <CollapsibleTrigger asChild>
                                        <div className="w-full flex items-center justify-between p-3 hover:bg-accent cursor-pointer">
                                            <div className="flex items-center gap-3 text-left">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={student.avatar} alt={student.name} data-ai-hint={student.hint} />
                                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{student.name}</p>
                                                    <p className="text-xs text-muted-foreground">{student.companyName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {evaluations[student.id]?.grade !== undefined && (
                                                    <Badge variant="secondary">Nota: {evaluations[student.id].grade}</Badge>
                                                )}
                                                {evaluations[student.id]?.approved !== undefined && (
                                                    <Badge variant={evaluations[student.id].approved ? 'default' : 'destructive'}>
                                                        {evaluations[student.id].approved ? 'Aprovado' : 'Reprovado'}
                                                    </Badge>
                                                )}
                                                <Button variant="ghost" size="sm" className="p-1 h-auto">
                                                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="p-4 bg-muted/50 border-t">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`grade-${student.id}`}>Nota Final (0 a 10)</Label>
                                                <Input 
                                                    id={`grade-${student.id}`} 
                                                    type="number" 
                                                    step="0.1" 
                                                    min="0" 
                                                    max="10" 
                                                    value={evaluations[student.id]?.grade ?? ''}
                                                    onChange={(e) => handleEvaluationChange(student.id, 'grade', e.target.valueAsNumber)}
                                                />
                                            </div>
                                             <div className="space-y-2">
                                                <Label>Resultado</Label>
                                                <RadioGroup 
                                                    className="flex gap-4 pt-2"
                                                    value={evaluations[student.id]?.approved === undefined ? '' : String(evaluations[student.id].approved)}
                                                    onValueChange={(val) => handleEvaluationChange(student.id, 'approved', val === 'true')}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="true" id={`approved-${student.id}`} />
                                                        <Label htmlFor={`approved-${student.id}`}>Aprovado</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="false" id={`reproved-${student.id}`} />
                                                        <Label htmlFor={`reproved-${student.id}`}>Reprovado</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                                ))
                             )}
                        </div>
                    </ScrollArea>
                </div>
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button onClick={handleConclude}>Salvar e Concluir Turma</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type EmailFormData = {
    [studentId: string]: {
        selected: boolean;
        email: string;
    };
};

export const SendCertificateDialog = ({ isOpen, setIsOpen, approvedStudents, courseName, courseId, courses = [] }: { isOpen: boolean, setIsOpen: (open: boolean) => void, approvedStudents: User[], courseName: string, courseId: string, courses?: any[] }) => {
    const { toast } = useToast();
    const [emailForm, setEmailForm] = useState<EmailFormData>({});
    const [studentEmail, setStudentEmail] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');

    useEffect(() => {
        const initialForm: EmailFormData = {};
            approvedStudents.forEach(student => {
            initialForm[student.id] = {
                selected: false,
                email: student.email || ''
                };
            });
        setEmailForm(initialForm);
    }, [approvedStudents]);

    const selectedCount = Object.values(emailForm).filter(item => item.selected).length;

    const handleSelectStudent = useCallback((studentId: string) => {
        setEmailForm(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                selected: !prev[studentId]?.selected
            }
        }));
    }, []);

    const handleSelectAll = useCallback((checked: boolean) => {
        const newForm: EmailFormData = {};
        approvedStudents.forEach(student => {
            newForm[student.id] = {
                selected: checked,
                email: student.email || ''
            };
        });
        setEmailForm(newForm);
    }, [approvedStudents]);

    const handleEmailChange = useCallback((studentId: string, email: string) => {
        setEmailForm(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                email
            }
        }));
    }, []);

    const handleSend = async () => {
        let sentCount = 0;
        const course = courses.find(c => c.titulo === courseName);

        if(!course) {
            toast({
                variant: 'destructive',
                title: "Erro",
                description: "Curso não encontrado para enviar notificações."
            });
            return;
        }

        for (const studentId in emailForm) {
            if (emailForm[studentId].selected) {
                const student = approvedStudents.find(s => s.id === studentId);
                if (student) {
                    try {
                        // Gerar certificado para o aluno
                        const certificateUrl = `/cursos/${courseId}/certificado/${student.id}`;
                        
                        // Enviar email usando o template "Resultado de Aprovação" com certificado anexado
                    await addNotificationLog({
                        type: "Resultado de Aprovação",
                            recipient: emailForm[studentId].email,
                        }, student, course, certificateUrl);
                        
                    sentCount++;
                    } catch (error) {
                        console.error(`Erro ao enviar notificação para ${student.name}:`, error);
                    }
                }
            }
        }

        if (sentCount === 0) {
            toast({
                variant: 'destructive',
                title: "Nenhum aluno selecionado",
                description: "Selecione pelo menos um aluno para enviar a notificação."
            });
            return;
        }

        toast({
            title: "Notificações Enviadas!",
            description: `${sentCount} e-mail(s) de conclusão foram processados com certificados anexados. Verifique o log para o status.`
        });
        setIsOpen(false);
    };

    const allSelected = approvedStudents.length > 0 && selectedCount === approvedStudents.length;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Enviar Certificados e Notificações</DialogTitle>
                    <DialogDescription>
                        Selecione os alunos para notificar sobre a conclusão do curso <strong>{courseName}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex items-center p-3 border rounded-md">
                        <Checkbox 
                            id="select-all" 
                            checked={allSelected}
                            onCheckedChange={() => handleSelectAll(!allSelected)}
                        />
                        <Label htmlFor="select-all" className="ml-3 font-medium">Selecionar Todos</Label>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="company-email">Email da Empresa (opcional)</Label>
                        <Input 
                            id="company-email"
                            type="email"
                            placeholder="empresa@exemplo.com"
                            value={companyEmail}
                            onChange={(e) => setCompanyEmail(e.target.value)}
                        />
                    </div>
                    
                    <ScrollArea className="h-64 pr-4">
                        <div className="space-y-3">
                            {approvedStudents.map(student => (
                                <div key={student.id} className="space-y-2 p-3 rounded-md border">
                                    <div className="flex items-center gap-3">
                                    <Checkbox 
                                        id={`send-${student.id}`} 
                                        checked={emailForm[student.id]?.selected ?? false}
                                        onCheckedChange={() => handleSelectStudent(student.id)}
                                    />
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={student.avatar} alt={student.name} data-ai-hint={student.hint} />
                                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className='text-left'>
                                            <Label htmlFor={`send-${student.id}`} className="font-medium cursor-pointer">{student.name}</Label>
                                        </div>
                                        </div>
                                    </div>
                                    <div className="ml-11 space-y-2">
                                        <Label htmlFor={`email-${student.id}`} className="text-sm">Email do Aluno</Label>
                                        <Input 
                                            id={`email-${student.id}`}
                                            type="email"
                                            value={emailForm[student.id]?.email || ''}
                                            onChange={(e) => handleEmailChange(student.id, e.target.value)}
                                            placeholder="aluno@exemplo.com"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Pular</Button>
                    <Button onClick={handleSend} disabled={selectedCount === 0}>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Notificações ({selectedCount})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export const EmailConfirmationDialog = ({ 
  isOpen, 
  setIsOpen, 
  agendamentoData, 
  students = [], 
  companies = [],
  onSendEmails 
}: { 
  isOpen: boolean, 
  setIsOpen: (open: boolean) => void, 
  agendamentoData: any,
  students?: any[],
  companies?: any[],
  onSendEmails: (studentEmails: string[], companyEmails: string[]) => void
}) => {
  const [selectedStudentEmails, setSelectedStudentEmails] = useState<string[]>([]);
  const [selectedCompanyEmails, setSelectedCompanyEmails] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [editableEmails, setEditableEmails] = useState<{[key: string]: string}>({});

  // Obter dados dos alunos e empresas do agendamento
  const agendamentoStudents = useMemo(() => 
    students.filter(student => 
      agendamentoData?.studentIds?.includes(student.id)
    ), [students, agendamentoData?.studentIds]
  );
  
  const agendamentoCompanies = useMemo(() => 
    companies.filter(company => 
      agendamentoStudents.some(student => student.companyId === company.id)
    ), [companies, agendamentoStudents]
  );

  // Inicializar emails editáveis
  useEffect(() => {
    const initialEmails: {[key: string]: string} = {};
    
    agendamentoStudents.forEach(student => {
      initialEmails[`student-${student.id}`] = student.email || '';
    });
    
    agendamentoCompanies.forEach(company => {
      initialEmails[`company-${company.id}`] = company.email || '';
    });
    
    setEditableEmails(initialEmails);
  }, [agendamentoStudents, agendamentoCompanies]);

  const handleSend = async () => {
    setIsSending(true);
    try {
      // Usar os emails editados
      const finalStudentEmails = selectedStudentEmails.map(email => {
        const student = agendamentoStudents.find(s => s.email === email);
        if (student) {
          return editableEmails[`student-${student.id}`] || email;
        }
        return email;
      });

      const finalCompanyEmails = selectedCompanyEmails.map(email => {
        const company = agendamentoCompanies.find(c => c.email === email);
        if (company) {
          return editableEmails[`company-${company.id}`] || email;
        }
        return email;
      });

      await onSendEmails(finalStudentEmails, finalCompanyEmails);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao enviar emails:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectAllStudents = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedStudentEmails(agendamentoStudents.map(s => s.email).filter(Boolean));
    } else {
      setSelectedStudentEmails([]);
    }
  }, [agendamentoStudents]);

  const handleSelectAllCompanies = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedCompanyEmails(agendamentoCompanies.map(c => c.email).filter(Boolean));
    } else {
      setSelectedCompanyEmails([]);
    }
  }, [agendamentoCompanies]);

  const handleSelectStudentEmail = useCallback((email: string, checked: boolean) => {
    if (checked) {
      setSelectedStudentEmails(prev => [...prev, email]);
    } else {
      setSelectedStudentEmails(prev => prev.filter(e => e !== email));
    }
  }, []);

  const handleSelectCompanyEmail = useCallback((email: string, checked: boolean) => {
    if (checked) {
      setSelectedCompanyEmails(prev => [...prev, email]);
    } else {
      setSelectedCompanyEmails(prev => prev.filter(e => e !== email));
    }
  }, []);

  const handleEmailChange = useCallback((key: string, value: string) => {
    setEditableEmails(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const allStudentsSelected = agendamentoStudents.length > 0 && 
    selectedStudentEmails.length === agendamentoStudents.filter(s => s.email).length;
  
  const allCompaniesSelected = agendamentoCompanies.length > 0 && 
    selectedCompanyEmails.length === agendamentoCompanies.filter(c => c.email).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirmar Envio de Emails</DialogTitle>
          <DialogDescription>
            Confirme os endereços de email para enviar notificações sobre o agendamento do curso.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Informações do Agendamento */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Detalhes do Agendamento</h4>
            <div className="text-sm space-y-1">
              <p><strong>Curso:</strong> {agendamentoData?.courseName}</p>
              <p><strong>Data:</strong> {agendamentoData?.scheduledDate ? format(agendamentoData.scheduledDate, "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}</p>
              <p><strong>Horário:</strong> {agendamentoData?.startTime} - {agendamentoData?.endTime}</p>
              <p><strong>Local:</strong> {agendamentoData?.location}</p>
            </div>
          </div>

          {/* Emails dos Alunos */}
          {agendamentoStudents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Emails dos Alunos</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="select-all-students" 
                    checked={allStudentsSelected}
                    onCheckedChange={handleSelectAllStudents}
                  />
                  <Label htmlFor="select-all-students" className="text-sm">Selecionar Todos</Label>
                </div>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {agendamentoStudents.map((student) => (
                  <div key={student.id} className="flex items-center space-x-3 p-2 border rounded">
                    <Checkbox 
                      id={`student-${student.id}`}
                      checked={selectedStudentEmails.includes(student.email)}
                      onCheckedChange={(checked) => handleSelectStudentEmail(student.email, checked as boolean)}
                      disabled={!student.email}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <Input
                        type="email"
                        value={editableEmails[`student-${student.id}`] || ''}
                        onChange={(e) => handleEmailChange(`student-${student.id}`, e.target.value)}
                        placeholder="Digite o email"
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emails das Empresas */}
          {agendamentoCompanies.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Emails das Empresas</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="select-all-companies" 
                    checked={allCompaniesSelected}
                    onCheckedChange={handleSelectAllCompanies}
                  />
                  <Label htmlFor="select-all-companies" className="text-sm">Selecionar Todos</Label>
                </div>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {agendamentoCompanies.map((company) => (
                  <div key={company.id} className="flex items-center space-x-3 p-2 border rounded">
                    <Checkbox 
                      id={`company-${company.id}`}
                      checked={selectedCompanyEmails.includes(editableEmails[`company-${company.id}`] || company.email || '')}
                      onCheckedChange={(checked) => handleSelectCompanyEmail(editableEmails[`company-${company.id}`] || company.email || '', checked as boolean)}
                      disabled={!editableEmails[`company-${company.id}`] && !company.email}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{company.name}</p>
                      <Input
                        type="email"
                        value={editableEmails[`company-${company.id}`] || company.email || ''}
                        onChange={(e) => handleEmailChange(`company-${company.id}`, e.target.value)}
                        placeholder="Digite o email da empresa"
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {agendamentoStudents.length === 0 && agendamentoCompanies.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum email disponível para envio.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSending}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending || (selectedStudentEmails.length === 0 && selectedCompanyEmails.length === 0)}
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Emails ({selectedStudentEmails.length + selectedCompanyEmails.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const CertificateGeneratedDialog = ({ 
  isOpen, 
  setIsOpen, 
  approvedStudents, 
  courseName,
  courseId,
  onOpenSendNotifications
}: { 
  isOpen: boolean, 
  setIsOpen: (open: boolean) => void, 
  approvedStudents: User[], 
  courseName: string,
  courseId: string,
  onOpenSendNotifications?: () => void
}) => {
  const { toast } = useToast();

  // Log de debug para verificar os dados recebidos
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 CertificateGeneratedDialog - Debug:');
      console.log('  - approvedStudents:', approvedStudents);
      console.log('  - courseName:', courseName);
      console.log('  - courseId:', courseId);
      console.log('  - approvedStudents.length:', approvedStudents.length);
      approvedStudents.forEach((student, index) => {
        console.log(`  - Aluno ${index + 1}:`, {
          id: student.id,
          name: student.name,
          email: student.email
        });
      });
    }
  }, [isOpen, approvedStudents, courseName, courseId]);

  const handleViewCertificate = (studentId: string, studentName: string) => {
    const certificateUrl = `/cursos/${courseId}/certificado/${studentId}`;
    window.open(certificateUrl, '_blank');
    
    toast({
      title: "Certificado Aberto",
      description: `Certificado de ${studentName} aberto em nova aba.`,
    });
  };

  const handleViewAllCertificates = () => {
    // Abrir o certificado do primeiro aluno aprovado como exemplo
    if (approvedStudents.length > 0) {
      const firstStudent = approvedStudents[0];
      const certificateUrl = `/cursos/${courseId}/certificado/${firstStudent.id}`;
      window.open(certificateUrl, '_blank');
      
      toast({
        title: "Certificado Aberto",
        description: `Certificado de ${firstStudent.name} aberto. Para ver outros certificados, clique nos links individuais ao lado dos nomes.`,
      });
    } else {
      // Fallback: redirecionar para a página de histórico
      window.open(`/historico`, '_blank');
      toast({
        title: "Certificados Disponíveis",
        description: `Acesse a página de histórico para visualizar todos os certificados.`,
      });
    }
  };

  const handleSendNotifications = () => {
    setIsOpen(false);
    if (onOpenSendNotifications) {
      onOpenSendNotifications();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Certificados Gerados com Sucesso!
          </DialogTitle>
          <DialogDescription>
            Os certificados para o curso <strong>{courseName}</strong> foram gerados e estão disponíveis na plataforma.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200">
                  {approvedStudents.length} certificado(s) gerado(s)
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Os alunos aprovados agora têm seus certificados disponíveis na plataforma.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Alunos Aprovados:</h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {approvedStudents.length > 0 ? (
                approvedStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium text-sm">{student.name}</span>
                        {student.email && (
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewCertificate(student.id, student.name)}
                      className="ml-2"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Ver Certificado
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Nenhum aluno aprovado encontrado.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button 
            variant="outline" 
            onClick={handleViewAllCertificates}
            className="w-full sm:w-auto"
            disabled={approvedStudents.length === 0}
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            Ver Primeiro Certificado
          </Button>
          <Button 
            onClick={handleSendNotifications}
            className="w-full sm:w-auto"
            disabled={approvedStudents.length === 0}
          >
            <Send className="mr-2 h-4 w-4" />
            Enviar Notificações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
