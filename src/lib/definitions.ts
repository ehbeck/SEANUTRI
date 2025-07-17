
export type Enrollment = {
    courseId: string;
    instructorId: string | null;
    status: 'Não Iniciado' | 'Em Progresso' | 'Concluído';
    grade: number | null;
    approved: boolean | null;
    completionDate: Date | null;
    verificationCode: string | null;
};

export type Role = {
  name: 'Administrador' | 'Instrutor' | 'Aluno' | 'Gestor de Empresa' | string;
  description: string;
  permissions: string[];
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

export type Course = {
    id: string;
    title: string;
    description: string;
    image: string;
    hint: string;
    instructorId?: string;
    feedback?: string[];
    syllabus?: string[];
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

export type PermissionCategory = {
    id: string;
    label: string;
    permissions?: Permission[];
    note?: string;
    isSubcategory?: boolean;
    subcategories?: PermissionCategory[];
}

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
