
import { sendEmail } from "@/services/email";
import type { Course, PermissionCategory } from "./definitions";


export type Enrollment = {
    courseId: string;
    instructorId: string | null; // The instructor at the time of completion
    status: 'Não Iniciado' | 'Em Progresso' | 'Concluído';
    grade: number | null;
    approved: boolean | null;
    completionDate: Date | null;
    verificationCode: string | null;
};

export type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    profile: Role['name'];
    companyId: string;
    status: 'Ativo' | 'Inativo';
    hint: string;
    enrollments: Enrollment[];
};

export type Company = {
    id: string;
    name: string;
    contact: string;
    status: 'Ativa' | 'Inativa';
};

export type Instructor = {
    id: string;
    name: string;
    email: string;
    specialization: string;
    avatar: string;
    hint: string;
};

export type ScheduledClass = {
  id: string;
  courseId: string;
  instructorId: string;
  studentIds: string[];
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  locationType: 'Presencial' | 'Online';
  location: string;
  status: 'Agendada' | 'Concluída';
};

export type CertificateCustomText = {
  id: string;
  text: string;
  page: 1 | 2;
  top: number;
  left: number;
  size: number;
};

type CertificateElementConfig = {
    text: string;
    top: number;
    left: number;
    size: number;
    classes: string;
};

export type CertificateSettings = {
    header: CertificateElementConfig;
    body: CertificateElementConfig;
    courseName: Omit<CertificateElementConfig, 'text'>;
    studentName: Omit<CertificateElementConfig, 'text'>;
    instructorName: Omit<CertificateElementConfig, 'text'> & { showUnderline: boolean };
    instructorTitle: CertificateElementConfig;
    issueDate: CertificateElementConfig;
    verificationCode: CertificateElementConfig;
    qrCode: {
        enabled: boolean;
        baseUrl: string;
        top: number;
        left: number;
        size: number;
    };
    syllabusTitle: CertificateElementConfig;
    page1Background?: string;
    page2Background?: string;
    customTexts?: CertificateCustomText[];
};


export type NotificationTemplate = {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    subject: string;
    content: string;
};

export type NotificationSettings = {
    enabled: boolean;
    templates: NotificationTemplate[];
};

export type Permission = {
  id: string;
  label: string;
};

export type Role = {
  name: 'Administrador' | 'Instrutor' | 'Aluno' | 'Gestor de Empresa' | string;
  description: string;
  permissions: string[];
};

export type LoginLog = {
    id: string;
    userId: string;
    userName: string;
    companyName: string;
    timestamp: Date;
};

export type NotificationLog = {
    id: string;
    type: string;
    recipient: string;
    timestamp: Date;
    status: 'Sucesso' | 'Falha';
};


export let companies: Company[] = [
    { id: 'C001', name: 'Offshore Solutions Inc.', contact: 'contact@offshore.com', status: 'Ativa' },
    { id: 'C002', name: 'Maritime Catering Services', contact: 'services@maritimecatering.com', status: 'Ativa' },
    { id: 'C003', name: 'Sea Gold Logistics', contact: 'main@sgoldlog.com', status: 'Inativa' },
];

