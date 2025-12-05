import twilio from 'twilio';
import config from '../config/env';
import logger from '../utils/logger';
import { formatearTelefonoWhatsApp } from '../utils/phone.utils';

/**
 * Servicio para enviar mensajes por WhatsApp usando Twilio
 */
class WhatsAppService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
    this.fromNumber = config.twilio.whatsappFrom;
  }

  /**
   * Enviar mensaje de WhatsApp
   */
  async enviarMensaje(telefono: string, mensaje: string): Promise<boolean> {
    try {
      const telefonoFormateado = formatearTelefonoWhatsApp(telefono);

      logger.info(`📤 Enviando WhatsApp a ${telefono}...`);

      const message = await this.client.messages.create({
        body: mensaje,
        from: this.fromNumber,
        to: telefonoFormateado,
      });

      logger.info(`✅ Mensaje enviado exitosamente. SID: ${message.sid}`);
      return true;
    } catch (error: any) {
      logger.error(`❌ Error al enviar WhatsApp a ${telefono}:`, {
        error: error.message,
        code: error.code,
        status: error.status,
      });
      return false;
    }
  }

  /**
   * Enviar múltiples mensajes con delay para evitar rate limiting
   */
  async enviarMensajesLote(
    mensajes: Array<{ telefono: string; mensaje: string; nombre: string }>
  ): Promise<{ exitosos: number; fallidos: number }> {
    let exitosos = 0;
    let fallidos = 0;

    logger.info(`📨 Iniciando envío de ${mensajes.length} mensajes...`);

    for (const item of mensajes) {
      try {
        const resultado = await this.enviarMensaje(item.telefono, item.mensaje);
        
        if (resultado) {
          exitosos++;
          logger.info(`   ✅ ${item.nombre} (${item.telefono})`);
        } else {
          fallidos++;
          logger.warn(`   ❌ ${item.nombre} (${item.telefono})`);
        }

        // Delay de 1 segundo entre mensajes para evitar rate limiting
        await this.delay(1000);
      } catch (error) {
        fallidos++;
        logger.error(`   ❌ Error con ${item.nombre}:`, error);
      }
    }

    logger.info(`\n📊 Resumen de envío:`);
    logger.info(`   ✅ Exitosos: ${exitosos}`);
    logger.info(`   ❌ Fallidos: ${fallidos}`);
    logger.info(`   📈 Tasa de éxito: ${((exitosos / mensajes.length) * 100).toFixed(1)}%`);

    return { exitosos, fallidos };
  }

  /**
   * Enviar mensaje de prueba
   */
  async enviarMensajePrueba(telefono: string): Promise<boolean> {
    const mensaje = `
🧪 *Mensaje de Prueba*

Este es un mensaje de prueba del sistema de recordatorios automáticos de Clínica Láser.

Si recibió este mensaje, el sistema está funcionando correctamente. ✅
    `.trim();

    return this.enviarMensaje(telefono, mensaje);
  }

  /**
   * Verificar configuración de Twilio
   */
  verificarConfiguracion(): boolean {
    const valido = !!(
      config.twilio.accountSid &&
      config.twilio.authToken &&
      config.twilio.whatsappFrom
    );

    if (!valido) {
      logger.error('❌ Configuración de Twilio incompleta');
    } else {
      logger.info('✅ Configuración de Twilio válida');
    }

    return valido;
  }

  /**
   * Utility: Delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new WhatsAppService();
