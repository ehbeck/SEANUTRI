import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile, deleteUser as deleteAuthUser, updateEmail } from 'firebase/auth';
import { db, auth } from '@/lib/firebase.config';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profile: 'Administrador' | 'Instrutor' | 'Aluno' | 'Gestor de Empresa';
  companyId: string;
  status: 'Ativo' | 'Inativo';
  avatar?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role || '',
        profile: data.profile || 'Aluno',
        companyId: data.companyId || '',
        status: data.status || 'Ativo',
        avatar: data.avatar,
        phone: data.phone,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return users;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw new Error('Falha ao buscar usuários');
  }
}

export async function addUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, password: string = '123456'): Promise<User> {
  try {
    // 1. Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
    const firebaseUser = userCredential.user;

    // 2. Atualizar perfil no Auth
    await updateProfile(firebaseUser, {
      displayName: userData.name
    });

    // 3. Salvar dados completos no Firestore
    const userToSave = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await addDoc(collection(db, 'users'), userToSave);

    // 4. Retornar usuário completo
    const completeUser: User = {
      id: firebaseUser.uid,
      ...userToSave,
    };

    return completeUser;
  } catch (error: any) {
    console.error('Erro ao adicionar usuário:', error);
    throw new Error(error.message || 'Falha ao adicionar usuário');
  }
}

export async function updateUser(id: string, userData: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', id);
    
    // 1. Atualizar no Firestore
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date(),
    });

    // 2. Se o email ou nome mudou, atualizar no Auth (requer reautenticação)
    // Nota: Para mudanças de email/nome no Auth, o usuário precisa estar logado
    // ou usar Admin SDK. Por enquanto, apenas atualizamos no Firestore.
    
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    throw new Error(error.message || 'Falha ao atualizar usuário');
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    // 1. Deletar do Firestore
    const userRef = doc(db, 'users', id);
    await deleteDoc(userRef);

    // 2. Deletar do Firebase Auth (requer Admin SDK ou usuário logado)
    // Por enquanto, apenas deletamos do Firestore
    // Nota: Para deletar do Auth, seria necessário usar Admin SDK
    
  } catch (error: any) {
    console.error('Erro ao deletar usuário:', error);
    throw new Error(error.message || 'Falha ao deletar usuário');
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', id);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: userSnap.id,
        name: data?.name || '',
        email: data?.email || '',
        role: data?.role || '',
        profile: data?.profile || 'Aluno',
        companyId: data?.companyId || '',
        status: data?.status || 'Ativo',
        avatar: data?.avatar,
        phone: data?.phone,
        createdAt: data?.createdAt?.toDate() || new Date(),
        updatedAt: data?.updatedAt?.toDate() || new Date(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw new Error('Falha ao buscar usuário');
  }
}

export async function getUsersByCompany(companyId: string): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('companyId', '==', companyId), orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role || '',
        profile: data.profile || 'Aluno',
        companyId: data.companyId || '',
        status: data.status || 'Ativo',
        avatar: data.avatar,
        phone: data.phone,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return users;
  } catch (error) {
    console.error('Erro ao buscar usuários por empresa:', error);
    throw new Error('Falha ao buscar usuários por empresa');
  }
}

export async function getUsersByProfile(profile: string): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('profile', '==', profile), orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role || '',
        profile: data.profile || 'Aluno',
        companyId: data.companyId || '',
        status: data.status || 'Ativo',
        avatar: data.avatar,
        phone: data.phone,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return users;
  } catch (error) {
    console.error('Erro ao buscar usuários por perfil:', error);
    throw new Error('Falha ao buscar usuários por perfil');
  }
} 