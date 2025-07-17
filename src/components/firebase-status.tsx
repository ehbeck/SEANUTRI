'use client';

import { useFirebase } from '@/hooks/use-firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export function FirebaseStatus() {
  const { isConnected, isConnecting, error, lastSync, retryConnection } = useFirebase();

  if (isConnecting) {
    return (
      <Alert className="mb-4">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertTitle>Conectando ao Firebase...</AlertTitle>
        <AlertDescription>
          Estabelecendo conexão com o banco de dados. Aguarde um momento.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isConnected) {
    return (
      <Alert variant="destructive" className="mb-4">
        <WifiOff className="h-4 w-4" />
        <AlertTitle>Erro de Conexão</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>Não foi possível conectar ao Firebase. Verifique sua conexão com a internet.</p>
          {error && (
            <p className="text-sm opacity-90">
              <strong>Detalhes:</strong> {error}
            </p>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={retryConnection}
            className="mt-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Tentar Novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Conectado ao Firebase</AlertTitle>
      <AlertDescription className="text-green-700">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Wifi className="h-3 w-3 mr-1" />
            Online
          </Badge>
          {lastSync && (
            <span className="text-sm">
              Última sincronização: {lastSync.toLocaleTimeString()}
            </span>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Componente compacto para mostrar apenas o status
export function FirebaseStatusBadge() {
  const { isConnected, isConnecting, error } = useFirebase();

  if (isConnecting) {
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        Conectando...
      </Badge>
    );
  }

  if (!isConnected) {
    return (
      <Badge variant="destructive">
        <WifiOff className="h-3 w-3 mr-1" />
        Offline
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-green-100 text-green-800">
      <Wifi className="h-3 w-3 mr-1" />
      Online
    </Badge>
  );
} 