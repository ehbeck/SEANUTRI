# 🔥 Migração para Firebase

Este guia explica como migrar todo o projeto do Appwrite para Firebase.

## 📋 Pré-requisitos

1. **Conta no Google**: Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. **Projeto Firebase**: Crie um novo projeto no Firebase Console
3. **Node.js**: Versão 16 ou superior
4. **npm ou yarn**: Gerenciador de pacotes

## 🚀 Configuração Rápida

### Passo 1: Criar Projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Criar projeto"**
3. Digite o nome do projeto (ex: `sea-ocean-cursos`)
4. Siga os passos de configuração
5. Clique em **"Criar projeto"**

### Passo 2: Adicionar Aplicação Web

1. No console do Firebase, clique em **"Adicionar app"**
2. Escolha **"Web"** (</>) 
3. Digite um nome para a aplicação (ex: `sea-ocean-web`)
4. Clique em **"Registrar app"**
5. **Copie as configurações** do objeto `firebaseConfig`

### Passo 3: Configurar Firebase no Projeto

Execute o script de configuração automática:

```bash
npm run setup:firebase
```

O script irá solicitar as configurações do Firebase e criar o arquivo `.env.local`.

### Passo 4: Testar Conexão

```bash
npm run test:firebase
```

## ⚙️ Configurações do Firebase

### 1. Habilitar Authentication

1. No console do Firebase, vá para **Authentication**
2. Clique em **"Começar"**
3. Vá para a aba **"Sign-in method"**
4. Habilite os métodos desejados:
   - ✅ **Email/Password**
   - ✅ **Anonymous** (opcional)

### 2. Configurar Firestore

1. No console do Firebase, vá para **Firestore Database**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de teste"** (para desenvolvimento)
4. Escolha a localização mais próxima
5. Clique em **"Concluir"**

### 3. Configurar Regras de Segurança

No Firestore, vá para **Regras** e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📁 Arquivos Criados

### 1. **`firebase.config.js`** - Configuração principal
- Inicialização do Firebase
- Exportação dos serviços

### 2. **`src/lib/firebase-auth.ts`** - Sistema de autenticação
- Criar usuário
- Login/Logout
- Verificar autenticação

### 3. **`src/lib/firebase-db.ts`** - Sistema de banco de dados
- CRUD genérico
- Serviços específicos para cada coleção
- Tipos TypeScript

### 4. **`src/hooks/use-firebase.ts`** - Hooks React
- `useFirebaseAuth()` - Autenticação
- `useUsers()` - Gerenciar usuários
- `useEmpresas()` - Gerenciar empresas
- `useCursos()` - Gerenciar cursos
- `useAgendamentos()` - Gerenciar agendamentos

### 5. **Scripts de Configuração**
- `setup-firebase.js` - Configuração automática
- `test-firebase-connection.js` - Teste de conexão

## 🔄 Migração de Dados

### 1. Estrutura das Coleções

O Firestore usa a seguinte estrutura:

```
/users
  - id: string
  - email: string
  - name: string
  - role: string
  - createdAt: timestamp
  - updatedAt: timestamp

/empresas
  - id: string
  - nome: string
  - cnpj: string
  - endereco: string
  - telefone: string
  - email: string
  - responsavel: string
  - createdAt: timestamp
  - updatedAt: timestamp

/cursos
  - id: string
  - titulo: string
  - descricao: string
  - duracao: number
  - preco: number
  - instrutor: string
  - empresaId: string
  - createdAt: timestamp
  - updatedAt: timestamp

/agendamentos
  - id: string
  - cursoId: string
  - empresaId: string
  - data: timestamp
  - horario: string
  - participantes: number
  - status: string
  - observacoes: string
  - createdAt: timestamp
  - updatedAt: timestamp
```

### 2. Script de Migração

Para migrar dados do Appwrite para Firebase, execute:

```bash
node migrate-to-firebase.js
```

## 🧪 Testando a Migração

### 1. Teste de Conexão

```bash
npm run test:firebase
```

### 2. Teste de Autenticação

1. Inicie o servidor: `npm run dev`
2. Acesse: `http://localhost:9003`
3. Tente criar uma conta
4. Tente fazer login

### 3. Teste de CRUD

1. Vá para a seção de empresas
2. Crie uma nova empresa
3. Edite a empresa
4. Delete a empresa

## 🔧 Comandos Úteis

```bash
# Configuração automática
npm run setup:firebase

# Teste de conexão
npm run test:firebase

# Limpar e reinstalar
npm run clean

# Iniciar desenvolvimento
npm run dev
```

## 🔍 Solução de Problemas

### Erro: "Firebase App named '[DEFAULT]' already exists"

**Solução**: Verifique se não há múltiplas inicializações do Firebase.

### Erro: "Missing or insufficient permissions"

**Solução**: Configure as regras de segurança do Firestore.

### Erro: "auth/operation-not-allowed"

**Solução**: Habilite o método de autenticação no console do Firebase.

### Erro: "Firestore is not enabled"

**Solução**: Habilite o Firestore no console do Firebase.

## 📚 Recursos Adicionais

- [Documentação do Firebase](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Auth](https://firebase.google.com/docs/auth)

## 🎯 Vantagens do Firebase

- ✅ **Sem problemas de CORS**
- ✅ **Interface web completa**
- ✅ **Documentação excelente**
- ✅ **Escalabilidade automática**
- ✅ **Integração com Google Cloud**
- ✅ **Gratuito para começar**

## 📝 Próximos Passos

1. **Configure o Firebase** seguindo este guia
2. **Teste a conexão** com `npm run test:firebase`
3. **Migre os dados** se necessário
4. **Atualize o código** para usar os novos hooks
5. **Teste todas as funcionalidades**
6. **Deploy para produção**

## 🆘 Suporte

Se você encontrar problemas:

1. Verifique os logs do console
2. Execute o script de diagnóstico
3. Verifique a documentação do Firebase
4. Consulte os issues do projeto

---

**🎉 Parabéns! Você migrou com sucesso para o Firebase!** 