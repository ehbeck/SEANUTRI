
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Users,
  PlusCircle,
  Building,
  UserCheck,
  LogOut,
  CalendarDays,
  CalendarIcon,
  Settings,
  History,
  Database,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Upload,
} from "lucide-react";
import { GraduationCap } from "@/components/icons";
import { SidebarLogo } from "@/components/app-logo";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import type { UserSession } from "../page";
import { ThemeToggle } from "@/components/theme-toggle";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase.config';
import { getCursos, addCurso, updateCurso, deleteCurso, type Curso } from '@/lib/cursos-firebase';
import { getEmpresas } from '@/lib/empresas-firebase';
import { getUsers } from '@/lib/users-firebase';
import { SidebarMenuComponent } from "@/components/sidebar-menu";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

const cursoSchema = z.object({
  titulo: z.string().min(1, "O título é obrigatório."),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  duracao: z.number().min(1, "A duração deve ser pelo menos 1 hora."),
  preco: z.number().min(0, "O preço não pode ser negativo."),
  instrutorId: z.string().min(1, "O instrutor é obrigatório."),
  empresaId: z.string().optional(),
  categoria: z.string().min(1, "A categoria é obrigatória."),
  nivel: z.enum(["Iniciante", "Intermediário", "Avançado"]),
  status: z.enum(["Ativo", "Inativo", "Em Desenvolvimento"]),
  conteudo: z.string().optional(),
  certificado: z.boolean().default(false),
  vagas: z.number().min(0, "As vagas não podem ser negativas.").optional(),
  imagem: z.string().optional(),
});

