import cron from "node-cron";
import config from "../config/env";
import logger from "../utils/logger";
import apiService from "../services/api.service";
import filterService from "../services/filter.service";
import metaTemplateService from "../services/meta-template.service";
import metaWhatsappService from "../services/meta-whatsapp.service";
import {
  guardarMensaje,
  actualizarEstadoMensaje,
  yaSeEnvioMensaje,
  registrarEjecucion,
  finalizarEjecucion,
} from "../database/db";

/**
 * Job principal: Enviar recordatorios de citas
 */
export async function ejecutarRecordatorios(): Promise<void> {
  const inicioEjecucion = Date.now();
  const ejecucionId = registrarEjecucion("cron");

  let citasProcesadas = 0;
  let mensajesEnviados = 0;
  let mensajesExitosos = 0;
  let mensajesFallidos = 0;

  try {
    logger.info("═══════════════════════════════════════════════════");
    logger.info(
      "🚀 Iniciando proceso de recordatorios automáticos (Meta WhatsApp API)"
    );
    logger.info("═══════════════════════════════════════════════════");

    // 1. Obtener citas desde la API
    const todasLasCitas = await apiService.obtenerCitas();

    if (todasLasCitas.length === 0) {
      logger.warn("⚠️  No se encontraron citas en la API");
      finalizarEjecucion(ejecucionId, {
        citasProcesadas: 0,
        mensajesEnviados: 0,
        mensajesExitosos: 0,
        mensajesFallidos: 0,
        duracionMs: Date.now() - inicioEjecucion,
      });
      return;
    }

    citasProcesadas = todasLasCitas.length;

    // 2. Filtrar citas que necesitan recordatorio
    const citasParaRecordar =
      filterService.obtenerCitasParaRecordatorio(todasLasCitas);

    if (citasParaRecordar.length === 0) {
      logger.info("✅ No hay citas para recordar mañana");
      finalizarEjecucion(ejecucionId, {
        citasProcesadas,
        mensajesEnviados: 0,
        mensajesExitosos: 0,
        mensajesFallidos: 0,
        duracionMs: Date.now() - inicioEjecucion,
      });
      return;
    }

    // 3. Filtrar citas que no han sido enviadas (prevenir duplicados)
    const citasSinEnviar = citasParaRecordar.filter((cita) => {
      return !yaSeEnvioMensaje(cita.id, cita.requerida);
    });

    if (citasSinEnviar.length < citasParaRecordar.length) {
      logger.info(
        `🔄 Se omitieron ${
          citasParaRecordar.length - citasSinEnviar.length
        } citas (ya enviadas)`
      );
    }

    if (citasSinEnviar.length === 0) {
      logger.info("✅ Todos los mensajes ya fueron enviados previamente");
      finalizarEjecucion(ejecucionId, {
        citasProcesadas,
        mensajesEnviados: 0,
        mensajesExitosos: 0,
        mensajesFallidos: 0,
        duracionMs: Date.now() - inicioEjecucion,
      });
      return;
    }

    // 4. Preparar mensajes con plantilla de Meta
    const templateName = metaTemplateService.obtenerNombrePlantilla();
    const mensajes = citasSinEnviar.map((cita) => ({
      telefono: cita.telefono,
      templateName,
      parametros: metaTemplateService.crearParametrosRecordatorio(cita),
      nombre: cita.nombre,
      citaId: cita.id,
      cita, // Para guardar en DB
    }));

    // 5. Enviar mensajes por WhatsApp con Meta
    logger.info("📤 Enviando recordatorios por Meta WhatsApp Business API...");
    const resultado = await metaWhatsappService.enviarMensajesLote(mensajes);

    mensajesEnviados = resultado.exitosos + resultado.fallidos;
    mensajesExitosos = resultado.exitosos;
    mensajesFallidos = resultado.fallidos;

    // 6. Guardar en base de datos
    logger.info("💾 Guardando registros en base de datos...");
    resultado.resultados.forEach((res) => {
      const cita = citasSinEnviar.find((c) => c.id === res.citaId)!;
      const mensajePreview = metaTemplateService.crearMensajePreview(cita);

      const mensajeId = guardarMensaje({
        citaId: cita.id,
        nombrePaciente: cita.nombre,
        telefono: cita.telefono,
        mensaje: mensajePreview,
        plantillaId: templateName,
        fechaCita: cita.requerida,
        medico: cita.medico,
        sede: cita.sede,
      });

      if (res.success && res.messageId) {
        actualizarEstadoMensaje(mensajeId, "sent", res.messageId);
      } else {
        actualizarEstadoMensaje(mensajeId, "failed", undefined, res.error);
      }
    });

    // 7. Log final
    logger.info("═══════════════════════════════════════════════════");
    logger.info("✅ Proceso de recordatorios finalizado");
    logger.info(`   📊 Total citas procesadas: ${citasProcesadas}`);
    logger.info(`   📨 Total mensajes enviados: ${mensajesEnviados}`);
    logger.info(`   ✅ Exitosos: ${mensajesExitosos}`);
    logger.info(`   ❌ Fallidos: ${mensajesFallidos}`);
    logger.info(
      `   ⏱️  Duración: ${((Date.now() - inicioEjecucion) / 1000).toFixed(2)}s`
    );
    logger.info("═══════════════════════════════════════════════════");

    finalizarEjecucion(ejecucionId, {
      citasProcesadas,
      mensajesEnviados,
      mensajesExitosos,
      mensajesFallidos,
      duracionMs: Date.now() - inicioEjecucion,
    });
  } catch (error) {
    logger.error("❌ Error en el proceso de recordatorios:", error);

    finalizarEjecucion(ejecucionId, {
      citasProcesadas,
      mensajesEnviados,
      mensajesExitosos,
      mensajesFallidos,
      duracionMs: Date.now() - inicioEjecucion,
      error: error instanceof Error ? error.message : "Error desconocido",
    });

    throw error;
  }
}

/**
 * Iniciar el cron job
 */
export function iniciarCronJob(): void {
  const schedule = config.cron.schedule;

  logger.info("⏰ Configurando cron job...");
  logger.info(`   Horario: ${schedule}`);
  logger.info(`   Zona horaria: ${config.cron.timezone}`);

  const task = cron.schedule(
    schedule,
    async () => {
      logger.info(
        `\n🕐 Cron job ejecutado: ${new Date().toLocaleString("es-CO", {
          timeZone: config.cron.timezone,
        })}`
      );
      await ejecutarRecordatorios();
    },
    {
      timezone: config.cron.timezone,
    }
  );

  logger.info("✅ Cron job iniciado correctamente");
  logger.info("   El sistema enviará recordatorios automáticamente");

  // Mantener el proceso vivo
  task.start();
}

/**
 * Ejecutar una vez manualmente (para pruebas)
 */
export async function ejecutarManualmente(): Promise<void> {
  logger.info("🧪 Ejecución manual del proceso de recordatorios...\n");

  const ejecucionId = registrarEjecucion("manual");
  const inicioEjecucion = Date.now();

  try {
    await ejecutarRecordatorios();
  } catch (error) {
    finalizarEjecucion(ejecucionId, {
      citasProcesadas: 0,
      mensajesEnviados: 0,
      mensajesExitosos: 0,
      mensajesFallidos: 0,
      duracionMs: Date.now() - inicioEjecucion,
      error: error instanceof Error ? error.message : "Error desconocido",
    });
    throw error;
  }
}
