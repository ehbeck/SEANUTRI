// Função wrapper para usar html2canvas de forma segura
export const safeHtml2Canvas = async (element: HTMLElement, options?: any) => {
  if (typeof window === 'undefined') {
    throw new Error('html2canvas só pode ser usado no cliente');
  }
  
  const html2canvasModule = await import('html2canvas');
  return html2canvasModule.default(element, options);
}; 