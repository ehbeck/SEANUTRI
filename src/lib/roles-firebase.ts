import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase.config';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getRoles(): Promise<Role[]> {
  try {
    const rolesRef = collection(db, 'roles');
    const q = query(rolesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const roles: Role[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      roles.push({
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        permissions: data.permissions || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return roles;
  } catch (error) {
    console.error('Erro ao buscar roles:', error);
    throw new Error('Falha ao buscar roles');
  }
}

export async function getRole(id: string): Promise<Role | null> {
  try {
    const roleDoc = await getDoc(doc(db, 'roles', id));
    if (roleDoc.exists()) {
      const data = roleDoc.data();
      return {
        id: roleDoc.id,
        name: data.name || '',
        description: data.description || '',
        permissions: data.permissions || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar role:', error);
    throw new Error('Falha ao buscar role');
  }
}

export async function addRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
  try {
    const rolesRef = collection(db, 'roles');
    const newRole = {
      ...roleData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await addDoc(rolesRef, newRole);
    
    return {
      id: docRef.id,
      ...newRole,
    };
  } catch (error) {
    console.error('Erro ao adicionar role:', error);
    throw new Error('Falha ao adicionar role');
  }
}

export async function updateRole(id: string, roleData: Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Role> {
  try {
    const roleRef = doc(db, 'roles', id);
    const updateData = {
      ...roleData,
      updatedAt: new Date(),
    };
    
    await updateDoc(roleRef, updateData);
    
    const updatedRole = await getRole(id);
    if (!updatedRole) {
      throw new Error('Role não encontrada após atualização');
    }
    
    return updatedRole;
  } catch (error) {
    console.error('Erro ao atualizar role:', error);
    throw new Error('Falha ao atualizar role');
  }
}

export async function deleteRole(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'roles', id));
  } catch (error) {
    console.error('Erro ao deletar role:', error);
    throw new Error('Falha ao deletar role');
  }
}

export async function getRoleByName(name: string): Promise<Role | null> {
  try {
    const rolesRef = collection(db, 'roles');
    const q = query(rolesRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        permissions: data.permissions || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar role por nome:', error);
    throw new Error('Falha ao buscar role por nome');
  }
}

// Função para inicializar roles padrão se não existirem
export async function initializeDefaultRoles(): Promise<void> {
  try {
    const existingRoles = await getRoles();
    
    const defaultRoles = [
      {
        name: 'Administrador',
        description: 'Acesso total a todas as funcionalidades do sistema. Pode gerenciar todos os dados e configurações.',
        permissions: ['*'] // Todas as permissões
      },
      {
        name: 'Instrutor',
        description: 'Pode gerenciar e visualizar os cursos que ministra, além de avaliar os alunos.',
        permissions: ['dashboard:view', 'courses:view', 'courses:edit', 'enrollments:view', 'enrollments:edit']
      },
      {
        name: 'Aluno',
        description: 'Pode visualizar o dashboard, seus cursos e seu histórico. A visualização de dados é sempre restrita a si mesmo.',
        permissions: ['dashboard:view', 'courses:view', 'enrollments:view']
      },
      {
        name: 'Gestor de Empresa',
        description: 'Pode visualizar o dashboard e relatórios, com dados restritos aos usuários de sua própria empresa.',
        permissions: ['dashboard:view', 'reports:view', 'users:view']
      }
    ];
    
    for (const defaultRole of defaultRoles) {
      const existingRole = existingRoles.find(r => r.name === defaultRole.name);
      if (!existingRole) {
        await addRole(defaultRole);
        console.log(`Role "${defaultRole.name}" criada`);
      }
    }
  } catch (error) {
    console.error('Erro ao inicializar roles padrão:', error);
    throw new Error('Falha ao inicializar roles padrão');
  }
} 