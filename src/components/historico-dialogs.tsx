'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { type Enrollment } from "@/lib/firebase-db";
import { type ScheduledClass } from "@/lib/agendamentos-firebase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Edit, Trash2, Plus, Clock, MapPin, Link as LinkIcon, Mail, Send, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { addNotificationLog } from "@/lib/firebase-db";
import { notificationSettings } from "@/lib/data";
import { sendEmail } from "@/services/email";

export const AddEnrollmentDialog = ({ 
  onSave, 
  children, 
  isOpen, 
  setIsOpen,
  courses = [],
  users = []
}: { 
  onSave: (data: Omit<Enrollment, 'id'>) => void, 
  children: React.ReactNode, 
  isOpen: boolean, 
  setIsOpen: (open: boolean) => void,
  courses?: any[],
  users?: any[]
}) => {
  const [courseId, setCourseId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [status, setStatus] = useState<'Não Iniciado' | 'Em Progresso' | 'Concluído'>('Não Iniciado');
  const [grade, setGrade] = useState<number | undefined>(undefined);
  const [approved, setApproved] = useState<boolean | undefined>(undefined);
  const [completionDate, setCompletionDate] = useState<Date | undefined>(undefined);
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');
    if (!courseId || !userId) {
      setError('Curso e usuário são obrigatórios.');
      return;
    }
    
    // Gerar código de verificação único se aprovado
    const verificationCode = approved ? `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : null;
    
    const enrollmentData: Omit<Enrollment, 'id'> = {
      courseId,
      userId,
      status,
      grade: grade || null,
      approved: approved || null,
      completionDate: completionDate || null,
      verificationCode,
      instructorId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onSave(enrollmentData);
    setIsOpen(false);
    // Reset state
    setCourseId('');
    setUserId('');
    setStatus('Não Iniciado');
    setGrade(undefined);
    setApproved(undefined);
    setCompletionDate(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Matrícula</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da nova matrícula.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="course">Curso</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger id="course">
                <SelectValue placeholder="Selecione um curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.titulo || course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user">Usuário</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger id="user">
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <RadioGroup value={status} onValueChange={(v) => setStatus(v as any)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Não Iniciado" id="nao-iniciado" />
                <Label htmlFor="nao-iniciado">Não Iniciado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Em Progresso" id="em-progresso" />
                <Label htmlFor="em-progresso">Em Progresso</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Concluído" id="concluido" />
                <Label htmlFor="concluido">Concluído</Label>
              </div>
            </RadioGroup>
          </div>
          
          {status === 'Concluído' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="grade">Nota (0-100)</Label>
                <Input 
                  id="grade" 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={grade || ''} 
                  onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : undefined)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Aprovado</Label>
                <RadioGroup value={approved?.toString() || ''} onValueChange={(v) => setApproved(v === 'true')} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="aprovado" />
                    <Label htmlFor="aprovado">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="reprovado" />
                    <Label htmlFor="reprovado">Não</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="completion-date">Data de Conclusão</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="completion-date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !completionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {completionDate ? format(completionDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={completionDate}
                      onSelect={setCompletionDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {approved && courseId && userId && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Código de Verificação:</strong> CERT-{Date.now()}-{Math.random().toString(36).substr(2, 9)}
                  </p>
                </div>
              )}
            </>
          )}
          
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const EditEnrollmentDialog = ({ 
  enrollmentData, 
  onSave, 
  isOpen, 
  setIsOpen,
  courses = [],
  users = []
}: { 
  enrollmentData: Enrollment | null, 
  onSave: (id: string, data: Partial<Enrollment>) => void, 
  isOpen: boolean, 
  setIsOpen: (open: boolean) => void,
  courses?: any[],
  users?: any[]
}) => {
  const [courseId, setCourseId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [status, setStatus] = useState<'Não Iniciado' | 'Em Progresso' | 'Concluído'>('Não Iniciado');
  const [grade, setGrade] = useState<number | undefined>(undefined);
  const [approved, setApproved] = useState<boolean | undefined>(undefined);
  const [completionDate, setCompletionDate] = useState<Date | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    if (enrollmentData) {
      setCourseId(enrollmentData.courseId);
      setUserId(enrollmentData.userId);
      setStatus(enrollmentData.status);
      setGrade(enrollmentData.grade || undefined);
      setApproved(enrollmentData.approved || undefined);
      setCompletionDate(enrollmentData.completionDate || undefined);
    }
  }, [enrollmentData]);

  const handleSave = () => {
    setError('');
    if (!enrollmentData) return;
    if (!courseId || !userId) {
      setError('Curso e usuário são obrigatórios.');
      return;
    }
    
    const dataToUpdate: Partial<Enrollment> = {
      courseId,
      userId,
      status,
      grade,
      approved,
      completionDate,
      updatedAt: new Date()
    };
    
    onSave(enrollmentData.id, dataToUpdate);
    setIsOpen(false);
  };

  if (!enrollmentData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Matrícula</DialogTitle>
          <DialogDescription>
            Faça alterações nos detalhes da matrícula.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="course-edit">Curso</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger id="course-edit">
                <SelectValue placeholder="Selecione um curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.titulo || course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user-edit">Usuário</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger id="user-edit">
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <RadioGroup value={status} onValueChange={(v) => setStatus(v as any)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Não Iniciado" id="nao-iniciado-edit" />
                <Label htmlFor="nao-iniciado-edit">Não Iniciado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Em Progresso" id="em-progresso-edit" />
                <Label htmlFor="em-progresso-edit">Em Progresso</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Concluído" id="concluido-edit" />
                <Label htmlFor="concluido-edit">Concluído</Label>
              </div>
            </RadioGroup>
          </div>
          
          {status === 'Concluído' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="grade-edit">Nota (0-100)</Label>
                <Input 
                  id="grade-edit" 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={grade || ''} 
                  onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : undefined)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Aprovado</Label>
                <RadioGroup value={approved?.toString() || ''} onValueChange={(v) => setApproved(v === 'true')} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="aprovado-edit" />
                    <Label htmlFor="aprovado-edit">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="reprovado-edit" />
                    <Label htmlFor="reprovado-edit">Não</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="completion-date-edit">Data de Conclusão</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="completion-date-edit"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !completionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {completionDate ? format(completionDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={completionDate}
                      onSelect={setCompletionDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}
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

export const DeleteEnrollmentDialog = ({ 
  enrollmentData, 
  onDelete, 
  isOpen, 
  setIsOpen 
}: { 
  enrollmentData: Enrollment | null, 
  onDelete: (id: string) => void, 
  isOpen: boolean, 
  setIsOpen: (open: boolean) => void 
}) => {
  const handleDelete = () => {
    if (enrollmentData) {
      onDelete(enrollmentData.id);
      setIsOpen(false);
    }
  };

  if (!enrollmentData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir esta matrícula? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Matrícula ID: {enrollmentData.id}</p>
              <p className="text-sm text-muted-foreground">
                Curso: {enrollmentData.courseId} | Usuário: {enrollmentData.userId}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 

// Diálogos para Agendamentos (ScheduledClass)

export const EditScheduledClassDialog = ({ 
  scheduledClassData, 
  onSave, 
  isOpen, 
  setIsOpen,
  courses = [],
  instructors = []
}: { 
  scheduledClassData: ScheduledClass | null, 
  onSave: (id: string, data: Partial<ScheduledClass>) => void, 
  isOpen: boolean, 
  setIsOpen: (open: boolean) => void,
  courses?: any[],
  instructors?: any[]
}) => {
  const [courseId, setCourseId] = useState<string>('');
  const [instructorId, setInstructorId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [locationType, setLocationType] = useState<'Presencial' | 'Online'>('Presencial');
  const [location, setLocation] = useState<string>('');
  const [status, setStatus] = useState<'Agendada' | 'Concluída'>('Concluída');
  const [observacoes, setObservacoes] = useState<string>('');
  const [maxStudents, setMaxStudents] = useState<number | undefined>(undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    if (scheduledClassData) {
      setCourseId(scheduledClassData.courseId);
      setInstructorId(scheduledClassData.instructorId);
      setScheduledDate(scheduledClassData.scheduledDate);
      setStartTime(scheduledClassData.startTime);
      setEndTime(scheduledClassData.endTime);
      setLocationType(scheduledClassData.locationType);
      setLocation(scheduledClassData.location);
      setStatus(scheduledClassData.status);
      setObservacoes(scheduledClassData.observacoes || '');
      setMaxStudents(scheduledClassData.maxStudents);
    }
  }, [scheduledClassData]);

  const handleSave = () => {
    setError('');
    if (!courseId || !instructorId || !scheduledDate || !startTime || !endTime || !location) {
      setError('Todos os campos obrigatórios devem ser preenchidos.');
      return;
    }
    
    const updateData: Partial<ScheduledClass> = {
      courseId,
      instructorId,
      scheduledDate,
      startTime,
      endTime,
      locationType,
      location,
      status,
      observacoes: observacoes || undefined,
      maxStudents,
      updatedAt: new Date()
    };
    
    if (scheduledClassData) {
      onSave(scheduledClassData.id, updateData);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
          <DialogDescription>
            Edite os detalhes do agendamento concluído.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-y-auto flex-1">
          <div className="space-y-2">
            <Label htmlFor="course">Curso</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger id="course">
                <SelectValue placeholder="Selecione um curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.titulo || course.title}
                  </SelectItem>
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
                  <SelectItem key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="scheduled-date">Data Agendada</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="scheduled-date"
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
              <Label htmlFor="start-time">Horário de Início</Label>
              <Input 
                id="start-time" 
                type="time" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">Horário de Fim</Label>
              <Input 
                id="end-time" 
                type="time" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)} 
              />
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
            <Label htmlFor="location">Local</Label>
            <div className="flex items-center gap-2">
              {locationType === 'Online' ? <LinkIcon className="h-4 w-4 text-muted-foreground" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
              <Input 
                id="location" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                placeholder={locationType === 'Online' ? 'URL da reunião' : 'Endereço do local'}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <RadioGroup value={status} onValueChange={(v) => setStatus(v as any)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Agendada" id="agendada" />
                <Label htmlFor="agendada">Agendada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Concluída" id="concluida" />
                <Label htmlFor="concluida">Concluída</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-students">Máximo de Alunos</Label>
            <Input 
              id="max-students" 
              type="number" 
              min="1" 
              value={maxStudents || ''} 
              onChange={(e) => setMaxStudents(e.target.value ? Number(e.target.value) : undefined)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <textarea 
              id="observacoes" 
              value={observacoes} 
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Edit className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteScheduledClassDialog = ({ 
  scheduledClassData, 
  onDelete, 
  isOpen, 
  setIsOpen 
}: { 
  scheduledClassData: ScheduledClass | null, 
  onDelete: (id: string) => void, 
  isOpen: boolean, 
  setIsOpen: (open: boolean) => void 
}) => {
  const handleDelete = () => {
    if (scheduledClassData) {
      onDelete(scheduledClassData.id);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir Agendamento</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {scheduledClassData && (
            <div className="space-y-2">
              <p><strong>Curso:</strong> {scheduledClassData.courseName}</p>
              <p><strong>Instrutor:</strong> {scheduledClassData.instructorName}</p>
              <p><strong>Data:</strong> {format(scheduledClassData.scheduledDate, "dd/MM/yyyy", { locale: ptBR })}</p>
              <p><strong>Horário:</strong> {scheduledClassData.startTime} - {scheduledClassData.endTime}</p>
              <p><strong>Status:</strong> {scheduledClassData.status}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 

export const SendCertificateDialog = ({ 
  isOpen, 
  setIsOpen, 
  enrollment,
  course,
  user
}: { 
  isOpen: boolean, 
  setIsOpen: (open: boolean) => void, 
  enrollment: any,
  course: any,
  user: any
}) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setEmail(user.email || '');
    }
  }, [isOpen, user]);

  const handleSendCertificate = async () => {
    if (!email.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe um email válido",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);

      // Determinar o template baseado no status de aprovação
      const templateId = enrollment.approved ? 'result-approved' : 'result-failed';
      const template = notificationSettings.templates.find(t => t.id === templateId);

      if (!template || !template.enabled) {
        toast({
          title: "Erro",
          description: "Template de notificação não encontrado ou desabilitado",
          variant: "destructive",
        });
        return;
      }

      // Preparar o conteúdo do email com todas as variáveis
      const certificateUrl = enrollment.approved ? `${window.location.origin}/cursos/${course.id}/certificado/${user.id}` : '';
      const completionDate = enrollment.completionDate ? new Date(enrollment.completionDate).toLocaleDateString('pt-BR') : 'N/A';
      const completionTime = enrollment.completionDate ? new Date(enrollment.completionDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
      
      let subject = template.subject
        .replace(/{{nome_aluno}}/g, user.name || 'Aluno')
        .replace(/{{nome_curso}}/g, course.titulo || course.title || 'Curso')
        .replace(/{{local}}/g, course.local || 'Local não informado')
        .replace(/{{data}}/g, completionDate)
        .replace(/{{hora}}/g, completionTime)
        .replace(/{{nota}}/g, enrollment.grade?.toString() || 'N/A')
        .replace(/{{status}}/g, enrollment.approved ? 'Aprovado' : 'Reprovado')
        .replace(/{{link_certificado}}/g, certificateUrl);

      let content = template.content
        .replace(/{{nome_aluno}}/g, user.name || 'Aluno')
        .replace(/{{nome_curso}}/g, course.titulo || course.title || 'Curso')
        .replace(/{{local}}/g, course.local || 'Local não informado')
        .replace(/{{data}}/g, completionDate)
        .replace(/{{hora}}/g, completionTime)
        .replace(/{{nota}}/g, enrollment.grade?.toString() || 'N/A')
        .replace(/{{status}}/g, enrollment.approved ? 'Aprovado' : 'Reprovado')
        .replace(/{{link_certificado}}/g, certificateUrl);

      // Enviar email
      await sendEmail({
        to: email,
        subject: subject,
        text: content,
        html: content.replace(/\n/g, '<br>'),
        attachments: enrollment.approved ? [
          {
            filename: `certificado_${user.name}_${course.titulo || course.title}.pdf`,
            content: await generateCertificatePDF(enrollment.id),
            contentType: 'application/pdf',
            encoding: 'base64'
          }
        ] : undefined
      });

      // Registrar log de notificação
      await addNotificationLog({
        type: template.name,
        recipient: email
      }, user, course);

      toast({
        title: "Sucesso",
        description: `Email enviado com sucesso para ${email}`,
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao enviar certificado:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar email. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const generateCertificatePDF = async (enrollmentId: string) => {
    try {
      // Importar dinamicamente para evitar problemas de SSR
      const { jsPDF } = await import('jspdf');
      
      // Criar PDF simples sem usar html2canvas
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Configurar fonte e cores
      pdf.setFontSize(32);
      pdf.setTextColor(37, 99, 235); // Blue
      pdf.text('CERTIFICADO', pageWidth / 2, 40, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setTextColor(107, 114, 128); // Gray
      pdf.text('Certificamos que', pageWidth / 2, 70, { align: 'center' });
      
      pdf.setFontSize(48);
      pdf.setTextColor(37, 99, 235); // Blue
      pdf.setFont(undefined, 'bold');
      pdf.text(user.name || 'Aluno', pageWidth / 2, 110, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setTextColor(107, 114, 128); // Gray
      pdf.setFont(undefined, 'normal');
      pdf.text('concluiu com sucesso o curso de', pageWidth / 2, 140, { align: 'center' });
      
      pdf.setFontSize(32);
      pdf.setTextColor(0, 0, 0); // Black
      pdf.setFont(undefined, 'bold');
      pdf.text((course.titulo || course.title || 'Curso'), pageWidth / 2, 170, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(107, 114, 128); // Gray
      pdf.setFont(undefined, 'normal');
      const completionDate = enrollment.completionDate ? new Date(enrollment.completionDate).toLocaleDateString('pt-BR') : 'N/A';
      pdf.text(`Concluído em: ${completionDate}`, pageWidth / 2, 200, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(156, 163, 175); // Light gray
      pdf.text(`Código de Verificação: ${enrollment.verificationCode || 'N/A'}`, pageWidth / 2, 220, { align: 'center' });
      
      // Retornar como base64 string para evitar problemas com Uint8Array
      return pdf.output('datauristring').split(',')[1];
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Certificado por Email
          </DialogTitle>
          <DialogDescription>
            Envie o certificado do curso para o aluno por email.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student-name">Aluno</Label>
            <Input
              id="student-name"
              value={user?.name || ''}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="course-name">Curso</Label>
            <Input
              id="course-name"
              value={course?.titulo || course?.title || ''}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email do Destinatário</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o email do aluno"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${enrollment?.approved ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                {enrollment?.approved ? 'Aprovado' : 'Reprovado'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {enrollment?.approved 
                ? 'O certificado será anexado ao email.' 
                : 'Será enviada uma notificação de reprovação.'
              }
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSending}>
            Cancelar
          </Button>
          <Button onClick={handleSendCertificate} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 