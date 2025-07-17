# Solução para Erro ERR_QUIC_PROTOCOL_ERROR

## Problema Identificado
O erro `ERR_QUIC_PROTOCOL_ERROR` indica que os arquivos JavaScript não estão sendo carregados corretamente. Isso pode acontecer por:

1. **Problemas de rede temporários**
2. **Configuração incorreta do servidor**
3. **Problemas com o build do Next.js**
4. **Variáveis de ambiente não configuradas**

## Soluções Implementadas

### 1. Página Inicial Simplificada
- Removida dependência do Firebase na página inicial
- Adicionado `export const dynamic = 'force-dynamic'` para evitar SSR
- Criada página de fallback simples

### 2. CSS Simplificado
- Removidas configurações complexas de CSS
- Usado tema padrão do shadcn/ui

### 3. Configuração Next.js Otimizada
- Removidas configurações desnecessárias
- Mantido apenas o essencial para produção

### 4. Health Check API
- Criada rota `/api/health` para verificar status do servidor

## Passos para Resolver

### 1. Verificar Health Check
Acesse: `https://seu-dominio.railway.app/api/health`

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "firebase": {
    "apiKey": "configured",
    "projectId": "configured"
  }
}
```

### 2. Verificar Variáveis de Ambiente no Railway
Certifique-se de que estas variáveis estão configuradas:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=seu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NODE_ENV=production
```

### 3. Reiniciar o Deploy
1. Vá para o Railway Dashboard
2. Selecione seu projeto
3. Clique em "Deployments"
4. Clique em "Redeploy" no último deploy

### 4. Limpar Cache do Navegador
1. Abra o DevTools (F12)
2. Clique com botão direito no botão de recarregar
3. Selecione "Empty Cache and Hard Reload"

### 5. Testar em Modo Anônimo
1. Abra uma janela anônima/privada
2. Acesse a URL do seu aplicativo
3. Verifique se carrega corretamente

## Diagnóstico Adicional

### Se o Health Check Falhar
- Verifique os logs no Railway
- Confirme que as variáveis de ambiente estão corretas
- Tente fazer um novo deploy

### Se o Health Check Passar mas a Página Não Carrega
- Problema pode ser de cache do navegador
- Tente acessar em outro dispositivo/rede
- Verifique se há bloqueadores de anúncios ativos

### Se Continuar com Problemas
1. Verifique os logs do Railway em tempo real
2. Confirme que o build está sendo gerado corretamente
3. Considere usar um Dockerfile em vez do Nixpacks

## Comandos Úteis

### Verificar Logs no Railway
```bash
railway logs
```

### Verificar Status do Serviço
```bash
railway status
```

### Fazer Deploy Manual
```bash
railway up
```

## Contato
Se o problema persistir, verifique:
1. Logs detalhados no Railway
2. Status do serviço Firebase
3. Configuração de rede do Railway 