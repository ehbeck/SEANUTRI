
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import * as XLSX from 'xlsx';
import { SidebarMenuComponent } from "@/components/sidebar-menu";
import { 
  getEmpresas, addEmpresa, updateEmpresa, deleteEmpresa, type Empresa,
} from '@/lib/empresas-firebase';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase.config';


const companySchema = z.object({
  name: z.string().min(1, "O nome da empresa é obrigatório."),
  contact: z.string().min(1, "O contato é obrigatório."),
  status: z.enum(["Ativa", "Inativa"]),
});


const AddEditCompanyDialog = ({
  company,
  onSave,
  children,
  isOpen,
  setIsOpen,
}: {
  company?: Empresa | null;
  onSave: (data: z.infer<typeof companySchema>, id?: string) => void;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
  });

  useEffect(() => {
    if (isOpen && company) {
      form.reset(company);
    } else if(isOpen) {
      form.reset({ name: "", contact: "", status: "Ativa" });
    }
  }, [company, isOpen, form]);

  const handleSubmit = (values: z.infer<typeof companySchema>) => {
    onSave(values, company?.id);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{company ? "Editar Empresa" : "Adicionar Nova Empresa"}</DialogTitle>
          <DialogDescription>
            {company ? "Faça alterações nos dados da empresa." : "Preencha os dados da nova empresa."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} id="add-company-form" className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Offshore Solutions Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de Contato</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Ex: contato@empresa.com" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ativa">Ativa</SelectItem>
                      <SelectItem value="Inativa">Inativa</SelectItem>
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
          <Button type="submit" form="add-company-form">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ITEMS_PER_PAGE = 10;

export default function EmpresasPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Empresa | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Empresa | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  
  const [user, setUser] = useState<UserSession | null>(null);

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
    // Buscar empresas do Appwrite
    fetchCompanies();
  }, [router]);

  const fetchCompanies = async () => {
    console.log('🔍 Buscando empresas do Firebase...');
    try {
      const empresasData = await getEmpresas();
      setCompanies(empresasData);
      console.log('✅ Empresas encontradas:', empresasData.length);
    } catch (error: any) {
      console.error('❌ Erro ao buscar empresas:', error);
      toast({ variant: 'destructive', title: 'Erro ao buscar empresas', description: error.message || String(error) });
      setCompanies([]);
    }
  };

  const forceUpdate = useCallback(() => {
    fetchCompanies();
    setSelectedCompanies([]);
  }, []);

  const handleOpenAddDialog = () => {
    setEditingCompany(null);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (company: Empresa) => {
    setEditingCompany(company);
    setIsAddEditDialogOpen(true);
  };
  
  const handleSaveCompany = async (data: z.infer<typeof companySchema>, id?: string) => {
    try {
      if (id) {
        await updateEmpresa(id, data);
        toast({ title: 'Sucesso!', description: 'Dados da empresa atualizados.' });
      } else {
        await addEmpresa(data);
        toast({ title: 'Sucesso!', description: 'Nova empresa adicionada.' });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar empresa', description: error.message || String(error) });
    }
    forceUpdate();
  };
  
  const handleDeleteConfirm = async () => {
    const itemsToDelete = companyToDelete ? [companyToDelete.id] : selectedCompanies;
    if (itemsToDelete.length === 0) return;
    let errorCount = 0;
    for (const id of itemsToDelete) {
      try {
        await deleteEmpresa(id);
      } catch (error) {
        errorCount++;
      }
    }
    if (errorCount > 0) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: `${errorCount} empresa(s) não puderam ser excluídas.` });
    } else {
      toast({ variant: 'destructive', title: 'Excluído(s)!', description: `${itemsToDelete.length} empresa(s) removida(s) da plataforma.` });
    }
    setCompanyToDelete(null);
    setShowDeleteConfirm(false);
    forceUpdate();
  };

  const handleLogout = async () => {
            await signOut(auth);
    localStorage.removeItem('userSession');
    router.push('/');
  };

  const filteredCompanies = useMemo(() => companies.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())), [companies, searchQuery]);

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCompanies, currentPage]);
  
  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  
  const handleSelectAll = (checked: boolean | string) => {
      if(checked) {
          setSelectedCompanies(paginatedCompanies.map(c => c.id));
      } else {
          setSelectedCompanies([]);
      }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
      if (checked) {
          setSelectedCompanies(prev => [...prev, id]);
      } else {
          setSelectedCompanies(prev => prev.filter(rowId => rowId !== id));
      }
  }

  const isCurrentPageAllSelected = useMemo(() => {
    if (paginatedCompanies.length === 0) return false;
    return paginatedCompanies.every(c => selectedCompanies.includes(c.id));
  }, [paginatedCompanies, selectedCompanies]);

  if (!user || user.profile !== 'Administrador') {
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
            <h1 className="text-2xl font-headline font-bold">Empresas</h1>
          </div>
           <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person face" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Empresas Parceiras</CardTitle>
              <CardDescription>Gerencie as empresas cadastradas na plataforma.</CardDescription>
              <div className="flex items-center justify-between pt-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar empresa..." 
                    className="pl-8" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {selectedCompanies.length > 0 ? (
                    <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir ({selectedCompanies.length})
                    </Button>
                ) : (
                    <Button onClick={handleOpenAddDialog}>
                        <PlusCircle className="mr-2" />
                        Adicionar Empresa
                    </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"><Checkbox checked={isCurrentPageAllSelected} onCheckedChange={handleSelectAll} /></TableHead>
                    <TableHead>Nome da Empresa</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCompanies.map((company) => (
                    <TableRow key={company.id} data-state={selectedCompanies.includes(company.id) && "selected"}>
                      <TableCell><Checkbox checked={selectedCompanies.includes(company.id)} onCheckedChange={(checked) => handleSelectRow(company.id, !!checked)} /></TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/empresas/${company.id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                          {company.name}
                        </Link>
                      </TableCell>
                      <TableCell>{company.contact}</TableCell>
                      <TableCell>
                        <Badge variant={company.status === 'Ativa' ? 'default' : 'destructive'}>
                          {company.status}
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
                             <DropdownMenuItem onSelect={() => handleOpenEditDialog(company)}>
                              Editar
                             </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => router.push(`/empresas/${company.id}`)}>
                                Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem className="text-destructive" onSelect={() => { setCompanyToDelete(company); setShowDeleteConfirm(true); }}>Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
               {paginatedCompanies.length === 0 && (
                 <div className="text-center p-8 text-muted-foreground">Nenhuma empresa encontrada.</div>
               )}
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                    {selectedCompanies.length} de {filteredCompanies.length} linha(s) selecionada(s).
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
        
        <AddEditCompanyDialog
            company={editingCompany}
            onSave={handleSaveCompany}
            isOpen={isAddEditDialogOpen}
            setIsOpen={setIsAddEditDialogOpen}
        >
          <div></div>
        </AddEditCompanyDialog>


        <AlertDialog open={showDeleteConfirm} onOpenChange={(open) => { if (!open) { setShowDeleteConfirm(false); setCompanyToDelete(null); }}}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente os dados da(s) empresa(s) selecionada(s).
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
