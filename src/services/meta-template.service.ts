import { Cita } from "../types/cita.types";
import {
  parseHora,
  formatearFechaLegible,
  getDiaSemana,
} from "../utils/date.utils";
import config from "../config/env";

/**
 * Servicio para preparar parámetros de plantillas de Meta WhatsApp
 */
class MetaTemplateService {
  /**
   * Crear parámetros para plantilla de recordatorio
   *
   * Mapeo de plantilla:
   * {{1}} = Nombre del paciente
   * {{2}} = Fecha (ej: "Viernes, 6 de diciembre de 2025")
   * {{3}} = Hora (ej: "10:00 AM")
   * {{4}} = Nombre del médico
   * {{5}} = Sede
   * {{6}} = Consultorio
   * {{7}} = Tipo de cita
   * {{8}} = Entidad
   */
  crearParametrosRecordatorio(cita: Cita): string[] {
    const horaFormateada = parseHora(cita.hora);
    const fechaLegible = formatearFechaLegible(cita.requerida);
    const diaSemana = getDiaSemana(cita.requerida);

    return [
      cita.nombre, // {{1}}
      `${diaSemana}, ${fechaLegible}`, // {{2}}
      `${horaFormateada} ${cita.ampm}`, // {{3}}
      cita.medico, // {{4}}
      cita.sede, // {{5}}
      cita.consultorio, // {{6}}
      cita.tipo, // {{7}}
      cita.entidad, // {{8}}
    ];
  }

  /**
   * Obtener nombre de plantilla configurada
   */
  obtenerNombrePlantilla(): string {
    return config.meta.templateName;
  }

  /**
   * Crear mensaje de confirmación (versión simple)
   * Para plantilla: confirmacion_recibida
   * {{1}} = Fecha
   * {{2}} = Hora
   */
  crearParametrosConfirmacion(cita: Cita): string[] {
    const horaFormateada = parseHora(cita.hora);
    const fechaLegible = formatearFechaLegible(cita.requerida);
    const diaSemana = getDiaSemana(cita.requerida);

    return [
      `${diaSemana}, ${fechaLegible}`, // {{1}}
      `${horaFormateada} ${cita.ampm}`, // {{2}}
    ];
  }

  /**
   * Crear mensaje preview (para testing/logs)
   * Este método genera una representación del mensaje final
   */
  crearMensajePreview(cita: Cita): string {
    const parametros = this.crearParametrosRecordatorio(cita);

    return `
🏥 *Recordatorio de Cita - Clínica Láser*

Hola *${parametros[0]}*,

Le recordamos su cita médica para mañana:

📅 *Fecha:* ${parametros[1]}
⏰ *Hora:* ${parametros[2]}
👨‍⚕️ *Médico:* ${parametros[3]}
🏢 *Sede:* ${parametros[4]}
🚪 *Consultorio:* ${parametros[5]}

📋 *Tipo:* ${parametros[6]}
💳 *Entidad:* ${parametros[7]}

⚠️ *Por favor llegar 20 minutos antes*
📄 Traer documento de identidad y orden médica

Si necesita cancelar, contáctenos con anticipación.

¡Gracias por confiar en nosotros! 🙏
    `.trim();
  }
}

export default new MetaTemplateService();