export let courses: Course[] = [
  {
    id: '1',
    title: 'Catering Offshore Avançado',
    description: 'Aprenda técnicas avançadas de catering para ambientes offshore, focando em segurança e qualidade.',
    image: 'https://placehold.co/600x400.png',
    hint: 'food catering',
    instructorId: 'I003',
    feedback: [
      "O conteúdo foi ótimo, mas gostaria de mais exemplos práticos.",
      "O instrutor é excelente, muito conhecimento na área."
    ],
    syllabus: [
        "Gestão Avançada de Estoques em Alto Mar",
        "Técnicas de Culinária para Preservação de Nutrientes",
        "Segurança Alimentar em Condições Extremas",
        "Planejamento de Cardápios para Longos Períodos",
        "Logística e Abastecimento Offshore"
    ]
  },
  {
    id: '2',
    title: 'Higiene Alimentar Básica',
    description: 'Curso essencial sobre práticas de higiene para manipulação de alimentos em qualquer ambiente.',
    image: 'https://placehold.co/600x400.png',
    hint: 'kitchen hygiene',
    instructorId: 'I001',
    feedback: [],
    syllabus: [
        "Introdução à Microbiologia dos Alimentos",
        "Técnicas de Lavagem de Mãos e Higienização",
        "Controle de Temperaturas (Quente e Frio)",
        "Prevenção de Contaminação Cruzada",
        "Legislação Sanitária Aplicada"
    ]
  },
  {
    id: '3',
    title: 'Procedimentos de Segurança na Cozinha',
    description: 'Domine os procedimentos de segurança para prevenir acidentes e garantir um ambiente de trabalho seguro.',
    image: 'https://placehold.co/600x400.png',
    hint: 'kitchen safety',
    instructorId: 'I001',
    feedback: ["Essencial para a nossa operação, muito bem explicado."],
    syllabus: [
        "Prevenção de Cortes e Queimaduras",
        "Uso Correto de Equipamentos de Proteção Individual (EPIs)",
        "Procedimentos em Caso de Vazamento de Gás",
        "Primeiros Socorros Básicos na Cozinha",
        "Manuseio Seguro de Produtos Químicos de Limpeza"
    ]
  },
  {
    id: '4',
    title: 'Nutrição para Ambientes Remotos',
    description: 'Foco em planejamento nutricional para equipes em locais remotos, garantindo saúde e bem-estar.',
    image: 'https://placehold.co/600x400.png',
    hint: 'healthy nutrition',
    instructorId: 'I002',
    feedback: [],
    syllabus: [
        "Fundamentos da Nutrição Humana",
        "Cálculo de Necessidades Calóricas e de Macronutrientes",
        "Vitaminas e Minerais Essenciais",
        "Hidratação e Desempenho",
        "Adaptação de Dietas para Condições Específicas"
    ]
  },
  {
    id: '5',
    title: 'Gerenciamento de Alergênicos',
    description: 'Aprenda a identificar e gerenciar alergênicos para garantir a segurança alimentar de todos.',
    image: 'https://placehold.co/600x400.png',
    hint: 'food allergens',
    feedback: [],
    syllabus: [
        "Principais Tipos de Alergênicos Alimentares",
        "Rotulagem e Identificação de Alergênicos",
        "Procedimentos para Evitar Contaminação na Cozinha",
        "Como Agir em Caso de Reação Alérgica",
        "Comunicação com o Cliente sobre Alergias"
    ]
  },
  {
    id: '6',
    title: 'Combate a Incêndio Avançado',
    description: 'Treinamento prático e teórico sobre técnicas avançadas de combate a incêndios em cozinhas.',
    image: 'https://placehold.co/600x400.png',
    hint: 'firefighting training',
    feedback: [],
    syllabus: [
        "Classes de Fogo e Agentes Extintores",
        "Uso de Extintores de Incêndio (CO2, Pó Químico)",
        "Sistemas de Supressão de Incêndio em Cozinhas (Saponificantes)",
        "Técnicas de Evacuação e Ponto de Encontro",
        "Manutenção Preventiva de Equipamentos"
    ]
  },
];