const AddEditCursoDialog = ({
  curso,
  onSave,
  children,
  isOpen,
  setIsOpen,
  instrutores,
  empresas,
}: {
  curso?: Curso | null;
  onSave: (data: z.infer<typeof cursoSchema>, id?: string) => void;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  instrutores: any[];
  empresas: any[];
}) => {
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof cursoSchema>>({
    resolver: zodResolver(cursoSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      duracao: 1,
      preco: 0,
      instrutorId: "",
      empresaId: "",
      categoria: "",
      nivel: "Iniciante",
      status: "Ativo",
      conteudo: "",
      certificado: false,
      vagas: 0,
      imagem: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (curso) {
        form.reset({
          titulo: curso.titulo,
          descricao: curso.descricao,
          duracao: curso.duracao,
          preco: curso.preco,
          instrutorId: curso.instrutorId,
          empresaId: curso.empresaId || "none",
          categoria: curso.categoria,
          nivel: curso.nivel,
          status: curso.status,
          conteudo: curso.conteudo || "",
          certificado: curso.certificado || false,
          vagas: curso.vagas || 0,
          imagem: curso.imagem || "",
        });
        setImagemPreview(curso.imagem || null);
      } else {
        form.reset({
          titulo: "",
          descricao: "",
          duracao: 1,
          preco: 0,
          instrutorId: "",
          empresaId: "none",
          categoria: "",
          nivel: "Iniciante",
          status: "Ativo",
          conteudo: "",
          certificado: false,
          vagas: 0,
          imagem: "",
        });
        setImagemPreview(null);
      }
    }
  }, [curso, isOpen, form]);

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemPreview(reader.result as string);
        form.setValue('imagem', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (values: z.infer<typeof cursoSchema>) => {
    onSave(values, curso?.id);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{curso ? "Editar Curso" : "Adicionar Novo Curso"}</DialogTitle>
          <DialogDescription>
            {curso ? "Faça alterações nos dados do curso." : "Preencha os dados do novo curso."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="curso-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Curso</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Segurança Offshore" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Segurança" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o conteúdo e objetivos do curso..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="duracao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (horas)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="8" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vagas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vagas</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="20" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="instrutorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrutor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o instrutor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {instrutores.map(instrutor => (
                          <SelectItem key={instrutor.id} value={instrutor.id}>
                            {instrutor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="empresaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma empresa</SelectItem>
                        {empresas.map(empresa => (
                          <SelectItem key={empresa.id} value={empresa.id}>
                            {empresa.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nivel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Iniciante">Iniciante</SelectItem>
                        <SelectItem value="Intermediário">Intermediário</SelectItem>
                        <SelectItem value="Avançado">Avançado</SelectItem>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                        <SelectItem value="Em Desenvolvimento">Em Desenvolvimento</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="conteudo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo Programático</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o conteúdo programático do curso..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imagem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem do Curso</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      {imagemPreview && (
                        <div className="relative w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                          <Image 
                            src={imagemPreview} 
                            alt="Preview" 
                            fill 
                            className="object-cover rounded-md" 
                          />
                        </div>
                      )}
                      <Input
                        id="imagem-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImagemChange}
                      />
                      <Button type="button" variant="outline" size="sm" asChild>
                        <label htmlFor="imagem-upload" className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          {curso ? 'Alterar Imagem' : 'Enviar Imagem'}
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
              name="certificado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Emitir certificado</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="curso-form">
            {curso ? "Atualizar" : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function CursosPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserSession | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [instrutores, setInstrutores] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [nivelFilter, setNivelFilter] = useState("all");
  
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [cursoToDelete, setCursoToDelete] = useState<Curso | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const sessionData = localStorage.getItem('userSession');
    if (sessionData) {
      const parsedSession = JSON.parse(sessionData);
      setUser(parsedSession);
      if (parsedSession.profile !== 'Administrador' && parsedSession.profile !== 'Instrutor') {
        router.push('/dashboard');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cursosData, instrutoresData, empresasData] = await Promise.all([
        getCursos(),
        getUsers(),
        getEmpresas()
      ]);

      // Filtrar apenas instrutores
      const instrutoresFiltrados = instrutoresData.filter(u => u.profile === 'Instrutor');
      
      setCursos(cursosData);
      setInstrutores(instrutoresFiltrados);
      setEmpresas(empresasData);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: error.message || 'Falha ao carregar cursos'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('userSession');
    router.push('/');
  };

  const handleOpenAddDialog = () => {
    setEditingCurso(null);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (curso: Curso) => {
    setEditingCurso(curso);
    setIsAddEditDialogOpen(true);
  };

  const handleSaveCurso = async (data: z.infer<typeof cursoSchema>, id?: string) => {
    try {
      // Converter "none" para undefined para empresaId
      const cursoData = {
        ...data,
        empresaId: data.empresaId === "none" ? undefined : data.empresaId
      };

      if (id) {
        await updateCurso(id, cursoData);
        toast({ title: 'Sucesso!', description: 'Curso atualizado com sucesso.' });
      } else {
        // Para novos cursos, precisamos adicionar o nome do instrutor
        const instrutor = instrutores.find(i => i.id === data.instrutorId);
        const cursoCompleto = {
          ...cursoData,
          instrutorNome: instrutor?.name || 'Instrutor não encontrado'
        } as Curso;
        await addCurso(cursoCompleto);
        toast({ title: 'Sucesso!', description: 'Novo curso adicionado com sucesso.' });
      }
      loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar curso',
        description: error.message || 'Falha ao salvar curso'
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!cursoToDelete) return;
    
    try {
      await deleteCurso(cursoToDelete.id);
      toast({ title: 'Sucesso!', description: 'Curso deletado com sucesso.' });
      loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao deletar curso',
        description: error.message || 'Falha ao deletar curso'
      });
    } finally {
      setShowDeleteConfirm(false);
      setCursoToDelete(null);
    }
  };

  const filteredCursos = cursos.filter(curso => {
    const matchesSearch = curso.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         curso.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         curso.categoria.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || curso.status === statusFilter;
    const matchesNivel = nivelFilter === "all" || curso.nivel === nivelFilter;
    
    return matchesSearch && matchesStatus && matchesNivel;
  });

  if (!user) {
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
            <h1 className="text-2xl font-headline font-bold">Cursos</h1>
          </div>
          <div className="flex items-center gap-4">
            <AddEditCursoDialog
              curso={null}
              onSave={handleSaveCurso}
              isOpen={isAddEditDialogOpen}
              setIsOpen={setIsAddEditDialogOpen}
              instrutores={instrutores}
              empresas={empresas}
            >
              <Button onClick={() => setEditingCurso(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Curso
              </Button>
            </AddEditCursoDialog>
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person face" />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {/* Filtros e Busca */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar cursos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Em Desenvolvimento">Em Desenvolvimento</SelectItem>
                </SelectContent>
              </Select>
              <Select value={nivelFilter} onValueChange={setNivelFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Níveis</SelectItem>
                  <SelectItem value="Iniciante">Iniciante</SelectItem>
                  <SelectItem value="Intermediário">Intermediário</SelectItem>
                  <SelectItem value="Avançado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de Cursos */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando cursos...</p>
              </div>
            </div>
          ) : filteredCursos.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || nivelFilter !== "all" 
                  ? "Tente ajustar os filtros de busca." 
                  : "Comece adicionando seu primeiro curso."}
              </p>
              {!searchQuery && statusFilter === "all" && nivelFilter === "all" && (
                <AddEditCursoDialog
                  curso={null}
                  onSave={handleSaveCurso}
                  isOpen={isAddEditDialogOpen}
                  setIsOpen={setIsAddEditDialogOpen}
                  instrutores={instrutores}
                  empresas={empresas}
                >
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Curso
                  </Button>
                </AddEditCursoDialog>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCursos.map((curso) => (
                <Card key={curso.id} className="flex flex-col">
                  <CardHeader className="p-0">
                    <div className="relative">
                      <Image 
                        src={curso.imagem || "https://placehold.co/600x400/2563eb/ffffff?text=Curso"} 
                        alt={curso.titulo} 
                        width={600} 
                        height={400} 
                        className="object-cover rounded-t-lg aspect-[16/9]"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge variant={curso.status === 'Ativo' ? 'default' : 'secondary'}>
                          {curso.status}
                        </Badge>
                        <Badge variant="outline">
                          {curso.nivel}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-6">
                    <CardTitle className="font-headline text-xl mb-2">{curso.titulo}</CardTitle>
                    <CardDescription className="mb-4">{curso.descricao}</CardDescription>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Duração:</span>
                        <span>{curso.duracao}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Preço:</span>
                        <span>R$ {curso.preco.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Instrutor:</span>
                        <span>{curso.instrutorNome}</span>
                      </div>
                      {curso.vagas && (
                        <div className="flex justify-between">
                          <span>Vagas:</span>
                          <span>{curso.vagasDisponiveis || curso.vagas}/{curso.vagas}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/cursos/${curso.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(curso)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setCursoToDelete(curso);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </SidebarInset>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o curso "{cursoToDelete?.titulo}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
