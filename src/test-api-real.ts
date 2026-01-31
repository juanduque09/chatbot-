import dayjs from "dayjs";
import "dayjs/locale/es";
import apiUOLaserService from "./services/api-uolaser.service.js";

dayjs.locale("es");

/**
 * Script para probar la conexión con la API real SIN enviar mensajes
 */

async function main() {
  console.log("\n╔═══════════════════════════════════════════════════╗");
  console.log("║   🔌 PRUEBA DE CONEXIÓN CON API UOLASER         ║");
  console.log("╚═══════════════════════════════════════════════════╝\n");

  try {
    // 1. Autenticar
    console.log("🔐 Paso 1: Autenticando con la API...\n");
    const autenticado = await apiUOLaserService.autenticar();

    if (!autenticado) {
      console.log("❌ No se pudo autenticar con la API\n");
      return;
    }

    console.log("✅ Autenticación exitosa\n");
    console.log("=".repeat(80));

    // 2. Obtener agenda de mañana (para prueba)
    // CAMBIAR ESTA LÍNEA PARA CONSULTAR DOMINGO:
    const manana = "2026-02-01"; // Domingo 1 de febrero
    const diaNombre = "DOMINGO 1 DE FEBRERO";
    console.log(
      `\n📅 Paso 2: Obteniendo agendas para ${diaNombre} (${manana})...\n`,
    );

    // Usar el método que consulta todas las sedes y todos los médicos
    const todasLasCitas =
      await apiUOLaserService.obtenerAgendasTodasSedes(manana);

    console.log("\n" + "=".repeat(80));
    console.log(`📊 RESUMEN DE CITAS - ${diaNombre}`);
    console.log("=".repeat(80));
    console.log(`   📅 Fecha: ${manana}`);
    console.log(`   📈 TOTAL: ${todasLasCitas.length} citas\n`);

    if (todasLasCitas.length === 0) {
      console.log("⚠️  No hay citas programadas para mañana\n");
      return;
    }

    // 3. Mostrar muestra de citas
    console.log("=".repeat(80));
    console.log("👥 MUESTRA DE CITAS (primeras 5)");
    console.log("=".repeat(80) + "\n");

    const citasMuestra = todasLasCitas.slice(0, 5);

    citasMuestra.forEach((cita, index) => {
      console.log(`${index + 1}. ${cita.nombre}`);
      console.log(`   📞 Teléfono: ${cita.telefono || "NO REGISTRADO"}`);
      console.log(
        `   ⏰ Hora: ${cita.hora.toString().padStart(4, "0").substring(0, 2)}:${cita.hora.toString().padStart(4, "0").substring(2, 4)} ${cita.ampm}`,
      );
      console.log(`   👨‍⚕️ Médico: ${cita.medico}`);
      console.log(`   🏢 Sede: ${cita.sede}`);
      console.log(`   📋 Tipo: ${cita.tipo}`);
      console.log(`   💳 Entidad: ${cita.entidad}`);
      if (cita.observacion) {
        console.log(
          `   📝 Observación: ${cita.observacion.substring(0, 100)}...`,
        );
      }
      console.log("");
    });

    if (todasLasCitas.length > 5) {
      console.log(`   ... y ${todasLasCitas.length - 5} citas más\n`);
    }

    // 4. Análisis de teléfonos
    const citasConTelefono = todasLasCitas.filter((c) => c.telefono);
    const citasSinTelefono = todasLasCitas.filter((c) => !c.telefono);

    console.log("=".repeat(80));
    console.log("📱 ANÁLISIS DE TELÉFONOS");
    console.log("=".repeat(80));
    console.log(`   ✅ Con teléfono:  ${citasConTelefono.length} citas`);
    console.log(`   ❌ Sin teléfono:  ${citasSinTelefono.length} citas`);
    console.log(
      `   📈 Cobertura:      ${((citasConTelefono.length / todasLasCitas.length) * 100).toFixed(1)}%\n`,
    );

    // 5. Información sobre envío automático
    console.log("=".repeat(80));
    console.log("🤖 CONFIGURACIÓN DE ENVÍO AUTOMÁTICO");
    console.log("=".repeat(80));
    console.log("   ⏰ Hora programada: 8:00 AM");
    console.log("   📅 Frecuencia: Diaria");
    console.log("   📝 Plantilla: recordatorio_cita_completo_v2");
    console.log(
      `   📨 Mensajes a enviar mañana a las 8 AM: ${citasConTelefono.length}`,
    );
    console.log(
      "   ⚠️  Limitación: 1 mensaje por número en 24 horas (política de Meta)\n",
    );

    console.log("=".repeat(80));
    console.log("✅ PRUEBA COMPLETADA");
    console.log("=".repeat(80));
    console.log("   🎯 API funcionando correctamente");
    console.log("   📊 Datos obtenidos exitosamente");
    console.log("   🚀 Sistema listo para envío automático\n");
  } catch (error: any) {
    console.error("\n❌ Error en la prueba:", error.message);
    console.error(error);
  }
}

// Ejecutar
main()
  .then(() => {
    console.log("✅ Proceso completado\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  });