export let users: User[] = [
  {
    id: 'U000',
    name: 'Usuário Admin',
    email: 'admin@offshore.com',
    role: 'Administrador do Sistema',
    avatar: 'https://placehold.co/40x40.png',
    profile: 'Administrador',
    companyId: 'C001',
    status: 'Ativo',
    hint: 'admin user face',
    enrollments: []
  },
  {
    id: 'U001',
    name: 'Eduardo Beckman',
    email: 'ehbeckman@gmail.com',
    role: 'Administrador do Sistema',
    avatar: 'https://placehold.co/40x40.png',
    profile: 'Administrador',
    companyId: 'C001',
    status: 'Ativo',
    hint: 'admin user face',
    enrollments: []
  },
  {
    id: 'P001',
    name: 'Ana Silva',
    email: 'ana.silva@offshore.com',
    role: 'Comissária de Bordo',
    avatar: 'https://placehold.co/40x40.png',
    profile: 'Aluno',
    companyId: 'C001',
    status: 'Ativo',
    hint: 'woman face',
    enrollments: [
      { courseId: '2', status: 'Concluído', grade: 9, approved: true, completionDate: new Date(), verificationCode: 'CERT-P001-2', instructorId: 'I001' },
      { courseId: '3', status: 'Concluído', grade: 9.5, approved: true, completionDate: new Date(), verificationCode: 'CERT-P001-3', instructorId: 'I001' },
    ],
  },
  {
    id: 'P002',
    name: 'Bruno Costa',
    email: 'bruno.costa@maritime.com',
    role: 'Cozinheiro Offshore',
    avatar: 'https://placehold.co/40x40.png',
    profile: 'Aluno',
    companyId: 'C002',
    status: 'Ativo',
    hint: 'man face',
    enrollments: [
      { courseId: '4', status: 'Concluído', grade: 10, approved: true, completionDate: new Date(), verificationCode: 'CERT-P002-4', instructorId: 'I002' },
      { courseId: '5', status: 'Concluído', grade: 9.2, approved: true, completionDate: new Date(), verificationCode: 'CERT-P002-5', instructorId: null },
      { courseId: '1', status: 'Em Progresso', grade: null, approved: null, completionDate: null, verificationCode: null, instructorId: null },
    ],
  },
  {
    id: 'P003',
    name: 'Carla Dias',
    email: 'carla.dias@offshore.com',
    role: 'Saloneira',
    avatar: 'https://placehold.co/40x40.png',
    profile: 'Aluno',
    companyId: 'C001',
    status: 'Inativo',
    hint: 'woman face',
    enrollments: [
      { courseId: '2', status: 'Concluído', grade: 8, approved: true, completionDate: new Date(), verificationCode: 'CERT-P003-2', instructorId: 'I001' },
    ],
  },
  {
    id: 'P004',
    name: 'Daniel Martins',
    email: 'daniel.martins@sgoldlog.com',
    role: 'Gerente de Operações',
    avatar: 'https://placehold.co/40x40.png',
    profile: 'Gestor de Empresa',
    companyId: 'C003',
    status: 'Ativo',
    hint: 'man face',
    enrollments: [
      { courseId: '1', status: 'Concluído', grade: 9.5, approved: true, completionDate: new Date(), verificationCode: 'CERT-P004-1', instructorId: 'I003' },
      { courseId: '5', status: 'Concluído', grade: 9, approved: true, completionDate: new Date(), verificationCode: 'CERT-P004-5', instructorId: null },
      { courseId: '2', status: 'Concluído', grade: 8.5, approved: true, completionDate: new Date(), verificationCode: 'CERT-P004-2', instructorId: 'I001' },
    ],
  },
  {
    id: 'P005',
    name: 'Eduarda Lima',
    email: 'eduarda.lima@maritime.com',
    role: 'Nutricionista',
    avatar: 'https://placehold.co/40x40.png',
    profile: 'Aluno',
    companyId: 'C002',
    status: 'Ativo',
    hint: 'woman face',
    enrollments: [
      { courseId: '3', status: 'Não Iniciado', grade: null, approved: null, completionDate: null, verificationCode: null, instructorId: null },
      { courseId: '2', status: 'Concluído', grade: 9.8, approved: true, completionDate: new Date(), verificationCode: 'CERT-P005-2', instructorId: 'I001' },
      { courseId: '6', status: 'Concluído', grade: 9.1, approved: true, completionDate: new Date(), verificationCode: 'CERT-P005-6', instructorId: null },
    ],
  },
  {
    id: 'I001', name: 'Roberto Firmino', email: 'roberto.f@example.com', role: 'Instrutor Chefe',
    profile: 'Instrutor', companyId: 'C001', status: 'Ativo', hint: 'man face portrait',
    avatar: 'https://placehold.co/40x40.png', enrollments: []
  },
  {
    id: 'I002', name: 'Juliana Paes', email: 'juliana.p@example.com', role: 'Instrutora de Nutrição',
    profile: 'Instrutor', companyId: 'C001', status: 'Ativo', hint: 'woman face portrait',
    avatar: 'https://placehold.co/40x40.png', enrollments: []
  },
  {
    id: 'I003', name: 'Marcos Oliveira', email: 'marcos.o@example.com', role: 'Instrutor de Gastronomia',
    profile: 'Instrutor', companyId: 'C001', status: 'Ativo', hint: 'man face portrait',
    avatar: 'https://placehold.co/40x40.png', enrollments: []
  },
];

