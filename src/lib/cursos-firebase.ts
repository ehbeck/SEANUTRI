import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase.config';

export interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  duracao: number; // em horas
  preco: number;
  instrutorId: string;
  instrutorNome: string;
  empresaId?: string;
  categoria: string;
  nivel: 'Iniciante' | 'Intermediário' | 'Avançado';
  status: 'Ativo' | 'Inativo' | 'Em Desenvolvimento';
  imagem?: string;
  conteudo?: string;
  objetivos?: string[];
  preRequisitos?: string[];
  certificado?: boolean;
  vagas?: number;
  vagasDisponiveis?: number;
  dataInicio?: Date;
  dataFim?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function getCursos(): Promise<Curso[]> {
  try {
    const cursosRef = collection(db, 'cursos');
    const q = query(cursosRef, orderBy('titulo'));
    const querySnapshot = await getDocs(q);
    
    const cursos: Curso[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      cursos.push({
        id: doc.id,
        titulo: data.titulo || '',
        descricao: data.descricao || '',
        duracao: data.duracao || 0,
        preco: data.preco || 0,
        instrutorId: data.instrutorId || '',
        instrutorNome: data.instrutorNome || '',
        empresaId: data.empresaId,
        categoria: data.categoria || '',
        nivel: data.nivel || 'Iniciante',
        status: data.status || 'Ativo',
        imagem: data.imagem,
        conteudo: data.conteudo,
        objetivos: data.objetivos || [],
        preRequisitos: data.preRequisitos || [],
        certificado: data.certificado || false,
        vagas: data.vagas,
        vagasDisponiveis: data.vagasDisponiveis,
        dataInicio: data.dataInicio?.toDate(),
        dataFim: data.dataFim?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return cursos;
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    throw new Error('Falha ao buscar cursos');
  }
}

export async function getCursoById(id: string): Promise<Curso | null> {
  try {
    const cursoRef = doc(db, 'cursos', id);
    const cursoSnap = await getDoc(cursoRef);
    
    if (cursoSnap.exists()) {
      const data = cursoSnap.data();
      return {
        id: cursoSnap.id,
        titulo: data.titulo || '',
        descricao: data.descricao || '',
        duracao: data.duracao || 0,
        preco: data.preco || 0,
        instrutorId: data.instrutorId || '',
        instrutorNome: data.instrutorNome || '',
        empresaId: data.empresaId,
        categoria: data.categoria || '',
        nivel: data.nivel || 'Iniciante',
        status: data.status || 'Ativo',
        imagem: data.imagem,
        conteudo: data.conteudo,
        objetivos: data.objetivos || [],
        preRequisitos: data.preRequisitos || [],
        certificado: data.certificado || false,
        vagas: data.vagas,
        vagasDisponiveis: data.vagasDisponiveis,
        dataInicio: data.dataInicio?.toDate(),
        dataFim: data.dataFim?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar curso:', error);
    throw new Error('Falha ao buscar curso');
  }
}

export async function addCurso(cursoData: Omit<Curso, 'id' | 'createdAt' | 'updatedAt'>): Promise<Curso> {
  try {
    const cursosRef = collection(db, 'cursos');
    
    // Filtrar campos undefined para evitar erro do Firebase
    const dataToSave = Object.fromEntries(
      Object.entries(cursoData).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(cursosRef, {
      ...dataToSave,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return {
      id: docRef.id,
      ...cursoData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Erro ao adicionar curso:', error);
    throw new Error('Falha ao adicionar curso');
  }
}

export async function updateCurso(id: string, cursoData: Partial<Curso>): Promise<void> {
  try {
    const cursoRef = doc(db, 'cursos', id);
    
    // Filtrar campos undefined para evitar erro do Firebase
    const dataToSave = Object.fromEntries(
      Object.entries(cursoData).filter(([_, value]) => value !== undefined)
    );
    
    await updateDoc(cursoRef, {
      ...dataToSave,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erro ao atualizar curso:', error);
    throw new Error('Falha ao atualizar curso');
  }
}

export async function deleteCurso(id: string): Promise<void> {
  try {
    const cursoRef = doc(db, 'cursos', id);
    await deleteDoc(cursoRef);
  } catch (error) {
    console.error('Erro ao deletar curso:', error);
    throw new Error('Falha ao deletar curso');
  }
}

export async function getCursosByInstrutor(instrutorId: string): Promise<Curso[]> {
  try {
    const cursosRef = collection(db, 'cursos');
    const q = query(cursosRef, where('instrutorId', '==', instrutorId), orderBy('titulo'));
    const querySnapshot = await getDocs(q);
    
    const cursos: Curso[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      cursos.push({
        id: doc.id,
        titulo: data.titulo || '',
        descricao: data.descricao || '',
        duracao: data.duracao || 0,
        preco: data.preco || 0,
        instrutorId: data.instrutorId || '',
        instrutorNome: data.instrutorNome || '',
        empresaId: data.empresaId,
        categoria: data.categoria || '',
        nivel: data.nivel || 'Iniciante',
        status: data.status || 'Ativo',
        imagem: data.imagem,
        conteudo: data.conteudo,
        objetivos: data.objetivos || [],
        preRequisitos: data.preRequisitos || [],
        certificado: data.certificado || false,
        vagas: data.vagas,
        vagasDisponiveis: data.vagasDisponiveis,
        dataInicio: data.dataInicio?.toDate(),
        dataFim: data.dataFim?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return cursos;
  } catch (error) {
    console.error('Erro ao buscar cursos por instrutor:', error);
    throw new Error('Falha ao buscar cursos por instrutor');
  }
}

export async function getCursosByEmpresa(empresaId: string): Promise<Curso[]> {
  try {
    const cursosRef = collection(db, 'cursos');
    const q = query(cursosRef, where('empresaId', '==', empresaId), orderBy('titulo'));
    const querySnapshot = await getDocs(q);
    
    const cursos: Curso[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      cursos.push({
        id: doc.id,
        titulo: data.titulo || '',
        descricao: data.descricao || '',
        duracao: data.duracao || 0,
        preco: data.preco || 0,
        instrutorId: data.instrutorId || '',
        instrutorNome: data.instrutorNome || '',
        empresaId: data.empresaId,
        categoria: data.categoria || '',
        nivel: data.nivel || 'Iniciante',
        status: data.status || 'Ativo',
        imagem: data.imagem,
        conteudo: data.conteudo,
        objetivos: data.objetivos || [],
        preRequisitos: data.preRequisitos || [],
        certificado: data.certificado || false,
        vagas: data.vagas,
        vagasDisponiveis: data.vagasDisponiveis,
        dataInicio: data.dataInicio?.toDate(),
        dataFim: data.dataFim?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return cursos;
  } catch (error) {
    console.error('Erro ao buscar cursos por empresa:', error);
    throw new Error('Falha ao buscar cursos por empresa');
  }
}

export async function getCursosByStatus(status: string): Promise<Curso[]> {
  try {
    const cursosRef = collection(db, 'cursos');
    const q = query(cursosRef, where('status', '==', status), orderBy('titulo'));
    const querySnapshot = await getDocs(q);
    
    const cursos: Curso[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      cursos.push({
        id: doc.id,
        titulo: data.titulo || '',
        descricao: data.descricao || '',
        duracao: data.duracao || 0,
        preco: data.preco || 0,
        instrutorId: data.instrutorId || '',
        instrutorNome: data.instrutorNome || '',
        empresaId: data.empresaId,
        categoria: data.categoria || '',
        nivel: data.nivel || 'Iniciante',
        status: data.status || 'Ativo',
        imagem: data.imagem,
        conteudo: data.conteudo,
        objetivos: data.objetivos || [],
        preRequisitos: data.preRequisitos || [],
        certificado: data.certificado || false,
        vagas: data.vagas,
        vagasDisponiveis: data.vagasDisponiveis,
        dataInicio: data.dataInicio?.toDate(),
        dataFim: data.dataFim?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });
    
    return cursos;
  } catch (error) {
    console.error('Erro ao buscar cursos por status:', error);
    throw new Error('Falha ao buscar cursos por status');
  }
} 