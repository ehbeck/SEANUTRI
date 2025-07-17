import React from 'react';

// Sistema de configurações da aplicação com persistência
export interface AppSettings {
  appName: string;
  appLogoUrl: string;
  loginLogoUrl: string; // Logo específico para a página de login
  maintenanceMode: boolean;
  theme: 'light' | 'dark' | 'system';
  faviconUrl?: string;
}

// Configurações padrão
const defaultSettings: AppSettings = {
  appName: 'Seanutri',
  appLogoUrl: '',
  loginLogoUrl: '', // Logo específico para a página de login
  maintenanceMode: false,
  theme: 'system',
  faviconUrl: '',
};

// Chave para localStorage
const SETTINGS_KEY = 'seanutri-app-settings';

// Função para carregar configurações
export function loadAppSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }

  return defaultSettings;
}

// Função para salvar configurações
export function saveAppSettings(settings: Partial<AppSettings>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const current = loadAppSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
  }
}

// Função para atualizar uma configuração específica
export function updateAppSetting<K extends keyof AppSettings>(
  key: K, 
  value: AppSettings[K]
): void {
  saveAppSettings({ [key]: value });
}

// Função para resetar configurações
export function resetAppSettings(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Erro ao resetar configurações:', error);
  }
}

// Hook para usar configurações (para componentes React)
export function useAppSettings() {
  const [settings, setSettings] = React.useState<AppSettings>(defaultSettings);

  React.useEffect(() => {
    setSettings(loadAppSettings());
  }, []);

  const updateSetting = React.useCallback(<K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ) => {
    updateAppSetting(key, value);
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSettings = React.useCallback((newSettings: Partial<AppSettings>) => {
    saveAppSettings(newSettings);
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    settings,
    updateSetting,
    updateSettings,
    resetSettings: () => {
      resetAppSettings();
      setSettings(defaultSettings);
    }
  };
} 