export let instructors: Instructor[] = [
    { id: 'I001', name: 'Roberto Firmino', email: 'roberto.f@example.com', specialization: 'Segurança Alimentar', avatar: 'https://placehold.co/40x40.png', hint: 'man face portrait' },
    { id: 'I002', name: 'Juliana Paes', email: 'juliana.p@example.com', specialization: 'Nutrição Avançada', avatar: 'https://placehold.co/40x40.png', hint: 'woman face portrait' },
    { id: 'I003', name: 'Marcos Oliveira', email: 'marcos.o@example.com', specialization: 'Culinária Internacional', avatar: 'https://placehold.co/40x40.png', hint: 'man face portrait' },
];

export let scheduledClasses: ScheduledClass[] = [
    {
        id: 'SC001',
        courseId: '1',
        instructorId: 'I003',
        studentIds: ['P002', 'P004'],
        scheduledDate: new Date(new Date().setDate(new Date().getDate() + 10)),
        startTime: '09:00',
        endTime: '17:00',
        locationType: 'Presencial',
        location: 'Centro de Treinamento Offshore - Macaé, RJ',
        status: 'Agendada'
    },
    {
        id: 'SC002',
        courseId: '2',
        instructorId: 'I001',
        studentIds: ['P001', 'P003', 'P005'],
        scheduledDate: new Date(new Date().setDate(new Date().getDate() + 15)),
        startTime: '08:30',
        endTime: '12:30',
        locationType: 'Online',
        location: 'https://meet.google.com/xyz-abc-def',
        status: 'Agendada'
    },
];

export let certificateSettings: CertificateSettings = {
    page1Background: '',
    page2Background: '',
    header: { text: 'Certificamos que', top: 25, left: 35, size: 18, classes: 'text-muted-foreground' },
    studentName: { top: 35, left: 25, size: 52, classes: 'font-bold font-headline text-primary', },
    body: { text: 'concluiu com sucesso o curso de', top: 50, left: 32, size: 18, classes: 'text-muted-foreground' },
    courseName: { top: 58, left: 35, size: 32, classes: 'font-semibold' },
    instructorName: { top: 82, left: 10, size: 14, classes: 'text-center', showUnderline: true },
    instructorTitle: { text: 'Instrutor(a)', top: 88, left: 14, size: 14, classes: 'font-semibold' },
    issueDate: { text: 'Concluído em', top: 84, left: 75, size: 14, classes: 'font-semibold' },
    verificationCode: { text: 'Código de Verificação:', top: 82, left: 40, size: 12, classes: 'font-mono' },
    qrCode: { enabled: true, baseUrl: 'http://localhost:9009/verificar', top: 78, left: 45, size: 80 },
    syllabusTitle: { text: 'Conteúdo Programático', top: 10, left: 10, size: 32, classes: 'text-3xl font-headline font-bold' },
    customTexts: [],
};


