# Sistema de Logo da Aplicação

## 📋 Visão Geral

O sistema de logo foi completamente reestruturado para permitir personalização persistente do logo e nome da aplicação em todas as páginas.

## 🔧 Componentes Criados

### 1. Sistema de Configurações (`src/lib/app-settings.ts`)
- **Persistência**: Configurações salvas no localStorage
- **Interface**: `AppSettings` com nome e URL do logo
- **Funções**: `loadAppSettings()`, `saveAppSettings()`, `updateAppSetting()`
- **Hook**: `useAppSettings()` para componentes React

### 2. Componente de Logo (`src/components/app-logo.tsx`)
- **AppLogo**: Componente principal reutilizável
- **SidebarLogo**: Específico para sidebar
- **HeaderLogo**: Específico para header
- **PageTitle**: Para títulos de página

## 🎨 Funcionalidades

### Upload de Logo
- ✅ **Upload de arquivo**: Suporte a imagens (PNG, JPG, SVG, etc.)
- ✅ **URL externa**: Possibilidade de usar URL de imagem
- ✅ **Pré-visualização**: Mostra o logo antes de salvar
- ✅ **Remoção**: Botão para remover o logo

### Nome da Aplicação
- ✅ **Edição**: Campo para alterar o nome
- ✅ **Persistência**: Salvo automaticamente
- ✅ **Aplicação global**: Usado em todas as páginas

### Integração
- ✅ **Todas as páginas**: Logo atualizado em todas as páginas
- ✅ **Sidebar**: Logo aparece na barra lateral
- ✅ **Responsivo**: Funciona em diferentes tamanhos
- ✅ **Fallback**: Ícone padrão quando não há logo

## 📁 Arquivos Modificados

### Novos Arquivos
- `src/lib/app-settings.ts` - Sistema de configurações
- `src/components/app-logo.tsx` - Componentes de logo

### Arquivos Atualizados
- `src/app/configuracoes/page.tsx` - Interface de configuração
- `src/app/dashboard/page.tsx` - Logo na sidebar
- `src/app/empresas/page.tsx` - Logo na sidebar
- `src/app/usuarios/page.tsx` - Logo na sidebar
- `src/app/cursos/page.tsx` - Logo na sidebar
- `src/app/instrutores/page.tsx` - Logo na sidebar
- `src/app/agendamentos/page.tsx` - Logo na sidebar
- `src/app/calendario/page.tsx` - Logo na sidebar
- `src/app/historico/page.tsx` - Logo na sidebar
- `src/app/relatorios/page.tsx` - Logo na sidebar
- `src/app/empresas/[id]/page.tsx` - Logo na sidebar
- `src/app/cursos/[id]/page.tsx` - Logo na sidebar
- `src/app/tabelas/[slug]/page.tsx` - Logo na sidebar

## 🚀 Como Usar

### 1. Acessar Configurações
- Vá para **Configurações > Personalização**
- Encontre a seção "Logo da Aplicação"

### 2. Enviar Logo
- **Opção 1**: Clique no botão de upload e selecione um arquivo
- **Opção 2**: Cole uma URL de imagem no campo de texto

### 3. Editar Nome
- Altere o campo "Nome da Aplicação"
- O nome será usado em toda a aplicação

### 4. Salvar
- Clique em "Salvar Configurações"
- As mudanças são aplicadas imediatamente

## 🔄 Comportamento

### Carregamento
- Configurações carregadas do localStorage
- Fallback para valores padrão se não existir
- Sincronização automática entre abas

### Atualização
- Mudanças aplicadas em tempo real
- Logo atualizado em todas as páginas
- Nome da aplicação atualizado globalmente

### Persistência
- Configurações salvas no navegador
- Sobrevivem a recarregamentos da página
- Mantidas entre sessões

## 🎯 Benefícios

### Para o Usuário
- ✅ **Personalização**: Logo da empresa em toda a aplicação
- ✅ **Simplicidade**: Interface intuitiva para upload
- ✅ **Flexibilidade**: Suporte a arquivos e URLs
- ✅ **Feedback**: Pré-visualização antes de salvar

### Para o Desenvolvedor
- ✅ **Reutilização**: Componente único para todas as páginas
- ✅ **Manutenibilidade**: Sistema centralizado
- ✅ **Extensibilidade**: Fácil adicionar novas configurações
- ✅ **Performance**: Carregamento otimizado

## 🔧 Configurações Disponíveis

```typescript
interface AppSettings {
  appName: string;        // Nome da aplicação
  appLogoUrl: string;     // URL do logo
  maintenanceMode: boolean; // Modo de manutenção
  theme: 'light' | 'dark' | 'system'; // Tema
}
```

## 📱 Responsividade

### Tamanhos de Logo
- **sm**: 24x24px (header)
- **md**: 32x32px (sidebar)
- **lg**: 48x48px (grande)
- **xl**: 64x64px (extra grande)
- **2xl**: 128x128px (muito grande - página de login)

### Variantes
- **sidebar**: Cores da sidebar
- **header**: Cores do header
- **default**: Cores padrão

## 🐛 Solução de Problemas

### Logo não aparece
1. Verifique se o arquivo é uma imagem válida
2. Confirme se a URL está acessível
3. Tente recarregar a página

### Configurações não salvam
1. Verifique se o localStorage está habilitado
2. Tente limpar o cache do navegador
3. Confirme se há espaço suficiente

### Logo não atualiza
1. Aguarde alguns segundos para sincronização
2. Recarregue a página
3. Verifique se não há cache do navegador

## 🔮 Próximas Melhorias

- [ ] Upload para servidor (não apenas localStorage)
- [ ] Múltiplos formatos de logo (favicon, etc.)
- [ ] Configurações por empresa/tenant
- [ ] Backup/restore de configurações
- [ ] Validação de tamanho e formato de imagem 