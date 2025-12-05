import cron from 'node-cron';
import config from '../config/env';
import logger from '../utils/logger';
import apiService from '../services/api.service';
import filterService from '../services/filter.service';
import templateService from '../services/template.service';
import whatsappService from '../services/whatsapp.service';

/**
 * Job principal: Enviar recordatorios de citas
 */
export async function ejecutarRecordatorios(): Promise<void> {
  try {
    logger.info('═══════════════════════════════════════════════════');
    logger.info('🚀 Iniciando proceso de recordatorios automáticos (Twilio WhatsApp)');
    logger.info('═══════════════════════════════════════════════════');

    // 1. Obtener citas desde la API
    const todasLasCitas = await apiService.obtenerCitas();

    if (todasLasCitas.length === 0) {
      logger.warn('⚠️  No se encontraron citas en la API');
      return;
    }

    // 2. Filtrar citas que necesitan recordatorio
    const citasParaRecordar = filterService.obtenerCitasParaRecordatorio(todasLasCitas);

    if (citasParaRecordar.length === 0) {
      logger.info('✅ No hay citas para recordar mañana');
      return;
    }

    // 3. Preparar mensajes
    const mensajes = citasParaRecordar.map((cita) => ({
      telefono: cita.telefono,
      mensaje: templateService.crearMensajeRecordatorio(cita),
      nombre: cita.nombre,
    }));

    // 4. Enviar mensajes por WhatsApp con Twilio
    logger.info('📤 Enviando recordatorios por Twilio WhatsApp...');
    const resultado = await whatsappService.enviarMensajesLote(mensajes);

    // 5. Log final
    logger.info('═══════════════════════════════════════════════════');
    logger.info('✅ Proceso de recordatorios finalizado');
    logger.info(`   📊 Total procesados: ${mensajes.length}`);
    logger.info(`   ✅ Exitosos: ${resultado.exitosos}`);
    logger.info(`   ❌ Fallidos: ${resultado.fallidos}`);
    logger.info('═══════════════════════════════════════════════════');
  } catch (error) {
    logger.error('❌ Error en el proceso de recordatorios:', error);
    throw error;
  }
}

/**
 * Iniciar el cron job
 */
export function iniciarCronJob(): void {
  const schedule = config.cron.schedule;

  logger.info('⏰ Configurando cron job...');
  logger.info(`   Horario: ${schedule}`);

  const task = cron.schedule(schedule, async () => {
    logger.info(`\n🕐 Cron job ejecutado: ${new Date().toLocaleString()}`);
    await ejecutarRecordatorios();
  });

  logger.info('✅ Cron job iniciado correctamente');
  logger.info('   El sistema enviará recordatorios automáticamente');

  // Mantener el proceso vivo
  task.start();
}

/**
 * Ejecutar una vez manualmente (para pruebas)
 */
export async function ejecutarManualmente(): Promise<void> {
  logger.info('🧪 Ejecución manual del proceso de recordatorios...\n');
  await ejecutarRecordatorios();
}
