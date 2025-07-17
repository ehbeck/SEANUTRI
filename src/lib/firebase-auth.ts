import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  UserCredential,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase.config';

// Criar usuário
export async function createUser(email: string, password: string, name: string) {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Atualizar o displayName do usuário
    await updateProfile(userCredential.user, {
      displayName: name
    });

    console.log('Usuário criado com sucesso:', userCredential.user);
    return userCredential.user;
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    throw new Error(error.message || 'Erro ao criar usuário');
  }
}

// Login
export async function login(email: string, password: string) {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login bem-sucedido:', userCredential.user);
    return userCredential.user;
  } catch (error: any) {
    console.error('Erro no login:', error);
    throw new Error(error.message || 'Erro ao fazer login');
  }
}

// Logout
export async function logout() {
  try {
    await signOut(auth);
    console.log('Logout realizado com sucesso');
    return { success: true };
  } catch (error: any) {
    console.error('Erro no logout:', error);
    throw new Error(error.message || 'Erro ao fazer logout');
  }
}

// Obter usuário atual
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Listener para mudanças de autenticação
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Verificar se está autenticado
export function isAuthenticated(): boolean {
  return !!auth.currentUser;
} 