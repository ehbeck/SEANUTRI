
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/icons";
import { LoginLogo } from "@/components/app-logo";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, ShieldCheck } from "lucide-react";
import { users, addLoginLog } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type UserSession = {
  id: string;
  name: string;
  email: string;
  profile: 'Administrador' | 'Aluno' | 'Instrutor' | 'Gestor de Empresa' | string;
  companyId: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, resetPassword, user, loading: authLoading } = useFirebaseAuth();
  
  console.log('LoginPage render:', { user: !!user, authLoading, userData: user });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Redirecionar se já estiver logado
  useEffect(() => {
    console.log('useEffect triggered:', { user: !!user, authLoading, userData: user });
    if (user && !authLoading) {
      console.log('Usuário autenticado, redirecionando...');
      const sessionUser: UserSession = {
        id: user.id,
        name: user.name || user.email || '',
        email: user.email || '',
        profile: 'Administrador', // Perfil com acesso total
        companyId: user.companyId || ''
      };
      localStorage.setItem('userSession', JSON.stringify(sessionUser));
      console.log('Session salva, redirecionando para /dashboard');
      
      // Forçar redirecionamento
      setTimeout(() => {
        console.log('Executando redirecionamento...');
        window.location.href = '/dashboard';
      }, 100);
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Limpar dados antigos do localStorage
    localStorage.removeItem('userSession');

    try {
      console.log('Iniciando login...');
      // Login via Firebase usando o hook
      const result = await login(email, password);
      console.log('Login bem-sucedido:', result);
      
      // O redirecionamento será feito pelo useEffect acima
      toast({
        title: `Bem-vindo(a) de volta!`,
        description: 'Você foi autenticado com sucesso.'
      });
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError('Credenciais inválidas. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode) {
      router.push(`/verificar/${verificationCode}`);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Por favor, insira seu email.');
      return;
    }

    setResetLoading(true);
    setError('');

    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.'
      });
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      setError('Erro ao enviar email de reset. Verifique se o email está correto.');
    } finally {
      setResetLoading(false);
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4">
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <Card className="w-full">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <LoginLogo />
                </div>
                <CardDescription>Bem-vindo(a) de volta! Faça login para continuar.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-primary hover:underline"
                        disabled={isLoading}
                      >
                        Esqueci a senha
                      </button>
                    </div>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erro de Autenticação</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="flex items-center w-full">
              <Separator className="flex-1" />
              <span className="px-4 text-xs text-muted-foreground">OU</span>
              <Separator className="flex-1" />
            </div>

            <Card className="w-full flex flex-col justify-center">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="text-primary"/>
                  Verificar Autenticidade
                </CardTitle>
                <CardDescription>
                    Insira o código de verificação para confirmar a validade de um certificado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <form onSubmit={handleVerification} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="verification-code">Código do Certificado</Label>
                        <Input 
                            id="verification-code" 
                            placeholder="Ex: CERT-P001-2"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Verificar
                    </Button>
                </form>
              </CardContent>
            </Card>

            {/* Modal de Reset de Senha */}
            <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Info className="text-primary"/>
                    Redefinir Senha
                  </DialogTitle>
                  <DialogDescription>
                    {resetSuccess 
                      ? 'Email enviado com sucesso! Verifique sua caixa de entrada.'
                      : 'Digite seu email para receber um link de redefinição de senha.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {!resetSuccess ? (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input 
                          id="reset-email" 
                          type="email" 
                          required 
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          disabled={resetLoading}
                          placeholder="Digite seu email cadastrado"
                        />
                      </div>
                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Erro</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          className="flex-1" 
                          disabled={resetLoading}
                        >
                          {resetLoading ? 'Enviando...' : 'Enviar Email'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setShowForgotPassword(false);
                            setResetEmail('');
                            setError('');
                            setResetSuccess(false);
                          }}
                          disabled={resetLoading}
                        >
                          Cancelar
                        </Button>
                      </DialogFooter>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Email Enviado!</AlertTitle>
                        <AlertDescription>
                          Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                        </AlertDescription>
                      </Alert>
                      <Button 
                        type="button" 
                        className="w-full"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setResetEmail('');
                          setError('');
                          setResetSuccess(false);
                        }}
                      >
                        Voltar ao Login
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
        </div>
    </div>
  );
}
