import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase.config';
import { collection, onSnapshot, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter, QuerySnapshot, DocumentData } from 'firebase/firestore';

interface FirebaseState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastSync: Date | null;
}

export function useFirebase() {
  const [state, setState] = useState<FirebaseState>({
    isConnected: false,
    isConnecting: true,
    error: null,
    lastSync: null
  });

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let connectionTimeout: NodeJS.Timeout | null = null;

    const checkConnection = async () => {
      try {
        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        // Set a timeout for connection check
        connectionTimeout = setTimeout(() => {
          setState(prev => ({
            ...prev,
            isConnecting: false,
            isConnected: false,
            error: 'Timeout: Não foi possível conectar ao Firebase em 10 segundos'
          }));
        }, 10000);

        // Try to get a simple document to test connection
        const testQuery = query(collection(db, 'test'), limit(1));
        
        unsubscribe = onSnapshot(
          testQuery,
          (snapshot) => {
            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
              connectionTimeout = null;
            }
            
            setState(prev => ({
              ...prev,
              isConnecting: false,
              isConnected: true,
              error: null,
              lastSync: new Date()
            }));
          },
          (error) => {
            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
              connectionTimeout = null;
            }
            
            console.error('Firebase connection error:', error);
            setState(prev => ({
              ...prev,
              isConnecting: false,
              isConnected: false,
              error: `Erro de conexão: ${error.message}`
            }));
          }
        );

      } catch (error: any) {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
        }
        
        console.error('Firebase initialization error:', error);
        setState(prev => ({
          ...prev,
          isConnecting: false,
          isConnected: false,
          error: `Erro de inicialização: ${error.message}`
        }));
      }
    };

    checkConnection();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
    };
  }, []);

  const retryConnection = () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    // The useEffect will handle the retry
  };

  return {
    ...state,
    retryConnection
  };
}

// Hook para operações do Firestore com melhor tratamento de erros
export function useFirestoreOperation<T>(
  operation: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await operation();
      setData(result);
    } catch (err: any) {
      console.error('Firestore operation error:', err);
      setError(err.message || 'Erro desconhecido na operação do Firestore');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    execute();
  }, dependencies);

  return { data, loading, error, retry: execute };
}

// Função utilitária para verificar conectividade
export async function checkFirebaseConnection(): Promise<boolean> {
  try {
    const testQuery = query(collection(db, 'test'), limit(1));
    await getDocs(testQuery);
    return true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return false;
  }
} 