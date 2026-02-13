function extraerPrimerTelefono(telefono: string): string {
  if (!telefono) return "";

  // Limpiar el string completo primero
  telefono = telefono.trim();

  // Si ya empieza con +57, extraer solo el número después del +57
  if (telefono.startsWith("+57")) {
    const numeroSolo = telefono
      .substring(3)
      .split(/[\s\-\/]+/)[0]
      .replace(/[^\d]/g, "");
    if (numeroSolo.length >= 10) {
      return `+57${numeroSolo}`;
    }
  }

  // Dividir por cualquier separador: guiones (-), barras (/), espacios múltiples
  const numeros = telefono.split(/[\s\-\/]+/);

  // Tomar el primer número y limpiar cualquier carácter que no sea dígito
  const primerNumero = numeros[0].trim().replace(/[^\d]/g, "");

  // Validar que tenga al menos 10 dígitos (números colombianos)
  if (primerNumero.length < 10) {
    return "";
  }

  // Agregar +57 si no tiene código de país
  return `+57${primerNumero}`;
}

// Casos de prueba - INCLUYE TUS CASOS PROBLEMÁTICOS
const casos = [
  "3135481803 - 3001234567", // Formato estándar
  "3104590141--3188667663", // Doble guion
  "3122805913 -3127610601-  6063235992", // ⭐ TU CASO 1: espacios + guiones mezclados
  "3108212934/ 3195747170", // ⭐ TU CASO 2: barra diagonal
  "3212338274- 3125121125", // ⭐ TU CASO 3: guion con espacio
  "3135481803-3001234567", // Guion simple
  "3135481803", // Un solo número
  "+573135481803", // Ya tiene +57
  "3135481803 - 3001234567 - 3208888888", // Tres números
  "  3135481803  ", // Con espacios al inicio/fin
];

console.log("Pruebas de extraerPrimerTelefono (VERSIÓN CORREGIDA):\n");
console.log("═".repeat(60) + "\n");

casos.forEach((caso, i) => {
  const resultado = extraerPrimerTelefono(caso);
  const valido = resultado.startsWith("+57") && resultado.length === 13;

  console.log(`${i + 1}. Entrada: "${caso}"`);
  console.log(`   Salida:  "${resultado}"`);
  console.log(`   Status:  ${valido ? "✅ VÁLIDO" : "❌ INVÁLIDO"}`);
  console.log();
});