export let notificationSettings: NotificationSettings = {
    enabled: true,
    templates: [
        {
            id: 'user-signup',
            name: 'Cadastro de Novo Usuário',
            description: 'Enviado quando um novo usuário se cadastra na plataforma.',
            enabled: true,
            subject: 'Bem-vindo à Seanutri, {{nome_aluno}}!',
            content: 'Olá {{nome_aluno}},\n\nSua conta na plataforma Seanutri foi criada com sucesso. Bem-vindo a bordo!\n\nAtenciosamente,\nEquipe Seanutri'
        },
        {
            id: 'course-enrollment',
            name: 'Matrícula em Curso',
            description: 'Enviado quando um usuário é matriculado em um curso.',
            enabled: true,
            subject: 'Você foi matriculado no curso {{nome_curso}}',
            content: 'Olá {{nome_aluno}},\n\nVocê foi matriculado(a) com sucesso no curso "{{nome_curso}}".\n\nDetalhes do curso:\n- Nome: {{nome_curso}}\n- Local: {{local}}\n- Data: {{data}}\n- Horário: {{hora}}\n\nAcesse a plataforma para começar seu treinamento.\n\nAtenciosamente,\nEquipe Seanutri'
        },
        {
            id: 'course-reminder',
            name: 'Aviso de Início de Curso',
            description: 'Enviado X dias antes do início de uma turma agendada.',
            enabled: false,
            subject: 'Lembrete: Seu curso {{nome_curso}} começa em breve!',
            content: 'Olá {{nome_aluno}},\n\nEste é um lembrete de que sua turma para o curso "{{nome_curso}}" está agendada para começar em breve.\n\nNão se esqueça!\n\nAtenciosamente,\nEquipe Seanutri'
        },
        {
            id: 'result-approved',
            name: 'Resultado de Aprovação',
            description: 'Enviado quando um aluno é aprovado em um curso.',
            enabled: true,
            subject: 'Parabéns! Você foi aprovado no curso {{nome_curso}}',
            content: 'Olá {{nome_aluno}},\n\nParabéns! Temos o prazer de informar que você foi aprovado(a) no curso "{{nome_curso}}".\n\nDetalhes do resultado:\n- Curso: {{nome_curso}}\n- Local: {{local}}\n- Data: {{data}}\n- Horário: {{hora}}\n- Nota: {{nota}}\n- Status: {{status}}\n\nSeu certificado já está disponível. Clique no link abaixo para baixá-lo:\n{{link_certificado}}\n\nAtenciosamente,\nEquipe Seanutri'
        },
        {
            id: 'result-failed',
            name: 'Resultado de Reprovação',
            description: 'Enviado quando um aluno é reprovado em um curso.',
            enabled: true,
            subject: 'Resultado do curso {{nome_curso}}',
            content: 'Olá {{nome_aluno}},\n\nInformamos que seu resultado para o curso "{{nome_curso}}" foi "Reprovado".\n\nDetalhes do resultado:\n- Curso: {{nome_curso}}\n- Local: {{local}}\n- Data: {{data}}\n- Horário: {{hora}}\n- Nota: {{nota}}\n- Status: {{status}}\n\nEntre em contato com seu gestor para mais informações sobre os próximos passos.\n\nAtenciosamente,\nEquipe Seanutri'
        }
    ]
};

