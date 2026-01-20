import { initDatabase, obtenerEstadisticasHoy } from "./db";
import db from "./db";
import logger from "../utils/logger";

/**
 * Script para ver estadísticas de la base de datos
 */

initDatabase();

console.log("\n╔═══════════════════════════════════════════════════╗");
console.log("║        📊 ESTADÍSTICAS DE BASE DE DATOS          ║");
console.log("╚═══════════════════════════════════════════════════╝\n");

// Estadísticas de hoy
console.log("📅 ESTADÍSTICAS DE HOY:\n");
const statsHoy = obtenerEstadisticasHoy();

console.log(`   📨 Total enviados: ${statsHoy.total_enviados}`);
console.log(`   ✅ Entregados: ${statsHoy.total_entregados}`);
console.log(`   👀 Leídos: ${statsHoy.total_leidos}`);
console.log(`   ❌ Fallidos: ${statsHoy.total_fallidos}`);
console.log(`   📈 Tasa de entrega: ${statsHoy.tasa_entrega.toFixed(1)}%`);
console.log(`   📖 Tasa de lectura: ${statsHoy.tasa_lectura.toFixed(1)}%`);

// Mensajes por estado
console.log("\n\n📊 MENSAJES POR ESTADO:\n");

const estadosMensajes = db
  .prepare(
    `
  SELECT 
    estado,
    COUNT(*) as total
  FROM mensajes
  GROUP BY estado
  ORDER BY total DESC
`,
  )
  .all() as Array<{ estado: string; total: number }>;

estadosMensajes.forEach(({ estado, total }) => {
  const emoji =
    {
      pending: "⏳",
      sent: "📤",
      delivered: "✅",
      read: "👀",
      failed: "❌",
    }[estado] || "❓";

  console.log(`   ${emoji} ${estado.toUpperCase()}: ${total}`);
});

// Últimos 10 mensajes
console.log("\n\n📋 ÚLTIMOS 10 MENSAJES:\n");

const ultimosMensajes = db
  .prepare(
    `
  SELECT 
    nombre_paciente,
    telefono,
    estado,
    fecha_cita,
    created_at
  FROM mensajes
  ORDER BY created_at DESC
  LIMIT 10
`,
  )
  .all() as Array<{
  nombre_paciente: string;
  telefono: string;
  estado: string;
  fecha_cita: string;
  created_at: string;
}>;

if (ultimosMensajes.length === 0) {
  console.log("   (No hay mensajes registrados)");
} else {
  ultimosMensajes.forEach((msg, index) => {
    const emoji =
      {
        pending: "⏳",
        sent: "📤",
        delivered: "✅",
        read: "👀",
        failed: "❌",
      }[msg.estado] || "❓";

    console.log(
      `   ${index + 1}. ${emoji} ${msg.nombre_paciente} - ${msg.telefono}`,
    );
    console.log(
      `      📅 Cita: ${msg.fecha_cita} | Enviado: ${msg.created_at}`,
    );
  });
}

// Estadísticas de ejecuciones
console.log("\n\n⚙️  EJECUCIONES DEL SISTEMA:\n");

const ejecuciones = db
  .prepare(
    `
  SELECT 
    tipo,
    citas_procesadas,
    mensajes_enviados,
    mensajes_exitosos,
    mensajes_fallidos,
    duracion_ms,
    fecha_inicio
  FROM ejecuciones
  ORDER BY fecha_inicio DESC
  LIMIT 5
`,
  )
  .all() as Array<{
  tipo: string;
  citas_procesadas: number;
  mensajes_enviados: number;
  mensajes_exitosos: number;
  mensajes_fallidos: number;
  duracion_ms: number;
  fecha_inicio: string;
}>;

if (ejecuciones.length === 0) {
  console.log("   (No hay ejecuciones registradas)");
} else {
  ejecuciones.forEach((ejecucion, index) => {
    const tipoEmoji = ejecucion.tipo === "cron" ? "⏰" : "🔧";
    console.log(
      `   ${index + 1}. ${tipoEmoji} ${ejecucion.tipo.toUpperCase()}`,
    );
    console.log(
      `      📊 ${ejecucion.citas_procesadas} citas | ${ejecucion.mensajes_exitosos}/${ejecucion.mensajes_enviados} exitosos`,
    );
    console.log(
      `      ⏱️  ${(ejecucion.duracion_ms / 1000).toFixed(2)}s | ${ejecucion.fecha_inicio}`,
    );
  });
}

// Estadísticas por sede
console.log("\n\n🏢 MENSAJES POR SEDE:\n");

const porSede = db
  .prepare(
    `
  SELECT 
    sede,
    COUNT(*) as total,
    SUM(CASE WHEN estado IN ('delivered', 'read') THEN 1 ELSE 0 END) as exitosos
  FROM mensajes
  GROUP BY sede
  ORDER BY total DESC
`,
  )
  .all() as Array<{
  sede: string;
  total: number;
  exitosos: number;
}>;

if (porSede.length === 0) {
  console.log("   (No hay datos por sede)");
} else {
  porSede.forEach(({ sede, total, exitosos }) => {
    const porcentaje = ((exitosos / total) * 100).toFixed(1);
    console.log(`   📍 ${sede}: ${total} mensajes (${porcentaje}% exitosos)`);
  });
}

// Estadísticas por médico
console.log("\n\n👨‍⚕️ MENSAJES POR MÉDICO:\n");

const porMedico = db
  .prepare(
    `
  SELECT 
    medico,
    COUNT(*) as total
  FROM mensajes
  GROUP BY medico
  ORDER BY total DESC
  LIMIT 5
`,
  )
  .all() as Array<{
  medico: string;
  total: number;
}>;

if (porMedico.length === 0) {
  console.log("   (No hay datos por médico)");
} else {
  porMedico.forEach(({ medico, total }) => {
    console.log(`   👨‍⚕️ ${medico}: ${total} mensajes`);
  });
}

// Resumen total
console.log("\n\n📈 RESUMEN TOTAL:\n");

const resumenTotal = db
  .prepare(
    `
  SELECT 
    COUNT(*) as total_mensajes,
    COUNT(DISTINCT fecha_cita) as dias_activos,
    MIN(created_at) as primer_mensaje,
    MAX(created_at) as ultimo_mensaje
  FROM mensajes
`,
  )
  .get() as {
  total_mensajes: number;
  dias_activos: number;
  primer_mensaje: string;
  ultimo_mensaje: string;
};

console.log(`   📨 Total de mensajes: ${resumenTotal.total_mensajes}`);
console.log(`   📅 Días activos: ${resumenTotal.dias_activos}`);
if (resumenTotal.primer_mensaje) {
  console.log(`   🗓️  Primer mensaje: ${resumenTotal.primer_mensaje}`);
  console.log(`   🗓️  Último mensaje: ${resumenTotal.ultimo_mensaje}`);
}

console.log("\n");
