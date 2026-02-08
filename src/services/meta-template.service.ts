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
   * Mapeo de direcciones por sede
   */
  private readonly direccionesPorSede: Record<string, string> = {
    PEREIRA: "Av Circunvalar Carrera 13 #9-42",
    DOSQUEBRADAS: "Carrera 16 #16-40 barrio valher",
    // Agregar más sedes según sea necesario
  };

  /**
   * Obtener dirección por sede
   * Usa .includes() para mayor flexibilidad (ej: "PEREIRA - CENTRO" también funciona)
   */
  private obtenerDireccion(sede: string): string {
    const sedeUpper = sede.toUpperCase();

    // Buscar coincidencia parcial en las sedes configuradas
    for (const [nombreSede, direccion] of Object.entries(
      this.direccionesPorSede,
    )) {
      if (sedeUpper.includes(nombreSede)) {
        return direccion;
      }
    }

    return "Consultar en recepción";
  }

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
   * Crear parámetros para plantilla de recordatorio detallado
   *
   * Mapeo de plantilla (recordatorio_cita_detallado):
   * {{1}} = Nombre del paciente
   * {{2}} = Fecha (ej: "miércoles, 22 de octubre de 2025")
   * {{3}} = Hora (ej: "7:55 AM")
   * {{4}} = Nombre del médico
   * {{5}} = Sede
   * {{6}} = Dirección
   * {{7}} = Tipo de cita
   * {{8}} = Entidad
   * {{9}} = Observaciones
   */
  crearParametrosRecordatorioDetallado(cita: Cita): string[] {
    const horaFormateada = parseHora(cita.hora);
    const fechaLegible = formatearFechaLegible(cita.requerida);
    const diaSemana = getDiaSemana(cita.requerida);
    const direccion = this.obtenerDireccion(cita.sede);

    return [
      cita.nombre, // {{1}}
      `${diaSemana}, ${fechaLegible}`, // {{2}}
      `${horaFormateada} ${cita.ampm}`, // {{3}}
      cita.medico, // {{4}}
      cita.sede, // {{5}}
      direccion, // {{6}}
      cita.tipo, // {{7}}
      cita.entidad, // {{8}}
      cita.observacion || "Sin observaciones", // {{9}}
    ];
  }

  /**
   * Crear parámetros para plantilla de recordatorio con contacto
   *
   * Mapeo de plantilla (recordatorio_cita_contacto):
   * {{1}} = Nombre del paciente
   * {{2}} = Fecha (ej: "miércoles, 22 de octubre de 2025")
   * {{3}} = Hora (ej: "7:55 AM")
   * {{4}} = Nombre del médico
   * {{5}} = Sede
   * {{6}} = Dirección
   * {{7}} = Tipo de cita
   * {{8}} = Entidad
   * {{9}} = Observaciones/Instrucciones
   * {{10}} = Número de WhatsApp para cancelaciones
   */
  crearParametrosRecordatorioContacto(cita: Cita): string[] {
    const horaFormateada = parseHora(cita.hora);
    const fechaLegible = formatearFechaLegible(cita.requerida);
    const diaSemana = getDiaSemana(cita.requerida);
    const direccion = this.obtenerDireccion(cita.sede);

    // Combinar WhatsApp y teléfono fijo
    const contacto = `WhatsApp ${config.whatsapp.contacto} o llamando al ${config.whatsapp.telefonoFijo}`;

    return [
      cita.nombre, // {{1}}
      `${diaSemana}, ${fechaLegible}`, // {{2}}
      `${horaFormateada} ${cita.ampm}`, // {{3}}
      cita.medico, // {{4}}
      cita.sede, // {{5}}
      direccion, // {{6}}
      cita.tipo, // {{7}}
      cita.entidad, // {{8}}
      cita.observacion || "Sin instrucciones especiales", // {{9}}
      contacto, // {{10}}
    ];
  }

  /**
   * Crear parámetros según la plantilla configurada
   * Este método automáticamente selecciona el formato correcto
   */
  crearParametros(cita: Cita): string[] {
    const templateName = this.obtenerNombrePlantilla();

    if (
      templateName === "recordatorio_cita_contacto_v5" ||
      templateName === "recordatorio_cita_contacto_v4" ||
      templateName === "recordatorio_cita_contacto_v3" ||
      templateName === "recordatorio_cita_contacto_v1"
    ) {
      return this.crearParametrosRecordatorioContacto(cita);
    }

    if (templateName === "recordatorio_cita_detallado") {
      return this.crearParametrosRecordatorioDetallado(cita);
    }

    // Por defecto usa la plantilla original
    return this.crearParametrosRecordatorio(cita);
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
