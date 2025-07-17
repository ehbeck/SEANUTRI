# Logo Específico para Página de Login

## 📋 Nova Funcionalidade

Foi adicionado um campo específico para configurar o logo da página de login, separado do logo principal da aplicação.

## 🎯 Benefícios

- ✅ **Personalização específica**: Logo diferente para a página de login
- ✅ **Flexibilidade**: Pode usar um logo mais elaborado na tela de login
- ✅ **Fallback inteligente**: Se não configurado, usa o logo principal
- ✅ **Interface intuitiva**: Configuração fácil na seção de personalização

## 🔧 Implementação

### 1. Sistema de Configurações Atualizado
```typescript
interface AppSettings {
  appName: string;
  appLogoUrl: string;      // Logo principal (sidebar, header)
  loginLogoUrl: string;    // Logo específico da página de login
  maintenanceMode: boolean;
  theme: 'light' | 'dark' | 'system';
}
```

### 2. Componente de Logo Atualizado
- **LoginLogo**: Componente específico para página de login
- **Lógica inteligente**: Usa `loginLogoUrl` se disponível, senão `appLogoUrl`
- **Tamanho otimizado**: Logo maior para melhor visibilidade na tela de login

### 3. Interface de Configuração
- **Campo separado**: "Logo da Página de Login"
- **Upload de arquivo**: Suporte a imagens
- **URL externa**: Possibilidade de usar URL
- **Pré-visualização**: Mostra o logo antes de salvar
- **Remoção**: Botão para remover o logo

## 🚀 Como Usar

### 1. Acessar Configurações
- Vá para **Configurações > Personalização**
- Encontre a seção "Logo da Página de Login"

### 2. Configurar Logo de Login
- **Opção 1**: Clique no botão de upload e selecione um arquivo
- **Opção 2**: Cole uma URL de imagem no campo de texto
- **Pré-visualização**: Veja como o logo ficará
- **Salvar**: Clique em "Salvar Configurações"

### 3. Comportamento
- **Se configurado**: Usa o logo específico da página de login
- **Se não configurado**: Usa o logo principal da aplicação
- **Aplicação imediata**: Mudanças visíveis na página de login

## 📁 Arquivos Modificados

### Atualizados
- `src/lib/app-settings.ts` - Interface e configurações padrão
- `src/components/app-logo.tsx` - Componente com suporte ao logo de login
- `src/app/configuracoes/page.tsx` - Interface de configuração
- `src/app/page.tsx` - Página de login usando o novo componente

### Novos Componentes
- `LoginLogo` - Componente específico para página de login

## 🎨 Diferenças Visuais

### Logo Principal (appLogoUrl)
- **Uso**: Sidebar, header, outras páginas
- **Tamanho**: Médio (32x32px)
- **Contexto**: Navegação interna

### Logo de Login (loginLogoUrl)
- **Uso**: Apenas página de login
- **Tamanho**: Extra grande (128x128px)
- **Contexto**: Primeira impressão, branding
- **Texto**: Não exibido (apenas o logo)

## 🔄 Lógica de Fallback

```typescript
// Determinar qual logo usar baseado na variante
const logoUrl = variant === 'login' && settings.loginLogoUrl 
  ? settings.loginLogoUrl 
  : settings.appLogoUrl;
```

### Comportamento
1. **Se `loginLogoUrl` existe**: Usa o logo específico da página de login
2. **Se `loginLogoUrl` está vazio**: Usa o `appLogoUrl` (logo principal)
3. **Se ambos estão vazios**: Usa o ícone padrão (GraduationCap)

## 📱 Responsividade

### Página de Login
- **Desktop**: Logo extra grande (128x128px) sem texto
- **Mobile**: Logo extra grande (128x128px) sem texto
- **Layout**: Centralizado, acima do formulário

### Outras Páginas
- **Sidebar**: Logo médio (32x32px) com texto
- **Header**: Logo pequeno (24x24px) sem texto

## 🎯 Casos de Uso

### 1. Logo Corporativo na Página de Login
- Logo da empresa mais elaborado
- Melhor primeira impressão
- Branding consistente

### 2. Logo Simples na Aplicação
- Logo mais simples para navegação
- Melhor performance
- Menos distração

### 3. Logo Único
- Mesmo logo em todos os lugares
- Configurar apenas o logo principal
- Logo de login vazio = usa o principal

## 🔧 Configuração Técnica

### Variáveis de Ambiente
```bash
# Não são necessárias - configurações salvas no localStorage
# O sistema funciona independentemente das variáveis de ambiente
```

### Persistência
- **LocalStorage**: Configurações salvas no navegador
- **Sincronização**: Entre abas automaticamente
- **Sobrevivência**: Entre sessões e recarregamentos

## 🐛 Solução de Problemas

### Logo de Login não aparece
1. Verifique se foi configurado na seção de personalização
2. Confirme se o arquivo é uma imagem válida
3. Tente recarregar a página de login

### Logo de Login não salva
1. Clique em "Salvar Configurações"
2. Verifique se não há erros no console
3. Confirme se o localStorage está habilitado

### Logo de Login não atualiza
1. Aguarde alguns segundos para sincronização
2. Recarregue a página de login
3. Verifique se não há cache do navegador

## 🔮 Próximas Melhorias

- [ ] Upload para servidor (não apenas localStorage)
- [ ] Validação de tamanho e formato específico para login
- [ ] Configurações por empresa/tenant
- [ ] Backup/restore de configurações
- [ ] Preview em tempo real na página de login 