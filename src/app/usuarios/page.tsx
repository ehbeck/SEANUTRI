
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Trash2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck as ShieldCheckIcon,
  Upload,
  Database,
  Download,
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
import { 
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  type User,
} from "@/lib/users-firebase";
import { getEmpresas } from "@/lib/empresas-firebase";
import type { UserSession } from "../page";
import { ThemeToggle } from "@/components/theme-toggle";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import * as XLSX from 'xlsx';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase.config';
import { SidebarMenuComponent } from "@/components/sidebar-menu";

const userSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("O e-mail é inválido.").min(1, "O e-mail é obrigatório."),
  role: z.string().min(1, "A função é obrigatória."),
  profile: z.enum(["Administrador", "Aluno", "Instrutor", "Gestor de Empresa"]),
  companyId: z.string().min(1, "A empresa é obrigatória."),
  status: z.string().min(1, "O status é obrigatório."),
  avatar: z.any().optional(),
});


const AddEditUserDialog = ({
  user,
  onSave,
  children,
  isOpen,
  setIsOpen,
  companies,
}: {
  user?: User | null;
  onSave: (data: z.infer<typeof userSchema>, id?: string) => void;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  companies: any[];
}) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        form.reset({
          name: user.name,
          email: user.email,
          role: user.role,
          profile: user.profile,
          companyId: user.companyId,
          status: user.status,
          avatar: user.avatar,
        });
        setAvatarPreview(user.avatar || null);
      } else {
        form.reset({ name: "", email: "", role: "", profile: "Aluno", companyId: "", status: "Ativo", avatar: null });
        setAvatarPreview(null);
      }
    }
  }, [user, isOpen, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        form.setValue('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (values: z.infer<typeof userSchema>) => {
    onSave(values, user?.id);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Adicionar Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {user ? "Faça alterações nos dados do usuário." : "Preencha os dados do novo usuário."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} id="add-user-form" className="space-y-4 py-4">
             <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Foto do Rosto</FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={avatarPreview || undefined} alt="Avatar Preview" />
                                    <AvatarFallback>
                                        <Users className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>
                                <Input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                                <Button type="button" variant="outline" size="sm" asChild>
                                    <label htmlFor="avatar-upload" className="cursor-pointer">
                                        <Upload className="mr-2 h-4 w-4" />
                                        {user ? 'Alterar Imagem' : 'Enviar Imagem'}
                                    </label>
                                </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Ex: joao.silva@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cozinheiro Offshore" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="profile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Aluno">Aluno</SelectItem>
                      <SelectItem value="Instrutor">Instrutor</SelectItem>
                      <SelectItem value="Gestor de Empresa">Gestor de Empresa</SelectItem>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button type="submit" form="add-user-form">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ITEMS_PER_PAGE = 10;

export default function UsuariosPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const [loggedInUser, setLoggedInUser] = useState<UserSession | null>(null);
  
  // Filtering and Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [profileFilter, setProfileFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  

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

  // Carregar dados do Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [usersData, companiesData] = await Promise.all([
          getUsers(),
          getEmpresas()
        ]);
        setUsers(usersData);
        setCompanies(companiesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Falha ao carregar dados dos usuários.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const forceUpdate = useCallback(async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    }
  }, []);

  const handleOpenAddDialog = () => {
    setEditingUser(null);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (user: User) => {
    setEditingUser(user);
    setIsAddEditDialogOpen(true);
  };
  
  const handleSaveUser = async (data: z.infer<typeof userSchema>, id?: string) => {
    try {
      if (id) {
        await updateUser(id, {
          ...data,
          status: data.status as 'Ativo' | 'Inativo'
        });
        toast({ title: "Sucesso!", description: "Dados do usuário atualizados." });
      } else {
        await addUser({
          ...data,
          status: data.status as 'Ativo' | 'Inativo'
        });
        toast({ title: "Sucesso!", description: "Novo usuário adicionado." });
      }
      await forceUpdate();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao salvar usuário.',
      });
    }
  };
  
  const handleDeleteConfirm = () => {
    const itemsToDelete = userToDelete ? [userToDelete.id] : selectedUsers;
    if (itemsToDelete.length === 0) return;

    itemsToDelete.forEach(id => deleteUser(id));
    toast({
      variant: "destructive",
      title: "Excluído(s)!",
      description: `${itemsToDelete.length} usuário(s) foram removidos da plataforma.`
    });

    setUserToDelete(null);
    setShowDeleteConfirm(false);
    forceUpdate();
  };

  const handleChangeStatus = (status: 'Ativo' | 'Inativo') => {
    if(selectedUsers.length === 0) return;
    selectedUsers.forEach(id => updateUser(id, { status }));
    toast({
        title: "Sucesso!",
        description: `${selectedUsers.length} usuário(s) tiveram seu status alterado para ${status}.`
    });
    forceUpdate();
  }

  const handleLogout = async () => {
            await signOut(auth);
    localStorage.removeItem('userSession');
    router.push('/');
  };

  const filteredUsers = useMemo(() => users
    .map(u => ({
      ...u,
      companyName: companies.find((c: any) => c.id === u.companyId)?.name ?? 'N/A'
    }))
    .filter(u => 
      (companyFilter === 'all' || u.companyId === companyFilter) &&
      (profileFilter === 'all' || u.profile === profileFilter) &&
      (statusFilter === 'all' || u.status === statusFilter) &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    ), [users, companyFilter, profileFilter, statusFilter, searchQuery]);
  
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  useEffect(() => {
      setCurrentPage(1);
  }, [searchQuery, companyFilter, profileFilter, statusFilter]);

  const handleSelectAll = (checked: boolean | string) => {
    if(checked) {
        setSelectedUsers(paginatedUsers.map(u => u.id));
    } else {
        setSelectedUsers([]);
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
        setSelectedUsers(prev => [...prev, id]);
    } else {
        setSelectedUsers(prev => prev.filter(rowId => rowId !== id));
    }
  }
  
  const handleExportXLSX = () => {
    const dataToExport = filteredUsers.map(user => ({
        'Nome': user.name,
        'Email': user.email,
        'Função': user.role,
        'Perfil': user.profile,
        'Empresa': user.companyName,
        'Status': user.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    XLSX.writeFile(workbook, "usuarios.xlsx");
  };

  const isCurrentPageAllSelected = useMemo(() => {
    if (paginatedUsers.length === 0) return false;
    return paginatedUsers.every(u => selectedUsers.includes(u.id));
  }, [paginatedUsers, selectedUsers]);

  if (!loggedInUser || loggedInUser.profile !== 'Administrador') {
    return null; // Or a loading spinner
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
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/40x40.png" alt={loggedInUser.name} data-ai-hint="person face" />
              <AvatarFallback>{loggedInUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-sidebar-foreground truncate">{loggedInUser.name}</span>
              <span className="text-xs text-sidebar-foreground/70 truncate">{loggedInUser.email}</span>
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
            <h1 className="text-2xl font-headline font-bold">Usuários</h1>
          </div>
           <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt={loggedInUser.name} data-ai-hint="person face" />
            <AvatarFallback>{loggedInUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Membros da Plataforma</CardTitle>
                    <CardDescription>Gerencie os usuários cadastrados na plataforma.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExportXLSX}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar XLSX
                    </Button>
                    {selectedUsers.length > 0 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">Ações ({selectedUsers.length})</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações em Massa</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleChangeStatus('Ativo')}><ShieldCheckIcon className="mr-2"/>Ativar Selecionados</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleChangeStatus('Inativo')}><ShieldAlert className="mr-2"/>Inativar Selecionados</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onSelect={() => setShowDeleteConfirm(true)}><Trash2 className="mr-2"/>Excluir Selecionados</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button onClick={handleOpenAddDialog}>
                            <PlusCircle className="mr-2" />
                            Adicionar Usuário
                        </Button>
                    )}
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-4 gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-2xl">
                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar por nome ou email..." 
                      className="pl-8" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={companyFilter} onValueChange={setCompanyFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filtrar por empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Empresas</SelectItem>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                   <Select value={profileFilter} onValueChange={setProfileFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filtrar por perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Perfis</SelectItem>
                      <SelectItem value="Aluno">Aluno</SelectItem>
                      <SelectItem value="Instrutor">Instrutor</SelectItem>
                      <SelectItem value="Gestor de Empresa">Gestor de Empresa</SelectItem>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                   <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"><Checkbox checked={isCurrentPageAllSelected} onCheckedChange={handleSelectAll} /></TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow key={user.id} data-state={selectedUsers.includes(user.id) && "selected"}>
                      <TableCell><Checkbox checked={selectedUsers.includes(user.id)} onCheckedChange={(checked) => handleSelectRow(user.id, !!checked)} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.profile}</TableCell>
                      <TableCell>{user.companyName}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'Ativo' ? 'default' : 'destructive'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                             <DropdownMenuItem onSelect={() => handleOpenEditDialog(user)}>
                              Editar
                             </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onSelect={() => { setUserToDelete(user); setShowDeleteConfirm(true) }}>Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {paginatedUsers.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">Nenhum usuário encontrado com os filtros aplicados.</div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                    {selectedUsers.length} de {filteredUsers.length} linha(s) selecionada(s).
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4 mr-1"/>
                        Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        Próxima
                        <ChevronRight className="h-4 w-4 ml-1"/>
                    </Button>
                </div>
            </CardFooter>
          </Card>
        </main>
        
        <AddEditUserDialog
            isOpen={isAddEditDialogOpen}
            setIsOpen={setIsAddEditDialogOpen}
            user={editingUser}
            onSave={handleSaveUser}
            companies={companies}
        >
          <div></div>
        </AddEditUserDialog>


        <AlertDialog open={showDeleteConfirm} onOpenChange={(open) => { if (!open) { setShowDeleteConfirm(false); setUserToDelete(null); }}}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente os dados do(s) usuário(s) selecionado(s).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Sim, excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
      </SidebarInset>
    </SidebarProvider>
  );
}