export const allPermissions: PermissionCategory[] = [
    {
        id: 'dashboard',
        label: 'Painel Principal (Dashboard)',
        permissions: [{ id: 'dashboard:view', label: 'Visualizar Dashboard' }],
        note: 'Permite o acesso à página principal após o login.'
    },
    {
        id: 'scheduling',
        label: 'Agendamentos e Calendário',
        permissions: [
            { id: 'scheduling:view', label: 'Visualizar Agendamentos e Calendário' },
            { id: 'scheduling:create', label: 'Criar e Editar Agendamentos' },
            { id: 'scheduling:delete', label: 'Excluir Agendamentos' },
        ],
    },
    {
        id: 'history',
        label: 'Histórico',
        permissions: [{ id: 'history:view', label: 'Visualizar Histórico de Conclusão' }],
        note: 'Para Alunos e Gestores, a visualização é restrita aos seus próprios dados ou aos dados de sua empresa, respectivamente.'
    },
    {
        id: 'reports',
        label: 'Relatórios',
        permissions: [{ id: 'reports:view', label: 'Visualizar e Exportar Relatórios' }],
    },
    {
        id: 'database',
        label: 'Banco de Dados',
        isSubcategory: true,
        subcategories: [
            {
                id: 'db_courses',
                label: 'Cursos',
                permissions: [
                    { id: 'db_courses:view', label: 'Ver' },
                    { id: 'db_courses:create', label: 'Criar' },
                    { id: 'db_courses:update', label: 'Editar' },
                    { id: 'db_courses:delete', label: 'Excluir' },
                ]
            },
            {
                id: 'db_companies',
                label: 'Empresas',
                permissions: [
                    { id: 'db_companies:view', label: 'Ver' },
                    { id: 'db_companies:create', label: 'Criar' },
                    { id: 'db_companies:update', label: 'Editar' },
                    { id: 'db_companies:delete', label: 'Excluir' },
                ]
            },
             {
                id: 'db_users',
                label: 'Usuários',
                permissions: [
                    { id: 'db_users:view', label: 'Ver' },
                    { id: 'db_users:create', label: 'Criar' },
                    { id: 'db_users:update', label: 'Editar' },
                    { id: 'db_users:delete', label: 'Excluir' },
                ]
            },
             {
                id: 'db_instructors',
                label: 'Instrutores',
                permissions: [
                    { id: 'db_instructors:view', label: 'Ver' },
                    { id: 'db_instructors:create', label: 'Criar' },
                    { id: 'db_instructors:update', label: 'Editar' },
                    { id: 'db_instructors:delete', label: 'Excluir' },
                ]
            }
        ]
    },
    {
        id: 'settings',
        label: 'Configurações',
        permissions: [{ id: 'settings:manage', label: 'Gerenciar Configurações da Plataforma' }],
        note: 'Permite acesso a todas as abas da página de configurações, incluindo a gestão de perfis de acesso.'
    }
];

export let roles: Role[] = [
    { 
        name: 'Administrador', 
        description: 'Acesso total a todas as funcionalidades do sistema. Pode gerenciar todos os dados e configurações.',
        permissions: allPermissions.flatMap(p => p.permissions ? p.permissions.map(sp => sp.id) : (p.subcategories || []).flatMap(sc => sc.permissions?.map(ssp => ssp.id) || []))
    },
    { 
        name: 'Instrutor', 
        description: 'Pode gerenciar e visualizar os cursos que ministra, além de avaliar os alunos.',
        permissions: ['dashboard:view', 'db_courses:view', 'db_courses:update']
    },
    {
        name: 'Aluno',
        description: 'Pode visualizar o dashboard, seus cursos e seu histórico. A visualização de dados é sempre restrita a si mesmo.',
        permissions: ['dashboard:view', 'history:view', 'db_courses:view']
    },
    {
        name: 'Gestor de Empresa',
        description: 'Pode visualizar o dashboard e relatórios, com dados restritos aos usuários de sua própria empresa.',
        permissions: ['dashboard:view', 'history:view', 'reports:view']
    }
];

export let loginLog: LoginLog[] = [
    { id: 'LL001', userId: 'U000', userName: 'Usuário Admin', companyName: 'Offshore Solutions Inc.', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: 'LL002', userId: 'I001', userName: 'Roberto Firmino', companyName: 'Offshore Solutions Inc.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: 'LL003', userId: 'P002', userName: 'Bruno Costa', companyName: 'Maritime Catering Services', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) },
];

export let notificationLog: NotificationLog[] = [
    { id: 'NL001', type: 'Resultado de Aprovação', recipient: 'ana.silva@offshore.com', timestamp: new Date(Date.now() - 1000 * 60 * 15), status: 'Sucesso' },
    { id: 'NL002', type: 'Matrícula em Curso', recipient: 'bruno.costa@maritime.com', timestamp: new Date(Date.now() - 1000 * 60 * 45), status: 'Sucesso' },
    { id: 'NL003', type: 'Cadastro de Novo Usuário', recipient: 'john.doe@example.com', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), status: 'Falha' },
];

