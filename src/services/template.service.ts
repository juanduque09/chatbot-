import { Cita } from '../types/cita.types';
import { parseHora, formatearFechaLegible, getDiaSemana } from '../utils/date.utils';
import { sanitizarTexto } from '../utils/phone.utils';

/**
 * Servicio para crear templates de mensajes de WhatsApp
 */
class TemplateService {
  /**
   * Crear mensaje de recordatorio personalizado
   */
  crearMensajeRecordatorio(cita: Cita): string {
    const horaFormateada = parseHora(cita.hora);
    const fechaLegible = formatearFechaLegible(cita.requerida);
    const diaSemana = getDiaSemana(cita.requerida);

    // Limpiar observaciones que pueden ser muy largas
    const observacion = this.limpiarObservacion(cita.observacion);

    const mensaje = `
🏥 *Recordatorio de Cita - Clínica Láser*

Hola *${cita.nombre}*,

Le recordamos su cita médica para mañana:

📅 *Fecha:* ${diaSemana}, ${fechaLegible}
⏰ *Hora:* ${horaFormateada} ${cita.ampm}
👨‍⚕️ *Médico:* ${cita.medico}
🏢 *Sede:* ${cita.sede}
🚪 *Consultorio:* ${cita.consultorio}

📋 *Tipo:* ${cita.tipo}
💊 *Concepto:* ${cita.concepto}
💳 *Entidad:* ${cita.entidad}

⚠️ *Importante:*
${observacion}

✅ Por favor llegar *20 minutos antes* de su cita.
📄 Traer documento de identidad y orden médica.

_Si necesita cancelar o reagendar, contáctenos con anticipación._

¡Gracias por confiar en nosotros! 🙏
    `.trim();

    return sanitizarTexto(mensaje);
  }

  /**
   * Crear mensaje de confirmación simple
   */
  crearMensajeConfirmacion(cita: Cita): string {
    const horaFormateada = parseHora(cita.hora);
    const fechaLegible = formatearFechaLegible(cita.requerida);

    const mensaje = `
✅ *Recordatorio de Cita*

Hola ${cita.nombre},

Tienes cita mañana ${fechaLegible} a las ${horaFormateada} ${cita.ampm} con el Dr. ${cita.medico} en ${cita.sede}.

Llegar 20 min antes. ¡Te esperamos!
    `.trim();

    return sanitizarTexto(mensaje);
  }

  /**
   * Limpiar y acortar observaciones
   */
  private limpiarObservacion(observacion: string): string {
    if (!observacion) return 'Ninguna';

    // Remover múltiples espacios y saltos de línea
    let cleaned = observacion
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    // Si es muy larga, acortar
    if (cleaned.length > 200) {
      cleaned = cleaned.substring(0, 197) + '...';
    }

    return cleaned;
  }

  /**
   * Crear mensaje de prueba
   */
  crearMensajePrueba(): string {
    return sanitizarTexto(`
🧪 *Mensaje de Prueba*

Este es un mensaje de prueba del sistema de recordatorios automáticos.

Si recibió este mensaje, el sistema está funcionando correctamente. ✅
    `.trim());
  }
}

export default new TemplateService();
