import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase.config';

export interface Empresa {
  id: string;
  name: string;
  contact: string; // Email de contato
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactPerson?: string;
  status: 'Ativa' | 'Inativa';
  createdAt: Date;
  updatedAt: Date;
}

export async function getEmpresas(): Promise<Empresa[]> {
  try {
    const empresasRef = collection(db, 'empresas');
    const q = query(empresasRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const empresas: Empresa[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      empresas.push({
        id: doc.id,
        name: data.name || '',
        contact: data.contact || '',
        cnpj: data.cnpj || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipCode || '',
        contactPerson: data.contactPerson || '',
        status: data.status || 'Ativa',
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return empresas;
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    throw new Error('Falha ao buscar empresas');
  }
}

export async function addEmpresa(empresaData: Omit<Empresa, 'id' | 'createdAt' | 'updatedAt'>): Promise<Empresa> {
  try {
    const empresasRef = collection(db, 'empresas');
    const docRef = await addDoc(empresasRef, {
      ...empresaData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return {
      id: docRef.id,
      ...empresaData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Erro ao adicionar empresa:', error);
    throw new Error('Falha ao adicionar empresa');
  }
}

export async function updateEmpresa(id: string, empresaData: Partial<Empresa>): Promise<void> {
  try {
    const empresaRef = doc(db, 'empresas', id);
    await updateDoc(empresaRef, {
      ...empresaData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    throw new Error('Falha ao atualizar empresa');
  }
}

export async function deleteEmpresa(id: string): Promise<void> {
  try {
    const empresaRef = doc(db, 'empresas', id);
    await deleteDoc(empresaRef);
  } catch (error) {
    console.error('Erro ao deletar empresa:', error);
    throw new Error('Falha ao deletar empresa');
  }
} 