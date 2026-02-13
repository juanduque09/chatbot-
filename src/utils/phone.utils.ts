/**
 * Formatear número de teléfono para WhatsApp (Meta Business API)
 * Asume que los números son colombianos (código de país +57)
 * Meta WhatsApp API espera solo dígitos con código de país, sin "whatsapp:" ni "+"
 */
export function formatearTelefonoWhatsApp(telefono: string): string {
  // Remover espacios y caracteres especiales
  let cleaned = telefono.replace(/\D/g, "");

  // Si no tiene código de país, agregar el de Colombia
  if (!cleaned.startsWith("57") && cleaned.length === 10) {
    cleaned = "57" + cleaned;
  }

  // Meta API requiere solo dígitos con código de país (sin "whatsapp:" ni "+")
  return cleaned;
}

/**
 * Validar formato de teléfono
 */
export function esNumeroValido(telefono: string): boolean {
  // Debe tener 10 dígitos (formato colombiano)
  const cleaned = telefono.replace(/\D/g, "");
  return cleaned.length === 10 || cleaned.length === 12; // Con o sin código de país
}

/**
 * Limpiar texto para evitar problemas en WhatsApp
 */
export function sanitizarTexto(texto: string): string {
  return texto
    .replace(/\n{3,}/g, "\n\n") // Máximo 2 saltos de línea consecutivos
    .trim();
}
