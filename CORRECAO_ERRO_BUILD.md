# Correção do Erro de Build - Html Import

## Problema Identificado
O erro `Error: <Html> should not be imported outside of pages/_document` indica que há um componente sendo importado incorretamente no Next.js 13+ com App Router.

## Soluções Implementadas

### 1. Removido `next/dynamic` da página de relatórios
- Substituído por importação direta do componente `ReportsChart`
- Removida dependência problemática

### 2. Simplificado `DynamicFavicon`
- Removida dependência do `useAppSettings`
- Implementado acesso direto ao localStorage

### 3. Simplificado `useAppSettings` na página de configurações
- Criado hook local para evitar conflitos
- Removidas importações problemáticas

## Próximos Passos

### 1. Fazer Novo Deploy
```bash
# Criar novo ZIP sem a pasta .next
# Fazer upload no Railway
```

### 2. Se o Erro Persistir
O problema pode estar em outros componentes. Verificar:

1. **Componentes que usam `next/dynamic`**
2. **Importações de `next/document`**
3. **Componentes que manipulam o DOM durante SSR**

### 3. Alternativa: Usar Dockerfile
Se o problema persistir, criar um `Dockerfile` simples:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### 4. Verificar Logs do Build
No Railway, verificar os logs detalhados do build para identificar exatamente onde está o problema.

## Comandos Úteis

### Testar Build Localmente
```bash
npm run build
```

### Verificar Dependências
```bash
npm ls next
```

### Limpar Cache
```bash
rm -rf .next
npm run build
```

## Contato
Se o problema persistir após essas correções, pode ser necessário:
1. Revisar todos os componentes que usam `next/dynamic`
2. Verificar se há importações incorretas de componentes do Next.js
3. Considerar usar um Dockerfile em vez do Nixpacks 