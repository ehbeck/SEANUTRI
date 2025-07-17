# 🔥 Configuração Rápida - Firebase

## ✅ Dados do Seu Firebase

Baseado na sua configuração:

- **Project ID**: `offshore-nutrition-tracker`
- **Auth Domain**: `offshore-nutrition-tracker.firebaseapp.com`
- **API Key**: `AIzaSyAVaDdDt-k_MDB7Rj_tqqHSTysrRfHEVRg`

## 🚀 Configuração em 3 Passos

### Passo 1: Copiar Arquivo de Configuração

```bash
# Copiar o arquivo pronto
cp env.local.firebase.pronto .env.local
```

### Passo 2: Testar Conexão

```bash
# Teste de conexão
npm run test:firebase
```

### Passo 3: Iniciar Aplicação

```bash
# Iniciar aplicação
npm run dev
```

## 🔧 Configuração do Firebase Console

### 1. Habilitar Authentication

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Selecione o projeto `offshore-nutrition-tracker`
3. Vá para **Authentication** > **Sign-in method**
4. Habilite:
   - ✅ **Email/Password**
   - ✅ **Anonymous** (opcional)

### 2. Configurar Firestore

1. Vá para **Firestore Database**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de teste"**
4. Escolha a localização mais próxima
5. Clique em **"Concluir"**

### 3. Configurar Regras de Segurança

No Firestore, vá para **Regras** e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🧪 Testando

### 1. Teste de Conexão
```bash
npm run test:firebase
```

### 2. Teste da Aplicação
1. Acesse: `http://localhost:9003`
2. Tente criar uma conta
3. Tente fazer login

## 🔧 Comandos Úteis

```bash
# Configuração automática (já com seus dados)
npm run setup:firebase

# Teste de conexão
npm run test:firebase

# Limpar e reinstalar
npm run clean

# Iniciar desenvolvimento
npm run dev
```

## ❗ Problemas Comuns

### "Firebase App named '[DEFAULT]' already exists"
- Verifique se não há múltiplas inicializações

### "Missing or insufficient permissions"
- Configure as regras de segurança do Firestore

### "auth/operation-not-allowed"
- Habilite o método de autenticação no console

### "Firestore is not enabled"
- Habilite o Firestore no console

## 📞 Suporte

- Execute: `npm run test:firebase`
- Verifique os logs do console
- Consulte: `MIGRACAO_FIREBASE.md`

## 🎯 Status da Configuração

- ✅ **Project ID**: Configurado (`offshore-nutrition-tracker`)
- ✅ **Auth Domain**: Configurado (`offshore-nutrition-tracker.firebaseapp.com`)
- ✅ **API Key**: Configurada
- ⚙️ **Authentication**: Configurar no console
- ⚙️ **Firestore**: Configurar no console 