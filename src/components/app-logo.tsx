'use client';

import React from 'react';
import Image from 'next/image';
import { GraduationCap } from 'lucide-react';
import { loadAppSettings, type AppSettings } from '@/lib/app-settings';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'sidebar' | 'header' | 'default' | 'login';
}

export function AppLogo({ 
  className = '', 
  showText = true, 
  size = 'md',
  variant = 'default' 
}: AppLogoProps) {
  const [settings, setSettings] = React.useState<AppSettings>(() => ({
    appName: 'Seanutri',
    appLogoUrl: '',
    loginLogoUrl: '',
    maintenanceMode: false,
    theme: 'system'
  }));
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    setSettings(loadAppSettings());

    // Recarregar configurações quando mudarem
    const handleStorageChange = () => {
      setSettings(loadAppSettings());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-32 w-32'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl'
  };

  const variantClasses = {
    sidebar: 'text-sidebar-primary',
    header: 'text-foreground',
    default: 'text-primary',
    login: 'text-primary'
  };

  // Determinar qual logo usar baseado na variante
  const logoUrl = variant === 'login' && settings.loginLogoUrl 
    ? settings.loginLogoUrl 
    : settings.appLogoUrl;

  // Renderizar fallback durante SSR ou antes da hidratação
  if (!isClient) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <GraduationCap className={`${sizeClasses[size]} ${variantClasses[variant]} flex-shrink-0`} />
        {showText && (
          <h1 className={`font-headline font-bold ${textSizes[size]} ${variantClasses[variant]}`}>
            {settings.appName}
          </h1>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoUrl ? (
        <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
          <Image
            src={logoUrl}
            alt={`${settings.appName} Logo`}
            fill
            className="object-contain"
            sizes={`${size === 'sm' ? '24px' : size === 'md' ? '32px' : '48px'}`}
          />
        </div>
      ) : (
        <GraduationCap className={`${sizeClasses[size]} ${variantClasses[variant]} flex-shrink-0`} />
      )}
      
      {showText && (
        <h1 className={`font-headline font-bold ${textSizes[size]} ${variantClasses[variant]}`}>
          {settings.appName}
        </h1>
      )}
    </div>
  );
}

// Componente específico para sidebar
export function SidebarLogo() {
  return <AppLogo variant="sidebar" showText={true} size="md" />;
}

// Componente específico para header
export function HeaderLogo() {
  return <AppLogo variant="header" showText={false} size="sm" />;
}

// Componente específico para página de login
export function LoginLogo() {
  return <AppLogo variant="login" showText={false} size="2xl" />;
}

// Componente para título da página
export function PageTitle() {
  const [settings, setSettings] = React.useState<AppSettings>(() => ({
    appName: 'Seanutri',
    appLogoUrl: '',
    loginLogoUrl: '',
    maintenanceMode: false,
    theme: 'system'
  }));
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    setSettings(loadAppSettings());
  }, []);

  return (
    <h1 className="font-headline text-2xl font-bold">
      {settings.appName}
    </h1>
  );
} 