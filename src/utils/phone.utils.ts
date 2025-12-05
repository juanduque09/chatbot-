/**
 * Formatear número de teléfono para WhatsApp
 * Asume que los números son colombianos (código de país +57)
 */
export function formatearTelefonoWhatsApp(telefono: string): string {
  // Remover espacios y caracteres especiales
  let cleaned = telefono.replace(/\D/g, '');
  
  // Si no tiene código de país, agregar el de Colombia
  if (!cleaned.startsWith('57') && cleaned.length === 10) {
    cleaned = '57' + cleaned;
  }
  
  return `whatsapp:+${cleaned}`;
}

/**
 * Validar formato de teléfono
 */
export function esNumeroValido(telefono: string): boolean {
  // Debe tener 10 dígitos (formato colombiano)
  const cleaned = telefono.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 12; // Con o sin código de país
}

/**
 * Limpiar texto para evitar problemas en WhatsApp
 */
export function sanitizarTexto(texto: string): string {
  return texto
    .replace(/\n{3,}/g, '\n\n') // Máximo 2 saltos de línea consecutivos
    .trim();
}
