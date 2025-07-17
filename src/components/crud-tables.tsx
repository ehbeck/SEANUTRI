
'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Search, Upload, Download, Users } from "lucide-react";
import { Textarea } from './ui/textarea';

// Importar serviços Firebase reais
import { 
  getUsers, addUser as addUserFirebase, updateUser as updateUserFirebase, deleteUser as deleteUserFirebase, type User
} from "@/lib/users-firebase";
import { 
  getEmpresas, addEmpresa as addCompanyFirebase, updateEmpresa as updateCompanyFirebase, deleteEmpresa as deleteCompanyFirebase, type Empresa
} from "@/lib/empresas-firebase";
import { 
  getInstrutores, addInstrutor as addInstructorFirebase, updateInstrutor as updateInstructorFirebase, deleteInstrutor as deleteInstructorFirebase, type Instructor
} from "@/lib/instrutores-firebase";
import { 
  getCursos, addCurso as addCourseFirebase, updateCurso as updateCourseFirebase, deleteCurso as deleteCourseFirebase, type Curso
} from "@/lib/cursos-firebase";
import { 
  getAgendamentos, addAgendamento as addScheduledClassFirebase, updateAgendamento as updateScheduledClassFirebase, deleteAgendamento as deleteScheduledClassFirebase, type ScheduledClass
} from "@/lib/agendamentos-firebase";

// Aliases para compatibilidade
type Company = Empresa;
type Course = Curso;


// --- Schemas ---
const userSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("O e-mail é inválido.").min(1, "O e-mail é obrigatório."),
  profile: z.enum(["Administrador", "Aluno", "Instrutor", "Gestor de Empresa"]),
  companyId: z.string().min(1, "A empresa é obrigatória."),
  status: z.string().min(1, "O status é obrigatório."),
  avatar: z.any().optional(),
});

const companySchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  contact: z.string().email("O e-mail de contato é inválido.").min(1, "O contato é obrigatório."),
  status: z.string().min(1, "O status é obrigatório."),
});

const instructorSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("O e-mail é inválido.").min(1, "O e-mail é obrigatório."),
  specialization: z.string().min(1, "A especialização é obrigatória."),
});

const courseSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  instructorId: z.string().optional(),
});

// --- Generic Exporter ---
const handleExport = (data: any[], filename: string, headers: string[]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...data].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


