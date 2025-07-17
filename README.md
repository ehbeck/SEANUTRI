# Sistema de Gestão de Cursos

Sistema completo de gestão de cursos com autenticação Firebase, agendamentos, certificados e relatórios.

## 🚀 Deploy

### Railway (Recomendado)

1. **Faça upload do arquivo .zip** no Railway
2. **Configure as variáveis de ambiente:**
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
   PORT=3000
   ```

3. **O Railway detectará automaticamente:**
   - Node.js 20
   - NPM como gerenciador de pacotes
   - Next.js como framework

### Variáveis de Ambiente Necessárias

Configure estas variáveis no Railway:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Chave da API do Firebase | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação | `projeto.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID do projeto Firebase | `meu-projeto` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket de storage | `projeto.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID do sender | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ID do app | `1:123456789:web:abc123` |
| `PORT` | Porta do servidor | `3000` |

## 📦 Estrutura do Projeto

```
├── src/
│   ├── app/                 # Páginas Next.js 13+ (App Router)
│   ├── components/          # Componentes React
│   ├── lib/                 # Configurações e utilitários
│   ├── hooks/               # Custom hooks
│   └── types/               # Definições de tipos TypeScript
├── public/                  # Arquivos estáticos
├── nixpacks.toml           # Configuração do Nixpacks
├── next.config.ts          # Configuração do Next.js
└── package.json            # Dependências e scripts
```

## 🔧 Tecnologias

- **Frontend:** Next.js 15, React 18, TypeScript
- **UI:** Tailwind CSS, Radix UI, Lucide Icons
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Deploy:** Railway com Nixpacks
- **Build:** Node.js 20, NPM

## 🚀 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento local
npm run build    # Build de produção
npm run start    # Iniciar servidor de produção
npm run lint     # Verificar código
npm run clean    # Limpar cache e reinstalar
```

## 📝 Notas de Deploy

- O projeto está configurado para usar **Nixpacks** no Railway
- Todas as páginas que usam Firebase têm `dynamic = 'force-dynamic'`
- Build otimizado para produção com Next.js standalone
- Configuração de cache e compressão habilitada

## 🔒 Segurança

- Variáveis de ambiente configuradas corretamente
- Headers de segurança habilitados
- Autenticação Firebase implementada
- Controle de acesso baseado em perfis

## 📊 Funcionalidades

- ✅ Autenticação com Firebase
- ✅ Gestão de usuários e empresas
- ✅ Agendamento de cursos
- ✅ Sistema de certificados
- ✅ Relatórios e dashboards
- ✅ Interface responsiva
- ✅ Tema escuro/claro
