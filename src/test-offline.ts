import { initDatabase, obtenerEstadisticasHoy } from "./database/db";
import {
  validarTelefonoColombiano,
  formatearTelefono,
} from "./utils/phone.utils";
import { calcularDiferenciaEnDias } from "./utils/date.utils";
import { filtrarCitas } from "./services/filter.service";
import logger from "./utils/logger";

/**
 * 🧪 PRUEBAS SIN CREDENCIALES
 *
 * Este script prueba todas las funciones que NO requieren
 * conexión a Meta WhatsApp API. Ideal para desarrollo local.
 */

console.log("\n╔═══════════════════════════════════════════════════╗");
console.log("║   🧪 PRUEBAS OFFLINE (Sin Credenciales Meta)     ║");
console.log("╚═══════════════════════════════════════════════════╝\n");

let testsPasados = 0;
let testsFallidos = 0;

// Helper para mostrar resultados
function mostrarResultado(nombre: string, exito: boolean, mensaje?: string) {
  if (exito) {
    console.log(`✅ ${nombre}`);
    if (mensaje) console.log(`   └─ ${mensaje}`);
    testsPasados++;
  } else {
    console.log(`❌ ${nombre}`);
    if (mensaje) console.log(`   └─ ${mensaje}`);
    testsFallidos++;
  }
}

// ═══════════════════════════════════════════════════════
// 1. PRUEBA DE BASE DE DATOS
// ═══════════════════════════════════════════════════════
console.log("📊 1. PRUEBAS DE BASE DE DATOS\n");

try {
  initDatabase();
  mostrarResultado(
    "Inicialización de base de datos",
    true,
    "Base de datos SQLite creada/conectada",
  );

  const stats = obtenerEstadisticasHoy();
  mostrarResultado(
    "Obtener estadísticas",
    true,
    `${stats.total_enviados} mensajes registrados hoy`,
  );
} catch (error) {
  mostrarResultado("Base de datos", false, `Error: ${error}`);
}

// ═══════════════════════════════════════════════════════
// 2. PRUEBA DE VALIDACIÓN DE TELÉFONOS
// ═══════════════════════════════════════════════════════
console.log("\n📱 2. PRUEBAS DE VALIDACIÓN DE TELÉFONOS\n");

const telefonosPrueba = [
  {
    numero: "3001234567",
    esperado: true,
    nombre: "Teléfono válido (10 dígitos)",
  },
  {
    numero: "+573001234567",
    esperado: true,
    nombre: "Teléfono válido (con +57)",
  },
  { numero: "573001234567", esperado: true, nombre: "Teléfono válido (sin +)" },
  {
    numero: "300123456",
    esperado: false,
    nombre: "Teléfono inválido (9 dígitos)",
  },
  {
    numero: "2001234567",
    esperado: false,
    nombre: "Teléfono inválido (no es celular)",
  },
  {
    numero: "abc123",
    esperado: false,
    nombre: "Teléfono inválido (contiene letras)",
  },
];

telefonosPrueba.forEach(({ numero, esperado, nombre }) => {
  const resultado = validarTelefonoColombiano(numero);
  const exito = resultado === esperado;
  mostrarResultado(
    nombre,
    exito,
    exito
      ? `"${numero}" → ${resultado ? "VÁLIDO" : "INVÁLIDO"}`
      : `Esperado: ${esperado}, Obtenido: ${resultado}`,
  );
});

// ═══════════════════════════════════════════════════════
// 3. PRUEBA DE FORMATEO DE TELÉFONOS
// ═══════════════════════════════════════════════════════
console.log("\n🔢 3. PRUEBAS DE FORMATEO DE TELÉFONOS\n");

const formateosPrueba = [
  { entrada: "3001234567", esperado: "573001234567" },
  { entrada: "+573001234567", esperado: "573001234567" },
  { entrada: "573001234567", esperado: "573001234567" },
];

formateosPrueba.forEach(({ entrada, esperado }) => {
  const resultado = formatearTelefono(entrada);
  const exito = resultado === esperado;
  mostrarResultado(
    `Formatear "${entrada}"`,
    exito,
    exito
      ? `"${entrada}" → "${resultado}"`
      : `Esperado: "${esperado}", Obtenido: "${resultado}"`,
  );
});

// ═══════════════════════════════════════════════════════
// 4. PRUEBA DE CÁLCULO DE FECHAS
// ═══════════════════════════════════════════════════════
console.log("\n📅 4. PRUEBAS DE CÁLCULO DE FECHAS\n");

const hoy = new Date();
const manana = new Date(hoy);
manana.setDate(hoy.getDate() + 1);
const ayer = new Date(hoy);
ayer.setDate(hoy.getDate() - 1);

const fechasPrueba = [
  { fecha: manana, esperado: 1, nombre: "Cita de mañana" },
  { fecha: hoy, esperado: 0, nombre: "Cita de hoy" },
  { fecha: ayer, esperado: -1, nombre: "Cita de ayer" },
];

