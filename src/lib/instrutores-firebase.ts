import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase.config';

export interface Instructor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  status: 'Ativo' | 'Inativo';
  createdAt: Date;
  updatedAt: Date;
}

export async function getInstrutores(): Promise<Instructor[]> {
  try {
    const instrutoresRef = collection(db, 'instrutores');
    const q = query(instrutoresRef, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const instrutores: Instructor[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      instrutores.push({
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        specialization: data.specialization || '',
        avatar: data.avatar || 'https://placehold.co/40x40.png',
        phone: data.phone,
        bio: data.bio,
        status: data.status || 'Ativo',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return instrutores;
  } catch (error) {
    console.error('Erro ao buscar instrutores:', error);
    throw new Error('Falha ao buscar instrutores');
  }
}

export async function getInstrutorById(id: string): Promise<Instructor | null> {
  try {
    const instrutorRef = doc(db, 'instrutores', id);
    const instrutorSnap = await getDoc(instrutorRef);
    
    if (instrutorSnap.exists()) {
      const data = instrutorSnap.data();
      return {
        id: instrutorSnap.id,
        name: data.name || '',
        email: data.email || '',
        specialization: data.specialization || '',
        avatar: data.avatar || 'https://placehold.co/40x40.png',
        phone: data.phone,
        bio: data.bio,
        status: data.status || 'Ativo',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar instrutor:', error);
    throw new Error('Falha ao buscar instrutor');
  }
}

export async function addInstrutor(instrutorData: Omit<Instructor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Instructor> {
  try {
    const instrutoresRef = collection(db, 'instrutores');
    const docRef = await addDoc(instrutoresRef, {
      ...instrutorData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return {
      id: docRef.id,
      ...instrutorData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Erro ao adicionar instrutor:', error);
    throw new Error('Falha ao adicionar instrutor');
  }
}

export async function updateInstrutor(id: string, instrutorData: Partial<Instructor>): Promise<void> {
  try {
    const instrutorRef = doc(db, 'instrutores', id);
    await updateDoc(instrutorRef, {
      ...instrutorData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao atualizar instrutor:', error);
    throw new Error('Falha ao atualizar instrutor');
  }
}

export async function deleteInstrutor(id: string): Promise<void> {
  try {
    const instrutorRef = doc(db, 'instrutores', id);
    await deleteDoc(instrutorRef);
  } catch (error) {
    console.error('Erro ao deletar instrutor:', error);
    throw new Error('Falha ao deletar instrutor');
  }
}

export async function getInstrutoresAtivos(): Promise<Instructor[]> {
  try {
    const instrutoresRef = collection(db, 'instrutores');
    const q = query(instrutoresRef, where('status', '==', 'Ativo'), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const instrutores: Instructor[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      instrutores.push({
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        specialization: data.specialization || '',
        avatar: data.avatar || 'https://placehold.co/40x40.png',
        phone: data.phone,
        bio: data.bio,
        status: data.status || 'Ativo',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return instrutores;
  } catch (error) {
    console.error('Erro ao buscar instrutores ativos:', error);
    throw new Error('Falha ao buscar instrutores ativos');
  }
}

export async function getInstrutoresPorEspecializacao(especializacao: string): Promise<Instructor[]> {
  try {
    const instrutoresRef = collection(db, 'instrutores');
    const q = query(
      instrutoresRef, 
      where('specialization', '==', especializacao),
      where('status', '==', 'Ativo'),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const instrutores: Instructor[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      instrutores.push({
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        specialization: data.specialization || '',
        avatar: data.avatar || 'https://placehold.co/40x40.png',
        phone: data.phone,
        bio: data.bio,
        status: data.status || 'Ativo',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return instrutores;
  } catch (error) {
    console.error('Erro ao buscar instrutores por especialização:', error);
    throw new Error('Falha ao buscar instrutores por especialização');
  }
} 