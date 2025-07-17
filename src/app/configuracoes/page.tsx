'use client';

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Users,
  Building,
  UserCheck,
  LogOut,
  CalendarDays,
  CalendarIcon,
  Settings,
  AlertTriangle,
  Award,
  ShieldCheck,
  Info,
  Palette,
  Bell,
  ExternalLink,
  Table as TableIcon,
  Upload,
  Download,
  Mail,
  Pencil,
  PlusCircle,
  History,
  LogIn,
  Send,
  FileClock,
  Trash2,
  FileDown,
  Database,
  ChevronDown,
} from "lucide-react";
import { GraduationCap } from "@/components/icons";
import { SidebarLogo } from "@/components/app-logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import type { UserSession } from "../page";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  certificateSettings as initialCertificateSettings, 
  updateCertificateSettings, 
  type CertificateSettings,
  type CertificateCustomText,
  type NotificationTemplate,
  notificationSettings as initialNotificationSettings,
  updateNotificationSettings,
  allPermissions,
} from "@/lib/data";
import { 
  getRoles, 
  addRole as addRoleFirebase, 
  updateRole as updateRoleFirebase, 
  deleteRole as deleteRoleFirebase,
  initializeDefaultRoles,
  type Role 
} from "@/lib/roles-firebase";
import { useAppSettings, updateAppSetting } from "@/lib/app-settings";
import { sendEmail } from "@/services/email";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as FormDesc } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import QRCode from "qrcode.react";
import jsPDF from "jspdf";
// Removido: import html2canvas from "html2canvas"; - causa problemas de SSR
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import Image from "next/image";
import type { Permission, PermissionCategory } from "@/lib/definitions";
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase.config';
import { SidebarMenuComponent } from "@/components/sidebar-menu";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { 
  getLoginLogs, 
  getNotificationLogs, 
  type LoginLog, 
  type NotificationLog 
} from "@/lib/firebase-db";


