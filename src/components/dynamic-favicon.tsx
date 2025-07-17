"use client";
import { useEffect } from "react";

export default function DynamicFavicon() {
  useEffect(() => {
    // Verificar se estamos no cliente
    if (typeof window === 'undefined') return;
    
    // Carregar configurações do localStorage
    try {
      const settings = localStorage.getItem('seanutri-app-settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.faviconUrl) {
          let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.type = "image/png";
          link.href = parsed.faviconUrl;
          
          // Também atualiza o shortcut icon
          let shortcut: HTMLLinkElement | null = document.querySelector("link[rel='shortcut icon']");
          if (!shortcut) {
            shortcut = document.createElement("link");
            shortcut.rel = "shortcut icon";
            document.head.appendChild(shortcut);
          }
          shortcut.type = "image/png";
          shortcut.href = parsed.faviconUrl;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar favicon:', error);
    }
  }, []);

  return null;
} 