// --- Log Management ---
export function addLoginLog(userId: string) {
    const user = users.find(u => u.id === userId);
    const company = companies.find(c => c.id === user?.companyId);
    if(user && company) {
        loginLog.unshift({
            id: `LL${Date.now()}`,
            userId: user.id,
            userName: user.name,
            companyName: company.name,
            timestamp: new Date()
        });
    }
}

// --- Roles & Permissions ---
export function updateRoles(newRoles: Role[]) {
    roles = JSON.parse(JSON.stringify(newRoles));
    return roles;
}

export function addRole(newRole: Omit<Role, 'name'> & { name: Role['name'] }) {
    if (!roles.some(r => r.name === newRole.name)) {
        roles.push(newRole);
    }
    return roles;
}

export function updateRole(name: string, data: Partial<Omit<Role, 'name'>>) {
    const roleIndex = roles.findIndex(r => r.name === name);
    if (roleIndex !== -1) {
        roles[roleIndex] = { ...roles[roleIndex], ...data };
    }
    return roles;
}


// --- Notification Settings ---
export function updateNotificationSettings(newSettings: NotificationSettings) {
    notificationSettings = { ...notificationSettings, ...newSettings };
    return notificationSettings;
}

// --- Certificate Settings ---
export function updateCertificateSettings(newSettings: Partial<CertificateSettings>) {
    certificateSettings = { ...certificateSettings, ...newSettings };
    return certificateSettings;
}

// --- Course Management ---
export function addCourse(courseData: Omit<Course, 'id' | 'feedback' | 'syllabus'>) {
    const newCourse: Course = {
        id: `C${Date.now()}`,
        feedback: [],
        syllabus: [],
        ...courseData,
    };
    courses.unshift(newCourse);
    return newCourse;
}

export function updateCourse(id: string, data: Partial<Omit<Course, 'id'>>) {
    const courseIndex = courses.findIndex(c => c.id === id);
    if (courseIndex !== -1) {
        courses[courseIndex] = { ...courses[courseIndex], ...data };
        return courses[courseIndex];
    }
    return undefined;
}

export function deleteCourse(id: string) {
    courses = courses.filter(c => c.id !== id);
}


// --- User Management ---
type UserData = Omit<User, 'id' | 'hint' | 'enrollments'>;

export function addUser(data: UserData & { avatar?: string | null }) {
    const newUser: User = {
        id: `U${Date.now()}`,
        avatar: data.avatar || 'https://placehold.co/40x40.png',
        hint: 'person face',
        enrollments: [],
        name: data.name,
        email: data.email,
        role: data.role,
        profile: data.profile,
        companyId: data.companyId,
        status: data.status,
    };
    users.unshift(newUser);
    return newUser;
}

export function updateUser(id: string, data: Partial<Omit<User, 'id' | 'hint' | 'enrollments'>>) {
    const userIndex = users.findIndex(p => p.id === id);
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...data };
        return users[userIndex];
    }
    return undefined;
}

export function deleteUser(id: string) {
    users = users.filter(p => p.id !== id);
}

// --- Company Management ---
type CompanyData = Omit<Company, 'id'>;

export function addCompany(data: CompanyData) {
    const newCompany: Company = {
        id: `COM${Date.now()}`,
        ...data,
    };
    companies.unshift(newCompany);
    return newCompany;
}

export function updateCompany(id: string, data: Partial<CompanyData>) {
    const companyIndex = companies.findIndex(c => c.id === id);
    if (companyIndex !== -1) {
        companies[companyIndex] = { ...companies[companyIndex], ...data };
        return companies[companyIndex];
    }
    return undefined;
}

