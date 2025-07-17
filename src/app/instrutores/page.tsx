
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  MoreHorizontal,
  PlusCircle,
  Search,
  Building,
  UserCheck,
  LogOut,
  CalendarDays,
  CalendarIcon,
  Settings,
  History,
  Database,
} from "lucide-react";
import { GraduationCap } from "@/components/icons";
import { SidebarLogo } from "@/components/app-logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { UserSession } from "../page";
import { ThemeToggle } from "@/components/theme-toggle";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import * as XLSX from 'xlsx';
import { SidebarMenuComponent } from "@/components/sidebar-menu";
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase.config';
import { getInstrutores, addInstrutor, updateInstrutor, deleteInstrutor, type Instructor } from '@/lib/instrutores-firebase';

const instructorSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("O e-mail é inválido.").min(1, "O e-mail é obrigatório."),
  specialization: z.string().min(1, "A especialização é obrigatória."),
  phone: z.string().optional(),
  bio: z.string().optional(),
  status: z.enum(['Ativo', 'Inativo']).default('Ativo'),
});

const AddEditInstructorDialog = ({
  instructor,
  onSave,
  children,
  isOpen,
  setIsOpen,
}: {
  instructor?: Instructor | null;
  onSave: (data: z.infer<typeof instructorSchema>, id?: string) => void;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const form = useForm<z.infer<typeof instructorSchema>>({
    resolver: zodResolver(instructorSchema),
    defaultValues: {
      name: "",
      email: "",
      specialization: "",
      phone: "",
      bio: "",
      status: "Ativo"
    }
  });

  useEffect(() => {
    if (isOpen && instructor) {
      form.reset(instructor);
    } else if(isOpen) {
      form.reset({ 
        name: "", 
        email: "", 
        specialization: "", 
        phone: "", 
        bio: "", 
        status: "Ativo" 
      });
    }
  }, [instructor, isOpen, form]);

  const handleSubmit = (values: z.infer<typeof instructorSchema>) => {
    onSave(values, instructor?.id);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{instructor ? "Editar Instrutor" : "Adicionar Novo Instrutor"}</DialogTitle>
          <DialogDescription>
            {instructor ? "Faça alterações nos dados do instrutor." : "Preencha os dados do novo instrutor."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} id="add-instructor-form" className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Instrutor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Roberto Firmino" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de Contato</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Ex: roberto.f@instrutor.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialização</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Segurança Alimentar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: (11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Breve descrição sobre o instrutor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select 
                      {...field} 
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button type="submit" form="add-instructor-form">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function InstrutoresPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [instructorToDelete, setInstructorToDelete] = useState<Instructor | null>(null);
  
  const [user, setUser] = useState<UserSession | null>(null);

  const loadInstrutores = useCallback(async () => {
    try {
      setLoading(true);
      const instrutoresData = await getInstrutores();
      setInstructors(instrutoresData);
    } catch (error: any) {
      console.error('Erro ao carregar instrutores:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar instrutores',
        description: error.message || 'Falha ao carregar instrutores'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

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

  useEffect(() => {
    if (user) {
      loadInstrutores();
    }
  }, [user, loadInstrutores]);

  const handleOpenAddDialog = () => {
    setEditingInstructor(null);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setIsAddEditDialogOpen(true);
  };
  
  const handleSaveInstructor = async (data: z.infer<typeof instructorSchema>, id?: string) => {
    try {
      if (id) {
        await updateInstrutor(id, data);
        toast({ title: 'Sucesso!', description: 'Dados do instrutor atualizados.' });
      } else {
        await addInstrutor(data);
        toast({ title: 'Sucesso!', description: 'Novo instrutor adicionado.' });
      }
      loadInstrutores();
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Erro ao salvar instrutor', 
        description: error.message || 'Falha ao salvar instrutor' 
      });
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!instructorToDelete) return;
    
    try {
      await deleteInstrutor(instructorToDelete.id);
      toast({ 
        variant: 'destructive', 
        title: 'Excluído!', 
        description: `O instrutor ${instructorToDelete.name} foi removido.` 
      });
      setInstructorToDelete(null);
      loadInstrutores();
    } catch (error: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Erro ao excluir instrutor', 
        description: error.message || 'Falha ao excluir instrutor' 
      });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('userSession');
    router.push('/');
  };

  const filteredInstructors = useMemo(() => 
    instructors.filter(i => 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    ), 
    [instructors, searchQuery]
  );

  if (!user || user.profile !== 'Administrador') {
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
            <h1 className="text-2xl font-headline font-bold">Instrutores</h1>
          </div>
           <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person face" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Instrutores</CardTitle>
                  <CardDescription>
                    Gerencie os instrutores da plataforma e suas especializações.
                  </CardDescription>
                </div>
                <AddEditInstructorDialog
                  instructor={editingInstructor}
                  onSave={handleSaveInstructor}
                  isOpen={isAddEditDialogOpen}
                  setIsOpen={setIsAddEditDialogOpen}
                >
                  <Button onClick={handleOpenAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Instrutor
                  </Button>
                </AddEditInstructorDialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Busca */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar instrutores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Tabela */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando instrutores...</p>
                  </div>
                </div>
              ) : filteredInstructors.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum instrutor encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Tente ajustar os termos de busca."
                      : "Comece adicionando seu primeiro instrutor."}
                  </p>
                  {!searchQuery && (
                    <AddEditInstructorDialog
                      instructor={editingInstructor}
                      onSave={handleSaveInstructor}
                      isOpen={isAddEditDialogOpen}
                      setIsOpen={setIsAddEditDialogOpen}
                    >
                      <Button onClick={handleOpenAddDialog}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Primeiro Instrutor
                      </Button>
                    </AddEditInstructorDialog>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Instrutor</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Especialização</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInstructors.map((instructor) => (
                        <TableRow key={instructor.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={instructor.avatar} alt={instructor.name} />
                                <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{instructor.name}</div>
                                {instructor.phone && (
                                  <div className="text-sm text-muted-foreground">{instructor.phone}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{instructor.email}</TableCell>
                          <TableCell>{instructor.specialization}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              instructor.status === 'Ativo' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {instructor.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleOpenEditDialog(instructor)}>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setInstructorToDelete(instructor)}
                                  className="text-destructive"
                                >
                                  <LogOut className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!instructorToDelete} onOpenChange={() => setInstructorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o instrutor {instructorToDelete?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