// --- User Management ---
const AddEditUserDialog = ({ user, onSave, isOpen, setIsOpen, companies }: { user?: User | null, onSave: (data: z.infer<typeof userSchema>, id?: string) => void, isOpen: boolean, setIsOpen: (open: boolean) => void, companies: Company[] }) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const form = useForm<z.infer<typeof userSchema>>({ resolver: zodResolver(userSchema) });

  React.useEffect(() => {
    if (isOpen) {
        if (user) {
            form.reset({ name: user.name, email: user.email, profile: user.profile, companyId: user.companyId, status: user.status, avatar: user.avatar });
            setAvatarPreview(user.avatar || null);
        } else {
            form.reset({ name: "", email: "", profile: "Aluno", companyId: "", status: "Ativo", avatar: null });
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

  const handleSubmit = (values: z.infer<typeof userSchema>) => { onSave(values, user?.id); setIsOpen(false); };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{user ? "Editar" : "Adicionar"} Usuário</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} id="crud-user-form" className="space-y-4 py-4">
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
                                <Input id="avatar-upload-crud" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                <Button type="button" variant="outline" size="sm" asChild>
                                    <label htmlFor="avatar-upload-crud" className="cursor-pointer">
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
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="profile" render={({ field }) => ( <FormItem><FormLabel>Perfil</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Aluno">Aluno</SelectItem><SelectItem value="Instrutor">Instrutor</SelectItem><SelectItem value="Gestor de Empresa">Gestor de Empresa</SelectItem><SelectItem value="Administrador">Administrador</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="companyId" render={({ field }) => ( <FormItem><FormLabel>Empresa</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{companies.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Inativo">Inativo</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button type="submit" form="crud-user-form">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const UsersTable = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<User | null>(null);
  const [deletingItem, setDeletingItem] = useState<User | null>(null);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
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
        title: "Erro",
        description: "Falha ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => { setEditingItem(null); setIsAddEditDialogOpen(true); };
  const handleOpenEdit = (item: User) => { setEditingItem(item); setIsAddEditDialogOpen(true); };
  
  const handleSave = async (data: z.infer<typeof userSchema>, id?: string) => {
    try {
      if (id) {
        await updateUserFirebase(id, {
          ...data,
          role: data.profile, // Mapear profile para role
          status: data.status as 'Ativo' | 'Inativo'
        });
        toast({ title: "Sucesso!", description: "Usuário atualizado." });
      } else {
        await addUserFirebase({
          ...data,
          role: data.profile, // Mapear profile para role
          status: data.status as 'Ativo' | 'Inativo'
        });
        toast({ title: "Sucesso!", description: "Usuário adicionado." });
      }
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar usuário",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await deleteUserFirebase(deletingItem.id);
      toast({ variant: "destructive", title: "Excluído!", description: `${deletingItem.name} foi removido.` });
      setDeletingItem(null);
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      toast({
        title: "Erro",
        description: "Falha ao deletar usuário",
        variant: "destructive",
      });
    }
  };
  
  const filteredUsers = useMemo(() => users
    .map(u => ({...u, companyName: companies.find(c => c.id === u.companyId)?.name ?? 'N/A'}))
    .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())), 
  [users, companies, searchQuery]);
  
  const exportUsers = () => {
    const dataToExport = filteredUsers.map(u => [u.id, `"${u.name}"`, u.email, u.profile, u.companyName, u.status].join(','));
    handleExport(dataToExport, 'usuarios', ['ID', 'Nome', 'Email', 'Perfil', 'Empresa', 'Status']);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuários</CardTitle>
              <CardDescription>Gerencie todos os usuários da plataforma.</CardDescription>
            </div>
            <Button onClick={handleOpenAdd}><PlusCircle className="mr-2" />Adicionar Usuário</Button>
          </div>
          <div className="relative mt-4 w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou email..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Perfil</TableHead><TableHead>Empresa</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredUsers.map((item) => (
                <TableRow key={item.id}>
                  <TableCell><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarImage src={item.avatar} alt={item.name} data-ai-hint={item.hint} /><AvatarFallback>{item.name.charAt(0)}</AvatarFallback></Avatar><span className="font-medium">{item.name}</span></div></TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.profile}</TableCell>
                  <TableCell>{item.companyName}</TableCell>
                  <TableCell><Badge variant={item.status === 'Ativo' ? 'default' : 'destructive'}>{item.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleOpenEdit(item)}>Editar</DropdownMenuItem><DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onSelect={() => setDeletingItem(item)}>Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-start gap-2">
            <Button variant="outline"><Upload className="mr-2"/>Importar CSV</Button>
            <Button variant="outline" onClick={exportUsers}><Download className="mr-2"/>Exportar CSV</Button>
        </CardFooter>
      </Card>
      <AddEditUserDialog isOpen={isAddEditDialogOpen} setIsOpen={setIsAddEditDialogOpen} user={editingItem} onSave={handleSave} companies={companies} />
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Deseja excluir permanentemente {deletingItem?.name}?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};


// --- Company Management ---
const AddEditCompanyDialog = ({ item, onSave, isOpen, setIsOpen }: { item?: Company | null, onSave: (data: z.infer<typeof companySchema>, id?: string) => void, isOpen: boolean, setIsOpen: (open: boolean) => void }) => {
  const form = useForm<z.infer<typeof companySchema>>({ resolver: zodResolver(companySchema) });
  React.useEffect(() => { if (isOpen) form.reset(item || { name: "", contact: "", status: "Ativa" }); }, [item, isOpen, form]);
  const handleSubmit = (values: z.infer<typeof companySchema>) => { onSave(values, item?.id); setIsOpen(false); };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>{item ? "Editar" : "Adicionar"} Empresa</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} id="crud-form" className="space-y-4 py-4">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="contact" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Ativa">Ativa</SelectItem><SelectItem value="Inativa">Inativa</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
          </form>
        </Form>
        <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button><Button type="submit" form="crud-form">Salvar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const CompaniesTable = () => {
    const { toast } = useToast();
    const [items, setItems] = useState<Company[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState<Company | null>(null);
    const [deletingItem, setDeletingItem] = useState<Company | null>(null);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);

    const forceUpdate = useCallback(() => {
      getEmpresas().then(setItems);
    }, []);
    useEffect(() => {
      forceUpdate();
    }, [forceUpdate]);

    const handleOpenAdd = () => { setEditingItem(null); setIsAddEditDialogOpen(true); };
    const handleOpenEdit = (item: Company) => { setEditingItem(item); setIsAddEditDialogOpen(true); };
    const handleSave = (data: z.infer<typeof companySchema>, id?: string) => {
        if (id) { updateCompanyFirebase(id, data); toast({ title: "Sucesso!", description: "Empresa atualizada." }); } 
        else { addCompanyFirebase(data); toast({ title: "Sucesso!", description: "Empresa adicionada." }); }
        forceUpdate();
    };
    const handleDeleteConfirm = () => {
        if (!deletingItem) return;
        deleteCompanyFirebase(deletingItem.id);
        toast({ variant: "destructive", title: "Excluída!", description: `${deletingItem.name} foi removida.` });
        setDeletingItem(null);
        forceUpdate();
    };
    
    const filteredItems = useMemo(() => items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())), [items, searchQuery]);
    
    const exportItems = () => {
        const dataToExport = filteredItems.map(c => [c.id, `"${c.name}"`, c.contact, c.status].join(','));
        handleExport(dataToExport, 'empresas', ['ID', 'Nome', 'Contato', 'Status']);
    };


    return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Empresas</CardTitle><CardDescription>Gerencie todas as empresas.</CardDescription></div>
            <Button onClick={handleOpenAdd}><PlusCircle className="mr-2" />Adicionar Empresa</Button>
          </div>
          <div className="relative mt-4 w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Contato</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell><TableCell>{item.contact}</TableCell>
                  <TableCell><Badge variant={item.status === 'Ativa' ? 'default' : 'destructive'}>{item.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end"><DropdownMenuLabel>Ações</DropdownMenuLabel><DropdownMenuItem onSelect={() => handleOpenEdit(item)}>Editar</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onSelect={() => setDeletingItem(item)}>Excluir</DropdownMenuItem></DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-start gap-2">
            <Button variant="outline"><Upload className="mr-2"/>Importar CSV</Button>
            <Button variant="outline" onClick={exportItems}><Download className="mr-2"/>Exportar CSV</Button>
        </CardFooter>
      </Card>
      <AddEditCompanyDialog isOpen={isAddEditDialogOpen} setIsOpen={setIsAddEditDialogOpen} item={editingItem} onSave={handleSave} />
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Deseja excluir permanentemente {deletingItem?.name}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
};


// --- Instructor Management ---
const AddEditInstructorDialog = ({ item, onSave, isOpen, setIsOpen }: { item?: Instructor | null, onSave: (data: z.infer<typeof instructorSchema>, id?: string) => void, isOpen: boolean, setIsOpen: (open: boolean) => void }) => {
  const form = useForm<z.infer<typeof instructorSchema>>({ resolver: zodResolver(instructorSchema) });
  React.useEffect(() => { if (isOpen) form.reset(item || { name: "", email: "", specialization: "" }); }, [item, isOpen, form]);
  const handleSubmit = (values: z.infer<typeof instructorSchema>) => { onSave(values, item?.id); setIsOpen(false); };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>{item ? "Editar" : "Adicionar"} Instrutor</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} id="crud-form" className="space-y-4 py-4">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="specialization" render={({ field }) => ( <FormItem><FormLabel>Especialização</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
          </form>
        </Form>
        <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button><Button type="submit" form="crud-form">Salvar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const InstructorsTable = () => {
    const { toast } = useToast();
    const [items, setItems] = useState<Instructor[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState<Instructor | null>(null);
    const [deletingItem, setDeletingItem] = useState<Instructor | null>(null);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);

    const forceUpdate = useCallback(() => {
      getInstrutores().then(setItems);
    }, []);
    useEffect(() => {
      forceUpdate();
    }, [forceUpdate]);

    const handleOpenAdd = () => { setEditingItem(null); setIsAddEditDialogOpen(true); };
    const handleOpenEdit = (item: Instructor) => { setEditingItem(item); setIsAddEditDialogOpen(true); };
    const handleSave = (data: z.infer<typeof instructorSchema>, id?: string) => {
        if (id) { updateInstructorFirebase(id, data); toast({ title: "Sucesso!", description: "Instrutor atualizado." }); } 
        else { addInstructorFirebase(data); toast({ title: "Sucesso!", description: "Instrutor adicionado." }); }
        forceUpdate();
    };
    const handleDeleteConfirm = () => {
        if (!deletingItem) return;
        deleteInstructorFirebase(deletingItem.id);
        toast({ variant: "destructive", title: "Excluído!", description: `${deletingItem.name} foi removido.` });
        setDeletingItem(null);
        forceUpdate();
    };
    
    const filteredItems = useMemo(() => items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.email.toLowerCase().includes(searchQuery.toLowerCase())), [items, searchQuery]);
    
    const exportItems = () => {
        const dataToExport = filteredItems.map(i => [i.id, `"${i.name}"`, i.email, `"${i.specialization}"`].join(','));
        handleExport(dataToExport, 'instrutores', ['ID', 'Nome', 'Email', 'Especialização']);
    };


    return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Instrutores</CardTitle><CardDescription>Gerencie todos os instrutores.</CardDescription></div>
            <Button onClick={handleOpenAdd}><PlusCircle className="mr-2" />Adicionar Instrutor</Button>
          </div>
          <div className="relative mt-4 w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou email..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Especialização</TableHead><TableHead><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarImage src={item.avatar} alt={item.name} data-ai-hint={item.hint} /><AvatarFallback>{item.name.charAt(0)}</AvatarFallback></Avatar><span className="font-medium">{item.name}</span></div></TableCell>
                  <TableCell>{item.email}</TableCell><TableCell>{item.specialization}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end"><DropdownMenuLabel>Ações</DropdownMenuLabel><DropdownMenuItem onSelect={() => handleOpenEdit(item)}>Editar</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onSelect={() => setDeletingItem(item)}>Excluir</DropdownMenuItem></DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter className="border-t pt-6 flex justify-start gap-2">
            <Button variant="outline"><Upload className="mr-2"/>Importar CSV</Button>
            <Button variant="outline" onClick={exportItems}><Download className="mr-2"/>Exportar CSV</Button>
        </CardFooter>
      </Card>
      <AddEditInstructorDialog isOpen={isAddEditDialogOpen} setIsOpen={setIsAddEditDialogOpen} item={editingItem} onSave={handleSave} />
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Deseja excluir permanentemente {deletingItem?.name}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
};


// --- Course Management ---
const AddEditCourseDialog = ({ item, onSave, isOpen, setIsOpen }: { item?: Course | null, onSave: (data: z.infer<typeof courseSchema>, id?: string) => void, isOpen: boolean, setIsOpen: (open: boolean) => void }) => {
  const form = useForm<z.infer<typeof courseSchema>>({ resolver: zodResolver(courseSchema) });
  React.useEffect(() => { if (isOpen) form.reset(item || { title: "", description: "", instructorId: "" }); }, [item, isOpen, form]);
  const handleSubmit = (values: z.infer<typeof courseSchema>) => { onSave(values, item?.id); setIsOpen(false); };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{item ? "Editar" : "Adicionar"} Curso</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} id="crud-form" className="space-y-4 py-4">
            <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Título</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="instructorId" render={({ field }) => ( <FormItem><FormLabel>Instrutor</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione um instrutor"/></SelectTrigger></FormControl><SelectContent>{getInstrutores().then(instrutores => instrutores.map(i => (<SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)))}</SelectContent></Select><FormMessage /></FormItem> )} />
          </form>
        </Form>
        <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button><Button type="submit" form="crud-form">Salvar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const CoursesTable = () => {
    const { toast } = useToast();
    const [items, setItems] = useState<Course[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState<Course | null>(null);
    const [deletingItem, setDeletingItem] = useState<Course | null>(null);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);

    const forceUpdate = useCallback(() => {
      getCursos().then(setItems);
    }, []);
    useEffect(() => {
      forceUpdate();
    }, [forceUpdate]);

    const handleOpenAdd = () => { setEditingItem(null); setIsAddEditDialogOpen(true); };
    const handleOpenEdit = (item: Course) => { setEditingItem(item); setIsAddEditDialogOpen(true); };
    const handleSave = (data: z.infer<typeof courseSchema>, id?: string) => {
        if (id) { updateCourseFirebase(id, data); toast({ title: "Sucesso!", description: "Curso atualizado." }); } 
        else { addCourseFirebase({ ...data, image: "https://placehold.co/600x400.png", hint: "course" }); toast({ title: "Sucesso!", description: "Curso adicionado." }); }
        forceUpdate();
    };
    const handleDeleteConfirm = () => {
        if (!deletingItem) return;
        deleteCourseFirebase(deletingItem.id);
        toast({ variant: "destructive", title: "Excluído!", description: `${deletingItem.title} foi removido.` });
        setDeletingItem(null);
        forceUpdate();
    };
    
    const filteredItems = useMemo(() => items
        .map(c => ({...c, instructorName: getInstrutores().then(instrutores => instrutores.find(i => i.id === c.instructorId)?.name ?? 'N/A') }))
        .filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase())), 
    [items, searchQuery]);
    
    const exportItems = () => {
        const dataToExport = filteredItems.map(c => [c.id, `"${c.title}"`, `"${c.instructorName}"`].join(','));
        handleExport(dataToExport, 'cursos', ['ID', 'Título', 'Instrutor']);
    };

    return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Cursos</CardTitle><CardDescription>Gerencie todos os cursos.</CardDescription></div>
            <Button onClick={handleOpenAdd}><PlusCircle className="mr-2" />Adicionar Curso</Button>
          </div>
          <div className="relative mt-4 w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por título..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Descrição</TableHead><TableHead>Instrutor</TableHead><TableHead><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground max-w-sm truncate">{item.description}</TableCell>
                  <TableCell>{item.instructorName}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end"><DropdownMenuLabel>Ações</DropdownMenuLabel><DropdownMenuItem onSelect={() => handleOpenEdit(item)}>Editar</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onSelect={() => setDeletingItem(item)}>Excluir</DropdownMenuItem></DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-start gap-2">
            <Button variant="outline"><Upload className="mr-2"/>Importar CSV</Button>
            <Button variant="outline" onClick={exportItems}><Download className="mr-2"/>Exportar CSV</Button>
        </CardFooter>
      </Card>
      <AddEditCourseDialog isOpen={isAddEditDialogOpen} setIsOpen={setIsAddEditDialogOpen} item={editingItem} onSave={handleSave} />
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Deseja excluir permanentemente o curso {deletingItem?.title}?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
};


// --- Scheduled Classes Management ---
export const ScheduledClassesTable = () => {
    const { toast } = useToast();
    const [items, setItems] = useState<ScheduledClass[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingItem, setDeletingItem] = useState<ScheduledClass | null>(null);

    const forceUpdate = useCallback(() => {
      getAgendamentos().then(setItems);
    }, []);
    useEffect(() => {
      forceUpdate();
    }, [forceUpdate]);

    const handleDeleteConfirm = () => {
        if (!deletingItem) return;
        deleteScheduledClassFirebase(deletingItem.id);
        toast({ variant: "destructive", title: "Excluída!", description: `A turma agendada foi removida.` });
        setDeletingItem(null);
        forceUpdate();
    };
    
    const filteredItems = useMemo(() => items
        .map(sc => ({
            ...sc,
            courseName: getCursos().then(cursos => cursos.find(c => c.id === sc.courseId)?.title ?? 'N/A'),
            instructorName: getInstrutores().then(instrutores => instrutores.find(i => i.id === sc.instructorId)?.name ?? 'N/A'),
        }))
        .filter(i => i.courseName.toLowerCase().includes(searchQuery.toLowerCase())), 
    [items, searchQuery]);
    
    const exportItems = () => {
        const dataToExport = filteredItems.map(c => [c.id, `"${c.courseName}"`, `"${c.instructorName}"`, format(c.scheduledDate, 'yyyy-MM-dd'), c.startTime, c.endTime, c.studentIds.length].join(','));
        handleExport(dataToExport, 'agendamentos', ['ID', 'Curso', 'Instrutor', 'Data', 'Início', 'Fim', 'Alunos']);
    };


    return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Agendamentos</CardTitle><CardDescription>Gerencie todas as turmas agendadas.</CardDescription></div>
          </div>
          <div className="relative mt-4 w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por curso..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Curso</TableHead><TableHead>Instrutor</TableHead><TableHead>Data</TableHead><TableHead>Alunos</TableHead><TableHead><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.courseName}</TableCell>
                  <TableCell>{item.instructorName}</TableCell>
                  <TableCell>{format(item.scheduledDate, 'dd/MM/yyyy')} {item.startTime}-{item.endTime}</TableCell>
                  <TableCell>{item.studentIds.length}</TableCell>
                  <TableCell className="text-right">
                     <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeletingItem(item)}><MoreHorizontal /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-start gap-2">
            <Button variant="outline"><Upload className="mr-2"/>Importar CSV</Button>
            <Button variant="outline" onClick={exportItems}><Download className="mr-2"/>Exportar CSV</Button>
        </CardFooter>
      </Card>
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Deseja excluir permanentemente este agendamento?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
};
