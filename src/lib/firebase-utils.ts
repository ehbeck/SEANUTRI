import { db } from './firebase.config';
import { collection, getDocs, query, limit } from 'firebase/firestore';

// Verificar se a configuração do Firebase está correta
export function validateFirebaseConfig() {
  const requiredConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  const missingConfig = Object.entries(requiredConfig)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingConfig.length > 0) {
    console.error('Configurações do Firebase ausentes:', missingConfig);
    return {
      isValid: false,
      missing: missingConfig,
      error: `Configurações ausentes: ${missingConfig.join(', ')}`
    };
  }

  return {
    isValid: true,
    missing: [],
    error: null
  };
}

// Testar conectividade com o Firestore
export async function testFirestoreConnection(): Promise<{
  success: boolean;
  error?: string;
  latency?: number;
}> {
  try {
    const startTime = Date.now();
    
    // Tentar fazer uma consulta simples
    const testQuery = query(collection(db, 'test'), limit(1));
    await getDocs(testQuery);
    
    const endTime = Date.now();
    const latency = endTime - startTime;

    return {
      success: true,
      latency
    };
  } catch (error: any) {
    console.error('Erro ao testar conexão com Firestore:', error);
    
    let errorMessage = 'Erro desconhecido';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Permissão negada. Verifique as regras de segurança do Firestore.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Serviço indisponível. Verifique sua conexão com a internet.';
    } else if (error.code === 'deadline-exceeded') {
      errorMessage = 'Timeout na conexão. O servidor demorou muito para responder.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

// Verificar se o projeto Firebase está ativo
export async function checkFirebaseProjectStatus(): Promise<{
  isActive: boolean;
  error?: string;
}> {
  try {
    // Tentar acessar uma coleção que deve existir
    const testQuery = query(collection(db, 'users'), limit(1));
    await getDocs(testQuery);
    
    return {
      isActive: true
    };
  } catch (error: any) {
    console.error('Erro ao verificar status do projeto:', error);
    
    if (error.code === 'not-found') {
      return {
        isActive: false,
        error: 'Projeto não encontrado ou inativo'
      };
    }
    
    return {
      isActive: false,
      error: error.message || 'Erro ao verificar status do projeto'
    };
  }
}

// Função para diagnosticar problemas de conectividade
export async function diagnoseFirebaseIssues(): Promise<{
  configValid: boolean;
  connectionTest: boolean;
  projectActive: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // 1. Verificar configuração
  const configValidation = validateFirebaseConfig();
  if (!configValidation.isValid) {
    issues.push(`Configuração inválida: ${configValidation.error}`);
    recommendations.push('Verifique as variáveis de ambiente do Firebase');
  }

  // 2. Testar conectividade
  const connectionTest = await testFirestoreConnection();
  if (!connectionTest.success) {
    issues.push(`Problema de conectividade: ${connectionTest.error}`);
    recommendations.push('Verifique sua conexão com a internet');
    recommendations.push('Verifique se o Firebase está acessível');
  }

  // 3. Verificar status do projeto
  const projectStatus = await checkFirebaseProjectStatus();
  if (!projectStatus.isActive) {
    issues.push(`Projeto inativo: ${projectStatus.error}`);
    recommendations.push('Verifique se o projeto Firebase está ativo');
    recommendations.push('Verifique as regras de segurança do Firestore');
  }

  return {
    configValid: configValidation.isValid,
    connectionTest: connectionTest.success,
    projectActive: projectStatus.isActive,
    issues,
    recommendations
  };
} 