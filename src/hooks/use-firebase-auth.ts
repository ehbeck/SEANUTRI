import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  updateEmail,
  deleteUser,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase.config';
import { addLoginLog } from '@/lib/firebase-db';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Buscar dados do usuário no Firestore
        let userData = await getUserFromFirestore(firebaseUser.uid);
        
        // Se o usuário não existe no Firestore, criar automaticamente
        if (!userData) {
          console.log('Usuário não encontrado no Firestore (onAuthStateChanged), criando registro...');
          const newUserData = {
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
            role: 'user',
            companyId: '',
            phone: '',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
          
          userData = {
            id: firebaseUser.uid,
            ...newUserData,
          };
          
          console.log('Registro criado com sucesso (onAuthStateChanged):', userData);
        }
        
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Buscar usuário do Firestore
  const getUserFromFirestore = async (uid: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: uid,
          email: data.email,
          name: data.name,
          role: data.role || 'user',
          companyId: data.companyId,
          phone: data.phone,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar usuário do Firestore:', error);
      return null;
    }
  };

  // Login
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Buscar dados completos do usuário no Firestore
      let userData = await getUserFromFirestore(firebaseUser.uid);
      
      // Se o usuário não existe no Firestore, criar automaticamente
      if (!userData) {
        console.log('Usuário não encontrado no Firestore, criando registro...');
        const newUserData = {
          email: firebaseUser.email || email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          role: 'user',
          companyId: '',
          phone: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
        
        userData = {
          id: firebaseUser.uid,
          ...newUserData,
        };
        
        console.log('Registro criado com sucesso:', userData);
      }
      
      setUser(userData);
      
      // Registrar log de login
      try {
        await addLoginLog(
          userData.id,
          userData.name,
          userData.companyId || 'N/A'
        );
      } catch (error) {
        console.error('Erro ao registrar log de login:', error);
        // Não falhar o login se o log falhar
      }
      
      return userData;
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  // Cadastro com sincronização automática
  const signup = async (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    try {
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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

      await setDoc(doc(db, 'users', firebaseUser.uid), userToSave);

      // 4. Retornar usuário completo
      const completeUser: User = {
        id: firebaseUser.uid,
        ...userToSave,
      };

      setUser(completeUser);
      return completeUser;
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      throw new Error(error.message || 'Erro ao criar conta');
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error('Erro no logout:', error);
      throw new Error(error.message || 'Erro ao fazer logout');
    }
  };

  // Atualizar perfil com sincronização
  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('Usuário não autenticado');

      // 1. Atualizar no Firebase Auth se o email mudou
      if (updates.email && updates.email !== user.email) {
        await updateEmail(firebaseUser, updates.email);
      }

      // 2. Atualizar perfil no Auth se o nome mudou
      if (updates.name && updates.name !== user.name) {
        await updateProfile(firebaseUser, {
          displayName: updates.name
        });
      }

      // 3. Atualizar no Firestore
      await updateDoc(doc(db, 'users', user.id), {
        ...updates,
        updatedAt: new Date(),
      });

      // 4. Atualizar estado local
      setUser({
        ...user,
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error(error.message || 'Erro ao atualizar perfil');
    }
  };

  // Deletar usuário com sincronização
  const deleteUserAccount = async (): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('Usuário não autenticado');

      // 1. Deletar do Firestore
      await deleteDoc(doc(db, 'users', user.id));

      // 2. Deletar do Firebase Auth
      await deleteUser(firebaseUser);

      // 3. Limpar estado local
      setUser(null);
    } catch (error: any) {
      console.error('Erro ao deletar conta:', error);
      throw new Error(error.message || 'Erro ao deletar conta');
    }
  };

  // Resetar senha
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Email de reset de senha enviado para:', email);
    } catch (error: any) {
      console.error('Erro ao enviar email de reset de senha:', error);
      throw new Error(error.message || 'Erro ao enviar email de reset de senha');
    }
  };

  return {
    user,
    loading,
    login,
    signup,
    logout,
    updateUserProfile,
    deleteUserAccount,
    resetPassword,
    isAuthenticated: !!user,
  };
} 