export function deleteCompany(id: string) {
    companies = companies.filter(c => c.id !== id);
}

// --- Instructor Management ---
type InstructorData = Omit<Instructor, 'id' | 'avatar' | 'hint'>;

export function addInstructor(data: InstructorData) {
    const newInstructor: Instructor = {
        id: `I${Date.now()}`,
        avatar: 'https://placehold.co/40x40.png',
        hint: 'person face portrait',
        ...data,
    };
    instructors.unshift(newInstructor);
    return newInstructor;
}

export function updateInstructor(id: string, data: Partial<InstructorData>) {
    const instructorIndex = instructors.findIndex(i => i.id === id);
    if (instructorIndex !== -1) {
        instructors[instructorIndex] = { ...instructors[instructorIndex], ...data };
        return instructors[instructorIndex];
    }
    return undefined;
}

export function deleteInstructor(id: string) {
    instructors = instructors.filter(i => i.id !== id);
    // Also unassign this instructor from any courses
    courses.forEach(course => {
        if (course.instructorId === id) {
            course.instructorId = undefined;
        }
    });
}

// --- Scheduled Class (Turma) Management ---
type ScheduledClassData = Omit<ScheduledClass, 'id'>;

export function addScheduledClass(data: ScheduledClassData) {
    const newClass: ScheduledClass = {
        id: `SC${Date.now()}`,
        ...data,
        status: 'Agendada',
    };
    scheduledClasses.unshift(newClass);
    // Also update the individual user's enrollments status to 'In Progress'
    data.studentIds.forEach(userId => {
        enrollUser(userId, data.courseId);
    });
    return newClass;
}

export function updateScheduledClass(id: string, data: Partial<Omit<ScheduledClass, 'id'>>) {
    const classIndex = scheduledClasses.findIndex(sc => sc.id === id);
    if (classIndex !== -1) {
        const originalClass = scheduledClasses[classIndex];
        const updatedClass = { ...originalClass, ...data };
        
        // Handle student ID updates correctly
        if (data.studentIds) {
            const newStudentIds = Array.from(new Set(data.studentIds));
            updatedClass.studentIds = newStudentIds;
            newStudentIds.forEach(studentId => {
                enrollUser(studentId, updatedClass.courseId);
            });
        }
        
        scheduledClasses[classIndex] = updatedClass;
        return scheduledClasses[classIndex];
    }
    return undefined;
}


export function deleteScheduledClass(id: string) {
    scheduledClasses = scheduledClasses.filter(sc => sc.id !== id);
}


// --- Enrollment and Evaluation ---
export function enrollUser(userId: string, courseId: string) {
    const user = users.find(u => u.id === userId);
    const course = courses.find(c => c.id === courseId);
    if (user) {
        const existingEnrollment = user.enrollments.find(e => e.courseId === courseId)
        if (existingEnrollment) {
             if(existingEnrollment.status === 'Não Iniciado') {
                existingEnrollment.status = 'Em Progresso';
             }
        } else {
             user.enrollments.push({
                courseId,
                status: 'Em Progresso',
                grade: null,
                approved: null,
                completionDate: null,
                verificationCode: null,
                instructorId: course?.instructorId ?? null,
            });
        }
    }
}


export function updateEvaluation(userId: string, courseId: string, data: { grade: number, approved: boolean, completionDate: Date }) {
    const user = users.find(p => p.id === userId);
    if (user) {
        const enrollment = user.enrollments.find(e => e.courseId === courseId);
        const course = courses.find(c => c.id === courseId);
        if (enrollment) {
            enrollment.grade = data.grade;
            enrollment.approved = data.approved;
            enrollment.status = 'Concluído';
            if (data.approved) {
              enrollment.completionDate = data.completionDate;
              enrollment.verificationCode = `CERT-${userId}-${courseId}`;
              enrollment.instructorId = course?.instructorId ?? null;
            } else {
              enrollment.completionDate = null;
              enrollment.verificationCode = null;
            }
        }
    }
}