const PreviewCertificateDialog = ({ settings, children }: { settings: CertificateSettings, children: React.ReactNode }) => {
    const verificationUrl = `${settings.qrCode.baseUrl}/CERT-XXXX-YYYY`;
    
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Pré-visualização do Certificado</DialogTitle>
                    <DialogDescription>
                        É assim que seu certificado aparecerá. Salve as alterações para aplicá-las a todos os novos certificados.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-auto p-2">
                    <Tabs defaultValue="page1" className="flex-1 flex flex-col min-h-0">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="page1">Página 1 (Certificado)</TabsTrigger>
                            <TabsTrigger value="page2">Página 2 (Conteúdo)</TabsTrigger>
                        </TabsList>
                        <TabsContent value="page1" className="flex-1 overflow-auto p-2">
                            <div 
                                className="w-full aspect-[297/210] mx-auto border-2 border-dashed p-8 flex flex-col text-gray-800 relative bg-white"
                                style={{ backgroundImage: `url(${settings.page1Background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                            >
                                <main className="text-center flex-1 flex flex-col justify-center relative">
                                    <p className={cn("absolute", settings.header.classes)} style={{ top: `${settings.header.top}%`, left: `${settings.header.left}%`, fontSize: `${settings.header.size}px` }}>{settings.header.text}</p>
                                    <h2 className={cn("absolute", settings.studentName.classes)} style={{ top: `${settings.studentName.top}%`, left: `${settings.studentName.left}%`, fontSize: `${settings.studentName.size}px` }}>Nome do Aluno</h2>
                                    <p className={cn("absolute", settings.body.classes)} style={{ top: `${settings.body.top}%`, left: `${settings.body.left}%`, fontSize: `${settings.body.size}px` }}>{settings.body.text}</p>
                                    <h3 className={cn("absolute", settings.courseName.classes)} style={{ top: `${settings.courseName.top}%`, left: `${settings.courseName.left}%`, fontSize: `${settings.courseName.size}px` }}>Nome do Curso</h3>

                                    {settings.customTexts?.filter(t => t.page === 1).map(text => (
                                        <p key={text.id} className="absolute" style={{ top: `${text.top}%`, left: `${text.left}%`, fontSize: `${text.size}px` }}>{text.text}</p>
                                    ))}
                                </main>
                                <footer className="relative w-full h-28 text-sm">
                                    <div 
                                        className={cn("absolute", settings.instructorName.classes)}
                                        style={{ top: `${settings.instructorName.top}%`, left: `${settings.instructorName.left}%`, fontSize: `${settings.instructorName.size}px`}}
                                    >
                                        Nome do Instrutor
                                        {settings.instructorName.showUnderline && (
                                            <div className="mt-1 border-b-2 border-dotted border-gray-700 w-full"></div>
                                        )}
                                    </div>
                                    <p 
                                        className={cn("absolute", settings.instructorTitle.classes)}
                                        style={{ top: `${settings.instructorTitle.top}%`, left: `${settings.instructorTitle.left}%`, fontSize: `${settings.instructorTitle.size}px`}}
                                    >
                                        {settings.instructorTitle.text}
                                    </p>
                                    <p 
                                        className={cn("absolute", settings.verificationCode.classes)}
                                        style={{ top: `${settings.verificationCode.top}%`, left: `${settings.verificationCode.left}%`, fontSize: `${settings.verificationCode.size}px`}}
                                    >
                                        {settings.verificationCode.text} CERT-XXXX-YYYY
                                    </p>
                                    <div 
                                        className={cn("absolute text-center", settings.issueDate.classes)}
                                        style={{ top: `${settings.issueDate.top}%`, left: `${settings.issueDate.left}%`, fontSize: `${settings.issueDate.size}px`}}
                                    >
                                        {settings.issueDate.text}
                                        <p>{format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                                    </div>
                                    {settings.qrCode.enabled && (
                                        <div className="absolute" style={{ top: `${settings.qrCode.top}%`, left: `${settings.qrCode.left}%` }}>
                                           <QRCode value={verificationUrl} size={settings.qrCode.size} level="L" />
                                        </div>
                                    )}
                                </footer>
                            </div>
                        </TabsContent>
                        <TabsContent value="page2" className="flex-1 overflow-auto p-2">
                             <div 
                                 className="w-full aspect-[297/210] mx-auto border-2 border-dashed p-8 flex flex-col text-gray-800 relative bg-white"
                                 style={{ backgroundImage: `url(${settings.page2Background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                             >
                                <header className="pb-4">
                                    <h1 className={cn("absolute", settings.syllabusTitle.classes)} style={{ top: `${settings.syllabusTitle.top}%`, left: `${settings.syllabusTitle.left}%`, fontSize: `${settings.syllabusTitle.size}px` }}>{settings.syllabusTitle.text}</h1>
                                </header>
                                <main className="py-8 flex-1">
                                    <ul className="space-y-4 text-gray-700">
                                        <li>Item 1 do conteúdo programático de exemplo</li>
                                        <li>Item 2 do conteúdo programático de exemplo</li>
                                        <li>Item 3 do conteúdo programático de exemplo</li>
                                        <li>Item 4 do conteúdo programático de exemplo</li>
                                        <li>Item 5 do conteúdo programático de exemplo</li>
                                    </ul>
                                     {settings.customTexts?.filter(t => t.page === 2).map(text => (
                                        <p key={text.id} className="absolute" style={{ top: `${text.top}%`, left: `${text.left}%`, fontSize: `${text.size}px` }}>{text.text}</p>
                                    ))}
                                </main>
                                <footer className="pt-8 text-sm text-center text-gray-500">
                                    <p>Certificado emitido para <span className="font-semibold text-gray-700">Nome do Aluno</span> em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.</p>
                                    <p className="font-bold mt-2">Seanutri</p>
                                </footer>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const roleSchema = z.object({
  name: z.string().min(3, "O nome do perfil é obrigatório."),
  description: z.string().min(10, "A descrição é obrigatória."),
});

type RoleFormValues = z.infer<typeof roleSchema>;

const AddEditRoleDialog = ({ role, onSave, children }: { role?: Role; onSave: (data: RoleFormValues, name?: string) => void; children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: { name: "", description: "" }
    });

    useEffect(() => {
        if (isOpen) {
            if (role) {
                form.reset({ name: role.name, description: role.description });
            } else {
                form.reset({ name: "", description: "" });
            }
        }
    }, [isOpen, role, form]);

    const handleFormSubmit: SubmitHandler<RoleFormValues> = (data) => {
        onSave(data, role?.name);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{role ? 'Editar Perfil de Acesso' : 'Adicionar Novo Perfil'}</DialogTitle>
                    <DialogDescription>
                        {role ? 'Edite o nome e a descrição deste perfil.' : 'Crie um novo perfil e defina suas permissões.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} id="role-form" className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Perfil</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ex: Supervisor" disabled={!!role} />
                                    </FormControl>
                                    {role && <FormDesc>O nome do perfil não pode ser alterado após a criação.</FormDesc>}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Descreva as responsabilidades deste perfil." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button type="submit" form="role-form">Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const TestEmailDialog = () => {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");

    async function sendTestEmailAction() {
        if (!email) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Por favor, insira um endereço de e-mail.',
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await sendEmail({
                to: email,
                subject: "Email de Teste - Plataforma Seanutri",
                text: "Este é um e-mail de teste para verificar a configuração de envio da plataforma.",
                html: "<p>Este é um e-mail de teste para verificar a configuração de envio da plataforma.</p>"
            });

            if (result.success) {
                toast({
                    title: 'Sucesso!',
                    description: `E-mail de teste enviado para ${email}.`,
                });
                setIsOpen(false);
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Falha no Envio',
                description: error.message || 'Ocorreu um erro ao enviar o e-mail.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Testar Envio de Email
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Testar Envio de Email</DialogTitle>
                    <DialogDescription>
                        Insira um endereço de e-mail para enviar uma mensagem de teste e verificar a configuração.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="test-email">Email de Destino</Label>
                    <Input 
                        id="test-email" 
                        type="email" 
                        placeholder="seu-email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancelar</Button>
                    <Button onClick={sendTestEmailAction} disabled={isLoading}>
                        {isLoading ? "Enviando..." : "Enviar Teste"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const PermissionsTable = ({ role, handlePermissionChange }: { role: Role, handlePermissionChange: (roleName: string, permissionId: string, checked: boolean) => void }) => {

    const renderPermissionRow = (permission: Permission, isSubItem = false) => (
        <TableRow key={permission.id}>
            <TableCell className={cn("font-medium", isSubItem && "pl-8")}>{permission.label}</TableCell>
            <TableCell className="text-center">
                <Checkbox 
                    checked={role.permissions.includes(permission.id)} 
                    onCheckedChange={(checked) => handlePermissionChange(role.name, permission.id, !!checked)}
                    disabled={role.name === 'Administrador'}
                />
            </TableCell>
        </TableRow>
    );

     const renderCrudPermissionRow = (category: PermissionCategory) => (
        <React.Fragment key={`${category.id}-group`}>
            <TableRow key={`${category.id}-header`}>
                <TableCell colSpan={2} className="font-semibold bg-muted/50">{category.label}</TableCell>
            </TableRow>
            {category.permissions?.map(p => renderPermissionRow(p, true))}
        </React.Fragment>
    );

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Funcionalidade</TableHead>
                    <TableHead className="text-center w-32">Permitido</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {allPermissions.map(category => {
                    if(category.isSubcategory && category.subcategories) {
                        return (
                            <React.Fragment key={category.id}>
                                <TableRow>
                                    <TableCell colSpan={2} className="font-bold text-lg p-4">{category.label}</TableCell>
                                </TableRow>
                                {category.subcategories.map(renderCrudPermissionRow)}
                            </React.Fragment>
                        );
                    }
                    return (
                        <React.Fragment key={category.id}>
                            <TableRow><TableCell colSpan={2} className="font-bold text-lg p-4">{category.label}</TableCell></TableRow>
                            {category.note && (
                                <TableRow><TableCell colSpan={2} className="text-xs text-muted-foreground pt-0 pb-2 px-4">{category.note}</TableCell></TableRow>
                            )}
                            {category.permissions?.map(p => renderPermissionRow(p))}
                        </React.Fragment>
                    )
                })}
            </TableBody>
        </Table>
    );
};


export default function ConfiguracoesPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  
  const [user, setUser] = useState<UserSession | null>(null);
  
  // General settings
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [allowNewSignups, setAllowNewSignups] = useState(true);
  const [enableApiAccess, setEnableApiAccess] = useState(false);
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState(initialNotificationSettings);
  
  // Branding settings
  const { settings, updateSetting } = useAppSettings();
  
  // Certificate settings
  const [certificateSettings, setCertificateSettings] = useState(JSON.parse(JSON.stringify(initialCertificateSettings)));

  // Access roles settings
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // Logs settings
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const certificatePreviewRef = useRef<HTMLDivElement>(null);

  const loadRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const rolesData = await getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Erro ao carregar roles:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar perfis de acesso",
        variant: "destructive",
      });
    } finally {
      setRolesLoading(false);
    }
  }, [toast]);

  const forceUpdateRoles = useCallback(() => {
    loadRoles();
  }, [loadRoles]);

  const loadLogs = useCallback(async () => {
    try {
      setLogsLoading(true);
      const [loginData, notificationData] = await Promise.all([
        getLoginLogs(),
        getNotificationLogs()
      ]);
      setLoginLogs(loginData);
      setNotificationLogs(notificationData);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar logs",
        variant: "destructive",
      });
    } finally {
      setLogsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    const maintenanceCookie = document.cookie.split('; ').find(row => row.startsWith('maintenance_mode='));
    setIsMaintenanceMode(maintenanceCookie?.split('=')[1] === 'true');
  }, []);

  // Carregar roles do Firebase
  useEffect(() => {
    if (user) {
      loadRoles();
      loadLogs();
    }
  }, [user, loadRoles, loadLogs]);

  const handleMaintenanceModeChange = (checked: boolean) => {
    setIsMaintenanceMode(checked);
    document.cookie = `maintenance_mode=${checked}; path=/; max-age=31536000`; // Cookie for 1 year
    toast({
        title: "Modo de Manutenção",
        description: `O modo de manutenção foi ${checked ? 'ativado' : 'desativado'}.`
    });
  }

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

  const handleLogout = async () => {
            await signOut(auth);
    localStorage.removeItem('userSession');
    router.push('/');
  };

  const handleSaveChanges = () => {
    updateCertificateSettings(certificateSettings);
    updateNotificationSettings(notificationSettings);

    toast({
      title: "✅ Configurações Salvas!",
      description: "O nome da aplicação e logo foram atualizados com sucesso. As mudanças já estão visíveis em toda a aplicação.",
    });
  };

  const handleTestPdfExport = async () => {
        const printContainer = certificatePreviewRef.current;
        if (!printContainer) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Não foi possível encontrar o conteúdo da pré-visualização para exportar.",
            });
            return;
        }

        try {
            // Usar o wrapper seguro para html2canvas
            const { safeHtml2Canvas } = await import('@/lib/html2canvas-dynamic');
            
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            
            const page1Element = printContainer.querySelector('#cert-preview-page-1') as HTMLElement;
            const page2Element = printContainer.querySelector('#cert-preview-page-2') as HTMLElement;

            // Process Page 1
            const canvas1 = await safeHtml2Canvas(page1Element, { scale: 2 });
            const imgData1 = canvas1.toDataURL('image/png');
            const pdfHeight1 = (canvas1.height * pdfWidth) / canvas1.width;
            pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidth, pdfHeight1);

            // Process Page 2
            pdf.addPage();
            const canvas2 = await safeHtml2Canvas(page2Element, { scale: 2 });
            const imgData2 = canvas2.toDataURL('image/png');
            const pdfHeight2 = (canvas2.height * pdfWidth) / canvas2.width;
            pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, pdfHeight2);
            
            pdf.save("certificado_teste.pdf");
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            // Fallback: gerar PDF simples sem html2canvas
            const pdf = new jsPDF('l', 'mm', 'a4');
            pdf.setFontSize(16);
            pdf.text('Certificado de Teste', 20, 20);
            pdf.setFontSize(12);
            pdf.text('Página 1 - Certificado', 20, 40);
            pdf.addPage();
            pdf.text('Página 2 - Conteúdo', 20, 20);
            pdf.save("certificado_teste_simples.pdf");
            
            toast({
                variant: "destructive",
                title: "Erro ao exportar PDF",
                description: "Ocorreu um erro ao tentar gerar o PDF de teste. PDF simples gerado como alternativa.",
            });
        }
  };
  
    const handleLogoImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'app' | 'login' | 'favicon') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const settingKey = type === 'login' ? 'loginLogoUrl' : type === 'favicon' ? 'faviconUrl' : 'appLogoUrl';
                updateSetting(settingKey, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>, page: 'page1Background' | 'page2Background') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleCertificateFieldChange(page, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateFieldChange = (field: keyof CertificateSettings, value: any) => {
    setCertificateSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCertificateChange = (keys: (keyof CertificateSettings)[], value: any) => {
    setCertificateSettings(prev => {
      const newState = { ...prev };
      let currentLevel: any = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        currentLevel = currentLevel[keys[i]];
      }
      currentLevel[keys[keys.length - 1]] = value;
      return newState;
    });
  };
  
  const handleCustomTextChange = (id: string, field: keyof CertificateCustomText, value: string | number) => {
    setCertificateSettings(prev => ({
      ...prev,
      customTexts: prev.customTexts?.map(t =>
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  const handleAddCustomText = (page: 1 | 2) => {
    const newText: CertificateCustomText = {
      id: `custom-${Date.now()}`,
      text: 'Novo Texto',
      page,
      top: 50,
      left: 50,
      size: 16
    };
    setCertificateSettings(prev => ({
      ...prev,
      customTexts: [...(prev.customTexts || []), newText]
    }));
  };

  const handleRemoveCustomText = (id: string) => {
    setCertificateSettings(prev => ({
      ...prev,
      customTexts: prev.customTexts?.filter(t => t.id !== id)
    }));
  };

  const handleNotificationTemplateChange = (id: string, field: 'enabled' | 'subject' | 'content', value: string | boolean) => {
    setNotificationSettings(prev => ({
        ...prev,
        templates: prev.templates.map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };

  const handlePermissionChange = (roleName: string, permissionId: string, checked: boolean) => {
    setRoles(prevRoles => {
        return prevRoles.map(role => {
            if (role.name === roleName) {
                const newPermissions = checked
                    ? [...role.permissions, permissionId]
                    : role.permissions.filter(p => p !== permissionId);
                return { ...role, permissions: newPermissions };
            }
            return role;
        });
    });
  };

  const handleSaveRole = async (data: RoleFormValues, name?: string) => {
        try {
            if (name) { // Editing existing role
                const existingRole = roles.find(r => r.name === name);
                if (existingRole) {
                    await updateRoleFirebase(existingRole.id, { description: data.description });
                    toast({ title: "Sucesso!", description: `Perfil "${name}" atualizado.` });
                }
            } else { // Adding new role
                await addRoleFirebase({ 
                    name: data.name, 
                    description: data.description, 
                    permissions: [] 
                });
                toast({ title: "Sucesso!", description: `Novo perfil "${data.name}" adicionado.` });
            }
            forceUpdateRoles();
        } catch (error) {
            console.error('Erro ao salvar role:', error);
            toast({ 
                title: "Erro", 
                description: "Falha ao salvar perfil de acesso",
                variant: "destructive"
            });
        }
    };

  if (!user || user.profile !== 'Administrador') {
    return null; // Or a loading spinner while redirecting
  }

  const verificationUrl = `${certificateSettings.qrCode.baseUrl}/CERT-XXXX-YYYY`;

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
            <h1 className="text-2xl font-headline font-bold">Configurações</h1>
          </div>
           <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt={user.name} data-ai-hint="person face" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-6">
            <Tabs defaultValue="geral" className="h-full">
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="geral">Geral</TabsTrigger>
                    <TabsTrigger value="personalizacao">Personalização</TabsTrigger>
                    <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
                    <TabsTrigger value="tabelas">Tabelas</TabsTrigger>
                    <TabsTrigger value="acesso">Acesso</TabsTrigger>
                    <TabsTrigger value="certificado">Certificado</TabsTrigger>
                    <TabsTrigger value="log">Log</TabsTrigger>
                </TabsList>
                <ScrollArea className="h-[calc(100vh-220px)] mt-2">
                <div className="pr-4 py-2">

                <TabsContent value="geral">
                     <Card>
                        <CardHeader>
                        <CardTitle>Configurações Gerais</CardTitle>
                        <CardDescription>Gerencie as configurações globais da plataforma.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2"><Settings className="size-5" />Status da Plataforma</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label htmlFor="maintenance-mode" className="font-semibold">Modo de Manutenção</Label>
                                            <p className="text-sm text-muted-foreground">Desativa o acesso à plataforma para todos os usuários, exceto administradores.</p>
                                        </div>
                                        <Switch id="maintenance-mode" checked={isMaintenanceMode} onCheckedChange={handleMaintenanceModeChange} />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label htmlFor="new-signups" className="font-semibold">Permitir Novos Cadastros</Label>
                                            <p className="text-sm text-muted-foreground">Controle se novos usuários e empresas podem ser cadastrados.</p>
                                        </div>
                                        <Switch id="new-signups" checked={allowNewSignups} onCheckedChange={setAllowNewSignups} />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label htmlFor="api-access" className="font-semibold">Habilitar Acesso via API</Label>
                                            <p className="text-sm text-muted-foreground">Permite a integração com sistemas externos através de uma API.</p>
                                        </div>
                                        <Switch id="api-access" checked={enableApiAccess} onCheckedChange={setEnableApiAccess} />
                                    </div>
                                </CardContent>
                            </Card>
                            {isMaintenanceMode && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Atenção!</AlertTitle>
                                    <AlertDescription>O modo de manutenção está ativo. Apenas administradores podem acessar a plataforma.</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="personalizacao">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personalização</CardTitle>
                            <CardDescription>Customize a aparência e a identidade visual da plataforma.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-2">
                                <Label htmlFor="appName">Nome da Aplicação</Label>
                                <Input 
                                    id="appName" 
                                    value={settings.appName} 
                                    onChange={(e) => updateSetting('appName', e.target.value)} 
                                    placeholder="Ex: Minha Empresa Academy" 
                                />
                                <p className="text-xs text-muted-foreground">O nome que aparece no topo da barra lateral e no título da página.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="appLogoUrl">Logo da Aplicação</Label>
                                {settings.appLogoUrl && (
                                    <div className="relative w-40 h-20 bg-muted rounded-md flex items-center justify-center">
                                        <Image 
                                            src={settings.appLogoUrl} 
                                            alt="Pré-visualização do logo" 
                                            fill 
                                            className="object-contain rounded-md" 
                                        />
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Input 
                                        id="appLogoUrl" 
                                        value={settings.appLogoUrl} 
                                        onChange={(e) => updateSetting('appLogoUrl', e.target.value)} 
                                        placeholder="URL ou envie um arquivo"
                                    />
                                    <Input 
                                        type="file" 
                                        id="logo-upload" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleLogoImageUpload(e, 'app')}
                                    />
                                    <Button asChild variant="outline">
                                        <label htmlFor="logo-upload" className="cursor-pointer">
                                            <Upload className="h-4 w-4" />
                                        </label>
                                    </Button>
                                </div>
                                {settings.appLogoUrl && (
                                    <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="p-0 h-auto" 
                                        onClick={() => updateSetting('appLogoUrl', '')}
                                    >
                                        Remover logo
                                    </Button>
                                )}
                                <p className="text-xs text-muted-foreground">Use uma URL ou envie um arquivo. O logo aparecerá na barra lateral.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="loginLogoUrl">Logo da Página de Login</Label>
                                {settings.loginLogoUrl && (
                                    <div className="relative w-40 h-20 bg-muted rounded-md flex items-center justify-center">
                                        <Image 
                                            src={settings.loginLogoUrl} 
                                            alt="Pré-visualização do logo de login" 
                                            fill 
                                            className="object-contain rounded-md" 
                                        />
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Input 
                                        id="loginLogoUrl" 
                                        value={settings.loginLogoUrl} 
                                        onChange={(e) => updateSetting('loginLogoUrl', e.target.value)} 
                                        placeholder="URL ou envie um arquivo"
                                    />
                                    <Input 
                                        type="file" 
                                        id="login-logo-upload" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleLogoImageUpload(e, 'login')}
                                    />
                                    <Button asChild variant="outline">
                                        <label htmlFor="login-logo-upload" className="cursor-pointer">
                                            <Upload className="h-4 w-4" />
                                        </label>
                                    </Button>
                                </div>
                                {settings.loginLogoUrl && (
                                    <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="p-0 h-auto" 
                                        onClick={() => updateSetting('loginLogoUrl', '')}
                                    >
                                        Remover logo
                                    </Button>
                                )}
                                <p className="text-xs text-muted-foreground">Logo específico para a página de login. Se não for definido, usará o logo principal.</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="faviconUrl">Favicon do Aplicativo</Label>
                              {settings.faviconUrl && (
                                <div className="relative w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                  <Image 
                                    src={settings.faviconUrl} 
                                    alt="Pré-visualização do favicon" 
                                    fill 
                                    className="object-contain rounded-md" 
                                  />
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Input 
                                  id="faviconUrl" 
                                  value={settings.faviconUrl} 
                                  onChange={(e) => updateSetting('faviconUrl', e.target.value)} 
                                  placeholder="URL ou envie um arquivo"
                                />
                                <Input 
                                  type="file" 
                                  id="favicon-upload" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => handleLogoImageUpload(e, 'favicon')}
                                />
                                <Button asChild variant="outline">
                                  <label htmlFor="favicon-upload" className="cursor-pointer">
                                    <Upload className="h-4 w-4" />
                                  </label>
                                </Button>
                              </div>
                              {settings.faviconUrl && (
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="p-0 h-auto" 
                                  onClick={() => updateSetting('faviconUrl', '')}
                                >
                                  Remover favicon
                                </Button>
                              )}
                              <p className="text-xs text-muted-foreground">O favicon é o ícone que aparece na aba do navegador. Use uma imagem quadrada pequena (ex: 32x32px).</p>
                            </div>
                            <CardFooter className="flex justify-end">
                                <Button onClick={handleSaveChanges}>
                                    Salvar Configurações
                                </Button>
                            </CardFooter>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="notificacoes">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Modelos de Email</CardTitle>
                                <CardDescription>Gerencie as notificações por email enviadas pela plataforma.</CardDescription>
                            </div>
                            <TestEmailDialog />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <Label htmlFor="email-notifications" className="font-semibold">Habilitar Notificações por Email</Label>
                                    <p className="text-sm text-muted-foreground">Habilite para enviar emails sobre matrículas, conclusões, etc.</p>
                                </div>
                                <Switch id="email-notifications" checked={notificationSettings.enabled} onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, enabled: checked}))} />
                            </div>
                            <Accordion type="single" collapsible className="w-full" disabled={!notificationSettings.enabled}>
                                {notificationSettings.templates.map((template) => (
                                <AccordionItem value={template.id} key={template.id}>
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-4">
                                            <Mail className="h-5 w-5"/>
                                            <div>
                                                <p className="font-semibold text-left">{template.name}</p>
                                                <p className="text-sm text-muted-foreground text-left">{template.description}</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 bg-muted/50 rounded-md">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor={`enabled-${template.id}`} className="font-medium">Enviar este email</Label>
                                                <Switch id={`enabled-${template.id}`} checked={template.enabled} onCheckedChange={(checked) => handleNotificationTemplateChange(template.id, 'enabled', checked)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`subject-${template.id}`}>Assunto</Label>
                                                <Input id={`subject-${template.id}`} value={template.subject} onChange={(e) => handleNotificationTemplateChange(template.id, 'subject', e.target.value)} disabled={!template.enabled} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`content-${template.id}`}>Conteúdo</Label>
                                                <Textarea id={`content-${template.id}`} value={template.content} onChange={(e) => handleNotificationTemplateChange(template.id, 'content', e.target.value)} rows={8} disabled={!template.enabled} />
                                                <p className="text-xs text-muted-foreground">
                                                    Variáveis disponíveis: <code className="bg-primary/10 text-primary p-1 rounded-sm">{"{{nome_aluno}}"}</code> <code className="bg-primary/10 text-primary p-1 rounded-sm">{"{{nome_curso}}"}</code> <code className="bg-primary/10 text-primary p-1 rounded-sm">{"{{nome_empresa}}"}</code>
                                                </p>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                 <TabsContent value="tabelas">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gerenciamento de Dados</CardTitle>
                            <CardDescription>Acesse e gerencie as principais tabelas de dados da aplicação em uma interface CRUD simples.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                                    <Link href="/tabelas/cursos"><BookOpen className="size-6"/><span>Cursos</span></Link>
                                </Button>
                                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                                    <Link href="/tabelas/agendamentos"><CalendarDays className="size-6"/><span>Agendamentos</span></Link>
                                </Button>
                                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                                    <Link href="/tabelas/empresas"><Building className="size-6"/><span>Empresas</span></Link>
                                </Button>
                                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                                    <Link href="/tabelas/usuarios"><Users className="size-6"/><span>Usuários</span></Link>
                                </Button>
                                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                                    <Link href="/tabelas/instrutores"><UserCheck className="size-6"/><span>Instrutores</span></Link>
                                </Button>
                                 <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                                    <Link href="/relatorios"><FileText className="size-6"/><span>Relatórios</span></Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="acesso">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle>Perfis de Acesso</CardTitle>
                            <CardDescription>Gerencie as permissões para cada perfil de usuário.</CardDescription>
                          </div>
                          <AddEditRoleDialog onSave={handleSaveRole}>
                              <Button variant="outline">
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Adicionar Perfil
                              </Button>
                          </AddEditRoleDialog>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {rolesLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        <p className="text-sm text-muted-foreground">Carregando perfis...</p>
                                    </div>
                                </div>
                            ) : roles.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">Nenhum perfil de acesso encontrado.</p>
                                    <Button 
                                        onClick={async () => {
                                            try {
                                                await initializeDefaultRoles();
                                                toast({ title: "Sucesso!", description: "Perfis padrão criados com sucesso!" });
                                                loadRoles();
                                            } catch (error) {
                                                toast({ 
                                                    title: "Erro", 
                                                    description: "Falha ao criar perfis padrão",
                                                    variant: "destructive"
                                                });
                                            }
                                        }}
                                    >
                                        Criar Perfis Padrão
                                    </Button>
                                </div>
                            ) : (
                                <Accordion type="multiple" className="w-full space-y-4">
                                    {roles.map(role => (
                                    <AccordionItem value={role.name} key={role.name} className="border-b-0">
                                        <Card className="overflow-hidden">
                                            <CardHeader className="flex flex-row items-center justify-between p-6">
                                                <AccordionTrigger className="w-full p-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center gap-4 text-left">
                                                            <div>
                                                                <CardTitle className="text-lg">{role.name}</CardTitle>
                                                                <CardDescription>{role.description}</CardDescription>
                                                            </div>
                                                        </div>
                                                        <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
                                                    </div>
                                                </AccordionTrigger>
                                                {role.name !== 'Administrador' && (
                                                    <div className="pl-4">
                                                      <AddEditRoleDialog role={role} onSave={handleSaveRole}>
                                                        <Button variant="ghost" size="icon">
                                                          <Pencil className="h-4 w-4" />
                                                        </Button>
                                                      </AddEditRoleDialog>
                                                    </div>
                                                )}
                                            </CardHeader>
                                            <AccordionContent>
                                                <CardContent>
                                                    <PermissionsTable role={role} handlePermissionChange={handlePermissionChange} />
                                                </CardContent>
                                            </AccordionContent>
                                        </Card>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="certificado">
                    <Tabs defaultValue="page1">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="page1">Página 1 (Frente)</TabsTrigger>
                            <TabsTrigger value="page2">Página 2 (Conteúdo)</TabsTrigger>
                        </TabsList>
                        <TabsContent value="page1" className="mt-4">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader><CardTitle>Conteúdo Principal</CardTitle></CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Cabeçalho</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                <Input value={certificateSettings.header.text} onChange={(e) => handleCertificateChange(['header', 'text'], e.target.value)} className="md:col-span-4"/>
                                                <Input type="number" value={certificateSettings.header.top} onChange={(e) => handleCertificateChange(['header', 'top'], e.target.valueAsNumber)} placeholder="Top %" />
                                                <Input type="number" value={certificateSettings.header.left} onChange={(e) => handleCertificateChange(['header', 'left'], e.target.valueAsNumber)} placeholder="Left %" />
                                                <Input type="number" value={certificateSettings.header.size} onChange={(e) => handleCertificateChange(['header', 'size'], e.target.valueAsNumber)} placeholder="Tam. (px)" />
                                                <Input value={certificateSettings.header.classes} onChange={(e) => handleCertificateChange(['header', 'classes'], e.target.value)} placeholder="Classes CSS" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nome do Aluno (Posição e Estilo)</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                <Input type="number" value={certificateSettings.studentName.top} onChange={(e) => handleCertificateChange(['studentName', 'top'], e.target.valueAsNumber)} placeholder="Top %" />
                                                <Input type="number" value={certificateSettings.studentName.left} onChange={(e) => handleCertificateChange(['studentName', 'left'], e.target.valueAsNumber)} placeholder="Left %" />
                                                <Input type="number" value={certificateSettings.studentName.size} onChange={(e) => handleCertificateChange(['studentName', 'size'], e.target.valueAsNumber)} placeholder="Tam. (px)" />
                                                <Input value={certificateSettings.studentName.classes} onChange={(e) => handleCertificateChange(['studentName', 'classes'], e.target.value)} placeholder="Classes CSS" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Corpo do Texto</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                <Textarea value={certificateSettings.body.text} onChange={(e) => handleCertificateChange(['body', 'text'], e.target.value)} className="md:col-span-4"/>
                                                <Input type="number" value={certificateSettings.body.top} onChange={(e) => handleCertificateChange(['body', 'top'], e.target.valueAsNumber)} placeholder="Top %" />
                                                <Input type="number" value={certificateSettings.body.left} onChange={(e) => handleCertificateChange(['body', 'left'], e.target.valueAsNumber)} placeholder="Left %" />
                                                <Input type="number" value={certificateSettings.body.size} onChange={(e) => handleCertificateChange(['body', 'size'], e.target.valueAsNumber)} placeholder="Tam. (px)" />
                                                <Input value={certificateSettings.body.classes} onChange={(e) => handleCertificateChange(['body', 'classes'], e.target.value)} placeholder="Classes CSS" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nome do Curso (Posição e Estilo)</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                <Input type="number" value={certificateSettings.courseName.top} onChange={(e) => handleCertificateChange(['courseName', 'top'], e.target.valueAsNumber)} placeholder="Top %" />
                                                <Input type="number" value={certificateSettings.courseName.left} onChange={(e) => handleCertificateChange(['courseName', 'left'], e.target.valueAsNumber)} placeholder="Left %" />
                                                <Input type="number" value={certificateSettings.courseName.size} onChange={(e) => handleCertificateChange(['courseName', 'size'], e.target.valueAsNumber)} placeholder="Tam. (px)" />
                                                <Input value={certificateSettings.courseName.classes} onChange={(e) => handleCertificateChange(['courseName', 'classes'], e.target.value)} placeholder="Classes CSS" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader><CardTitle>Rodapé</CardTitle></CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Nome do Instrutor</Label>
                                             <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                <Input type="number" value={certificateSettings.instructorName.top} onChange={(e) => handleCertificateChange(['instructorName', 'top'], e.target.valueAsNumber)} placeholder="Top %" />
                                                <Input type="number" value={certificateSettings.instructorName.left} onChange={(e) => handleCertificateChange(['instructorName', 'left'], e.target.valueAsNumber)} placeholder="Left %" />
                                                <Input type="number" value={certificateSettings.instructorName.size} onChange={(e) => handleCertificateChange(['instructorName', 'size'], e.target.valueAsNumber)} placeholder="Tam. (px)" />
                                                <Input value={certificateSettings.instructorName.classes} onChange={(e) => handleCertificateChange(['instructorName', 'classes'], e.target.value)} placeholder="Classes CSS" />
                                            </div>
                                             <div className="flex items-center space-x-2 mt-2">
                                                <Checkbox id="show-underline" checked={certificateSettings.instructorName.showUnderline} onCheckedChange={(checked) => handleCertificateChange(['instructorName', 'showUnderline'], !!checked)} />
                                                <Label htmlFor="show-underline">Mostrar sublinhado</Label>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Título do Instrutor</Label>
                                             <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                <Input value={certificateSettings.instructorTitle.text} onChange={(e) => handleCertificateChange(['instructorTitle', 'text'], e.target.value)} className="md:col-span-4"/>
                                                <Input type="number" value={certificateSettings.instructorTitle.top} onChange={(e) => handleCertificateChange(['instructorTitle', 'top'], e.target.valueAsNumber)} placeholder="Top %" />
                                                <Input type="number" value={certificateSettings.instructorTitle.left} onChange={(e) => handleCertificateChange(['instructorTitle', 'left'], e.target.valueAsNumber)} placeholder="Left %" />
                                                <Input type="number" value={certificateSettings.instructorTitle.size} onChange={(e) => handleCertificateChange(['instructorTitle', 'size'], e.target.valueAsNumber)} placeholder="Tam. (px)" />
                                                <Input value={certificateSettings.instructorTitle.classes} onChange={(e) => handleCertificateChange(['instructorTitle', 'classes'], e.target.value)} placeholder="Classes CSS" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Texto de Verificação</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                <Input value={certificateSettings.verificationCode.text} onChange={(e) => handleCertificateChange(['verificationCode', 'text'], e.target.value)} className="md:col-span-4"/>
                                                <Input type="number" value={certificateSettings.verificationCode.top} onChange={(e) => handleCertificateChange(['verificationCode', 'top'], e.target.valueAsNumber)} placeholder="Top %" />
                                                <Input type="number" value={certificateSettings.verificationCode.left} onChange={(e) => handleCertificateChange(['verificationCode', 'left'], e.target.valueAsNumber)} placeholder="Left %" />
                                                <Input type="number" value={certificateSettings.verificationCode.size} onChange={(e) => handleCertificateChange(['verificationCode', 'size'], e.target.valueAsNumber)} placeholder="Tam. (px)" />
                                                <Input value={certificateSettings.verificationCode.classes} onChange={(e) => handleCertificateChange(['verificationCode', 'classes'], e.target.value)} placeholder="Classes CSS" />
                                            </div>
                                        </div>
                                         <div className="space-y-2">
                                            <Label>Data de Emissão</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                <Input value={certificateSettings.issueDate.text} onChange={(e) => handleCertificateChange(['issueDate', 'text'], e.target.value)} className="md:col-span-4"/>
                                                <Input type="number" value={certificateSettings.issueDate.top} onChange={(e) => handleCertificateChange(['issueDate', 'top'], e.target.valueAsNumber)} placeholder="Top %" />
                                                <Input type="number" value={certificateSettings.issueDate.left} onChange={(e) => handleCertificateChange(['issueDate', 'left'], e.target.valueAsNumber)} placeholder="Left %" />
                                                <Input type="number" value={certificateSettings.issueDate.size} onChange={(e) => handleCertificateChange(['issueDate', 'size'], e.target.valueAsNumber)} placeholder="Tam. (px)" />
                                                <Input value={certificateSettings.issueDate.classes} onChange={(e) => handleCertificateChange(['issueDate', 'classes'], e.target.value)} placeholder="Classes CSS" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><CardTitle>QR Code</CardTitle></CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <Label htmlFor="qr-enabled" className="font-semibold">Habilitar QR Code</Label>
                                            <Switch id="qr-enabled" checked={certificateSettings.qrCode.enabled} onCheckedChange={(checked) => handleCertificateChange(['qrCode', 'enabled'], checked)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="qr-url">URL Base de Verificação</Label>
                                            <Input id="qr-url" value={certificateSettings.qrCode.baseUrl} onChange={(e) => handleCertificateChange(['qrCode', 'baseUrl'], e.target.value)} placeholder="https://seu-dominio.com/verificar" disabled={!certificateSettings.qrCode.enabled}/>
                                        </div>
                                        <div className="space-y-2">
                                             <Label>Posição (Top: {certificateSettings.qrCode.top}%, Left: {certificateSettings.qrCode.left}%)</Label>
                                             <div className="grid grid-cols-2 gap-4">
                                                <Slider value={[certificateSettings.qrCode.top]} onValueChange={([val]) => handleCertificateChange(['qrCode', 'top'], val)} max={100} step={1} disabled={!certificateSettings.qrCode.enabled}/>
                                                <Slider value={[certificateSettings.qrCode.left]} onValueChange={([val]) => handleCertificateChange(['qrCode', 'left'], val)} max={100} step={1} disabled={!certificateSettings.qrCode.enabled}/>
                                             </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tamanho ({certificateSettings.qrCode.size}px)</Label>
                                            <Slider value={[certificateSettings.qrCode.size]} onValueChange={([val]) => handleCertificateChange(['qrCode', 'size'], val)} min={40} max={200} step={4} disabled={!certificateSettings.qrCode.enabled}/>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Aparência (Página 1)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Label htmlFor="page1Background">Imagem de Fundo</Label>
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                id="page1Background" 
                                                value={certificateSettings.page1Background?.startsWith('data:image') ? 'Imagem enviada' : certificateSettings.page1Background || ''} 
                                                onChange={(e) => handleCertificateFieldChange('page1Background', e.target.value)} 
                                                placeholder="URL ou envie um arquivo"
                                                disabled={certificateSettings.page1Background?.startsWith('data:image')}
                                            />
                                            <Input 
                                                type="file" 
                                                id="page1-upload" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => handleBackgroundImageUpload(e, 'page1Background')}
                                            />
                                            <Button asChild variant="outline">
                                                <label htmlFor="page1-upload" className="cursor-pointer">
                                                    <Upload className="h-4 w-4" />
                                                </label>
                                            </Button>
                                        </div>
                                        {certificateSettings.page1Background?.startsWith('data:image') && (
                                            <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => handleCertificateFieldChange('page1Background', '')}>
                                                Remover imagem
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Textos Personalizados (Página 1)</CardTitle>
                                            <CardDescription>Adicione textos extras ao certificado.</CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => handleAddCustomText(1)}><PlusCircle className="mr-2"/> Adicionar Texto</Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {certificateSettings.customTexts?.filter(t => t.page === 1).map(text => (
                                            <div key={text.id} className="p-3 border rounded-md space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Label>Texto Personalizado</Label>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCustomText(text.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                                    </Button>
                                                </div>
                                                <Input value={text.text} onChange={(e) => handleCustomTextChange(text.id, 'text', e.target.value)} placeholder="Seu texto aqui" />
                                                <div className="flex items-center gap-2">
                                                    <Input type="number" value={text.top} onChange={(e) => handleCustomTextChange(text.id, 'top', e.target.valueAsNumber)} placeholder="Top %" />
                                                    <Input type="number" value={text.left} onChange={(e) => handleCustomTextChange(text.id, 'left', e.target.valueAsNumber)} placeholder="Left %" />
                                                    <Input type="number" value={text.size} onChange={(e) => handleCustomTextChange(text.id, 'size', e.target.valueAsNumber)} placeholder="Tam. (px)" />
                                                </div>
                                            </div>
                                        ))}
                                        {certificateSettings.customTexts?.filter(t => t.page === 1).length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center">Nenhum texto personalizado adicionado.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="page2" className="mt-4">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Conteúdo do Verso do Certificado</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Título da Página</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                <Input value={certificateSettings.syllabusTitle.text} onChange={(e) => handleCertificateChange(['syllabusTitle', 'text'], e.target.value)} className="md:col-span-4"/>
                                                <Input type="number" value={certificateSettings.syllabusTitle.top} onChange={(e) => handleCertificateChange(['syllabusTitle', 'top'], e.target.valueAsNumber)} placeholder="Top %" />
                                                <Input type="number" value={certificateSettings.syllabusTitle.left} onChange={(e) => handleCertificateChange(['syllabusTitle', 'left'], e.target.valueAsNumber)} placeholder="Left %" />
                                                <Input type="number" value={certificateSettings.syllabusTitle.size} onChange={(e) => handleCertificateChange(['syllabusTitle', 'size'], e.target.valueAsNumber)} placeholder="Tam. (px)" />
                                                <Input value={certificateSettings.syllabusTitle.classes} onChange={(e) => handleCertificateChange(['syllabusTitle', 'classes'], e.target.value)} placeholder="Classes CSS" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Aparência (Página 2)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Label htmlFor="page2Background">Imagem de Fundo</Label>
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                id="page2Background" 
                                                value={certificateSettings.page2Background?.startsWith('data:image') ? 'Imagem enviada' : certificateSettings.page2Background || ''} 
                                                onChange={(e) => handleCertificateFieldChange('page2Background', e.target.value)} 
                                                placeholder="URL ou envie um arquivo"
                                                disabled={certificateSettings.page2Background?.startsWith('data:image')}
                                            />
                                            <Input 
                                                type="file" 
                                                id="page2-upload" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => handleBackgroundImageUpload(e, 'page2Background')}
                                            />
                                            <Button asChild variant="outline">
                                                <label htmlFor="page2-upload" className="cursor-pointer">
                                                    <Upload className="h-4 w-4" />
                                                </label>
                                            </Button>
                                        </div>
                                         {certificateSettings.page2Background?.startsWith('data:image') && (
                                            <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => handleCertificateFieldChange('page2Background', '')}>
                                                Remover imagem
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Textos Personalizados (Página 2)</CardTitle>
                                            <CardDescription>Adicione textos extras à página de conteúdo.</CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => handleAddCustomText(2)}><PlusCircle className="mr-2"/> Adicionar Texto</Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {certificateSettings.customTexts?.filter(t => t.page === 2).map(text => (
                                            <div key={text.id} className="p-3 border rounded-md space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <Label>Texto Personalizado</Label>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCustomText(text.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                                    </Button>
                                                </div>
                                                <Input value={text.text} onChange={(e) => handleCustomTextChange(text.id, 'text', e.target.value)} placeholder="Seu texto aqui" />
                                                <div className="flex items-center gap-2">
                                                    <Input type="number" value={text.top} onChange={(e) => handleCustomTextChange(text.id, 'top', e.target.valueAsNumber)} placeholder="Top %" />
                                                    <Input type="number" value={text.left} onChange={(e) => handleCustomTextChange(text.id, 'left', e.target.valueAsNumber)} placeholder="Left %" />
                                                    <Input type="number" value={text.size} onChange={(e) => handleCustomTextChange(text.id, 'size', e.target.valueAsNumber)} placeholder="Tam. (px)" />
                                                </div>
                                            </div>
                                        ))}
                                         {certificateSettings.customTexts?.filter(t => t.page === 2).length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center">Nenhum texto personalizado adicionado.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        <Alert variant="default" className="mt-4">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Dica</AlertTitle>
                            <AlertDescription>
                                Você pode usar qualquer classe do Tailwind CSS para customizar os textos. 
                                <Button variant="link" asChild className="p-1 h-auto text-xs"><a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer">Consulte a documentação <ExternalLink className="ml-1 h-3 w-3"/></a></Button>
                            </AlertDescription>
                        </Alert>
                    </Tabs>
                </TabsContent>
                <TabsContent value="log">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><LogIn className="size-5" />Log de Logins</CardTitle>
                                <CardDescription>Registros de acesso à plataforma.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Usuário</TableHead>
                                            <TableHead>Empresa</TableHead>
                                            <TableHead>Data / Hora</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logsLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                        Carregando logs de login...
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : loginLogs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                    Nenhum log de login encontrado.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            loginLogs.map(log => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="font-medium">{log.userName}</TableCell>
                                                    <TableCell>{log.companyName}</TableCell>
                                                    <TableCell>{format(log.timestamp, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><FileClock className="size-5" />Log de Envio de Notificações</CardTitle>
                                <CardDescription>Registros de envio de emails e notificações.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Destinatário</TableHead>
                                            <TableHead>Data / Hora</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logsLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                        Carregando logs de notificações...
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : notificationLogs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    Nenhum log de notificação encontrado.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            notificationLogs.map(log => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="font-medium">{log.type}</TableCell>
                                                    <TableCell>{log.recipient}</TableCell>
                                                    <TableCell>{format(log.timestamp, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={log.status === 'Sucesso' ? 'default' : 'destructive'}>{log.status}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                </div>
                </ScrollArea>
            </Tabs>

            <Card className="mt-6">
                <CardFooter className="flex justify-end gap-2 p-4">
                     <PreviewCertificateDialog settings={certificateSettings}>
                         <Button variant="outline">Pré-visualizar Certificado</Button>
                    </PreviewCertificateDialog>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline"><FileDown className="mr-2"/>Exportar PDF de Teste</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                             <DialogHeader>
                                <DialogTitle>Exportar PDF de Teste</DialogTitle>
                                <DialogDescription>
                                    A pré-visualização abaixo será usada para gerar o PDF.
                                </DialogDescription>
                            </DialogHeader>
                             <div className="py-4" ref={certificatePreviewRef}>
                                <div id="cert-preview-page-1" className="w-full aspect-[297/210] mx-auto p-8 flex flex-col text-gray-800 relative bg-white"
                                     style={{ backgroundImage: `url(${certificateSettings.page1Background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                    <main className="text-center flex-1 flex flex-col justify-center relative">
                                        <p className={cn("absolute", certificateSettings.header.classes)} style={{ top: `${certificateSettings.header.top}%`, left: `${certificateSettings.header.left}%`, fontSize: `${certificateSettings.header.size}px` }}>{certificateSettings.header.text}</p>
                                        <h2 className={cn("absolute", certificateSettings.studentName.classes)} style={{ top: `${certificateSettings.studentName.top}%`, left: `${certificateSettings.studentName.left}%`, fontSize: `${certificateSettings.studentName.size}px` }}>Nome do Aluno</h2>
                                        <p className={cn("absolute", certificateSettings.body.classes)} style={{ top: `${certificateSettings.body.top}%`, left: `${certificateSettings.body.left}%`, fontSize: `${certificateSettings.body.size}px` }}>{certificateSettings.body.text}</p>
                                        <h3 className={cn("absolute", certificateSettings.courseName.classes)} style={{ top: `${certificateSettings.courseName.top}%`, left: `${certificateSettings.courseName.left}%`, fontSize: `${certificateSettings.courseName.size}px` }}>Nome do Curso</h3>
                                    </main>
                                    <footer className="relative w-full h-28 text-sm">
                                        <div className={cn("absolute text-center", certificateSettings.instructorName.classes)} style={{ top: `${certificateSettings.instructorName.top}%`, left: `${certificateSettings.instructorName.left}%`, fontSize: `${certificateSettings.instructorName.size}px`}}>
                                            Nome do Instrutor
                                            {certificateSettings.instructorName.showUnderline && <div className="mt-1 border-b-2 border-dotted border-gray-700 w-full"></div>}
                                        </div>
                                         <p className={cn("absolute", certificateSettings.instructorTitle.classes)} style={{ top: `${certificateSettings.instructorTitle.top}%`, left: `${certificateSettings.instructorTitle.left}%`, fontSize: `${certificateSettings.instructorTitle.size}px`}}>{certificateSettings.instructorTitle.text}</p>
                                        <p className={cn("absolute", certificateSettings.verificationCode.classes)} style={{ top: `${certificateSettings.verificationCode.top}%`, left: `${certificateSettings.verificationCode.left}%`, fontSize: `${certificateSettings.verificationCode.size}px`}}>{certificateSettings.verificationCode.text} CERT-XXXX-YYYY</p>
                                        <div className={cn("absolute text-center", certificateSettings.issueDate.classes)} style={{ top: `${certificateSettings.issueDate.top}%`, left: `${certificateSettings.issueDate.left}%`, fontSize: `${certificateSettings.issueDate.size}px`}}>
                                            {certificateSettings.issueDate.text}
                                            <p>{format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                                        </div>
                                        {certificateSettings.qrCode.enabled && (
                                            <div className="absolute" style={{ top: `${certificateSettings.qrCode.top}%`, left: `${certificateSettings.qrCode.left}%` }}>
                                                <QRCode value={verificationUrl} size={certificateSettings.qrCode.size} level="L" />
                                            </div>
                                        )}
                                    </footer>
                                </div>
                                <div id="cert-preview-page-2" className="w-full aspect-[297/210] mx-auto p-8 flex flex-col text-gray-800 relative bg-white mt-4"
                                    style={{ backgroundImage: `url(${certificateSettings.page2Background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                        <header className="pb-4"><h1 className={cn("absolute", certificateSettings.syllabusTitle.classes)} style={{ top: `${certificateSettings.syllabusTitle.top}%`, left: `${certificateSettings.syllabusTitle.left}%`, fontSize: `${certificateSettings.syllabusTitle.size}px` }}>{certificateSettings.syllabusTitle.text}</h1></header>
                                        <main className="py-8 flex-1">
                                            <ul className="space-y-4 text-gray-700">
                                                <li>Item 1 do conteúdo programático de exemplo</li>
                                                <li>Item 2 do conteúdo programático de exemplo</li>
                                                <li>Item 3 do conteúdo programático de exemplo</li>
                                                <li>Item 4 do conteúdo programático de exemplo</li>
                                                <li>Item 5 do conteúdo programático de exemplo</li>
                                            </ul>
                                        </main>
                                        <footer className="pt-8 text-sm text-center text-gray-500">
                                            <p>Certificado emitido para <span className="font-semibold text-gray-700">Nome do Aluno</span> em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.</p>
                                            <p className="font-bold mt-2">Seanutri</p>
                                        </footer>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleTestPdfExport}>Baixar PDF</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
                </CardFooter>
            </Card>

        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