fechasPrueba.forEach(({ fecha, esperado, nombre }) => {
  const resultado = calcularDiferenciaEnDias(fecha);
  const exito = resultado === esperado;
  mostrarResultado(
    nombre,
    exito,
    exito
      ? `${nombre} → ${resultado} días`
      : `Esperado: ${esperado} días, Obtenido: ${resultado} días`,
  );
});

// ═══════════════════════════════════════════════════════
// 5. PRUEBA DE FILTRADO DE CITAS
// ═══════════════════════════════════════════════════════
console.log("\n🔍 5. PRUEBAS DE FILTRADO DE CITAS\n");

const citasPrueba = [
  {
    paciente: "Juan Pérez",
    telefono: "3001234567",
    fecha: manana.toISOString().split("T")[0],
    hora: "10:00",
    medico: "Dr. García",
    sede: "Centro",
    tipo_consulta: "Control",
  },
  {
    paciente: "María López",
    telefono: "abc123", // Teléfono inválido
    fecha: manana.toISOString().split("T")[0],
    hora: "11:00",
    medico: "Dr. García",
    sede: "Centro",
    tipo_consulta: "Primera vez",
  },
  {
    paciente: "Carlos Ruiz",
    telefono: "3009876543",
    fecha: ayer.toISOString().split("T")[0], // Fecha pasada
    hora: "14:00",
    medico: "Dra. Martínez",
    sede: "Norte",
    tipo_consulta: "Control",
  },
];

const citasFiltradas = filtrarCitas(citasPrueba);

mostrarResultado(
  "Filtrar citas válidas",
  citasFiltradas.length === 1,
  `${citasFiltradas.length}/3 citas válidas (1 esperada)`,
);

if (citasFiltradas.length === 1) {
  mostrarResultado(
    "Cita válida es Juan Pérez",
    citasFiltradas[0].paciente === "Juan Pérez",
    `Paciente: ${citasFiltradas[0].paciente}`,
  );
}

// ═══════════════════════════════════════════════════════
// 6. PRUEBA DE CONFIGURACIÓN
// ═══════════════════════════════════════════════════════
console.log("\n⚙️  6. PRUEBAS DE CONFIGURACIÓN\n");

try {
  const config = require("./config/env");

  mostrarResultado(
    "Cargar configuración",
    true,
    "Variables de entorno cargadas",
  );

  // Verificar que existan las variables (aunque estén vacías)
  const variablesRequeridas = [
    "META_ACCESS_TOKEN",
    "META_PHONE_NUMBER_ID",
    "META_WABA_ID",
    "API_URL",
    "PORT",
    "CRON_SCHEDULE",
  ];

  variablesRequeridas.forEach((variable) => {
    const existe = variable in config;
    mostrarResultado(
      `Variable ${variable}`,
      existe,
      existe
        ? config[variable]
          ? "Configurada"
          : "Sin valor (requiere .env)"
        : "No encontrada",
    );
  });
} catch (error) {
  mostrarResultado("Configuración", false, `Error: ${error}`);
}

// ═══════════════════════════════════════════════════════
// 7. PRUEBA DE LOGGER
// ═══════════════════════════════════════════════════════
console.log("\n📝 7. PRUEBAS DE LOGGER\n");

try {
  logger.info("Prueba de log INFO");
  mostrarResultado("Logger INFO", true, "Log escrito correctamente");

  logger.warn("Prueba de log WARN");
  mostrarResultado("Logger WARN", true, "Warning escrito correctamente");

  logger.error("Prueba de log ERROR");
  mostrarResultado("Logger ERROR", true, "Error escrito correctamente");
} catch (error) {
  mostrarResultado("Logger", false, `Error: ${error}`);
}

// ═══════════════════════════════════════════════════════
// RESUMEN FINAL
// ═══════════════════════════════════════════════════════
console.log("\n╔═══════════════════════════════════════════════════╗");
console.log("║              📊 RESUMEN DE PRUEBAS               ║");
console.log("╚═══════════════════════════════════════════════════╝\n");

const totalTests = testsPasados + testsFallidos;
const porcentaje = ((testsPasados / totalTests) * 100).toFixed(1);

console.log(`   ✅ Tests pasados: ${testsPasados}/${totalTests}`);
console.log(`   ❌ Tests fallidos: ${testsFallidos}/${totalTests}`);
console.log(`   📈 Porcentaje de éxito: ${porcentaje}%\n`);

if (testsFallidos === 0) {
  console.log("   🎉 ¡Todas las pruebas offline pasaron exitosamente!");
  console.log(
    "   ℹ️  Para pruebas con Meta, necesitas configurar .env y usar:",
  );
  console.log("      npm run test -- +573001234567\n");
} else {
  console.log("   ⚠️  Algunos tests fallaron. Revisa los errores arriba.\n");
  process.exit(1);
}
