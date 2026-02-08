import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import "dayjs/locale/es";
import metaWhatsappService from "./services/meta-whatsapp.service";
import metaTemplateService from "./services/meta-template.service";
import { guardarMensaje } from "./database/db";
import config from "./config/env";
import { esNumeroValido } from "./utils/phone.utils";

dayjs.locale("es");

/**
 * Script para enviar mensajes de prueba desde el JSON de la API
 */

interface CitaAPI {
  hora: number;
  ampm: string;
  consultorio: string;
  nombre: string;
  telefono: string;
  td: string;
  documento: string;
  estado: string;
  motivoCancela: string;
  fechaSolicita: string;
  entidad: string;
  tipo: string;
  concepto: string;
  observacion: string;
  orden: number;
  medico: string;
  requerida: string;
  creadaPor: string;
  modificadaPor: string;
  actualizada: string;
  id: number;
  impresa: null | string;
  sede: string;
}

/**
 * Formatea la hora del formato 755 a "7:55 AM"
 */
function formatearHora(hora: number, ampm: string): string {
  const horaStr = hora.toString().padStart(4, "0");
  const horas = horaStr.substring(0, 2);
  const minutos = horaStr.substring(2, 4);
  return `${parseInt(horas)}:${minutos} ${ampm}`;
}

/**
 * Formatea la fecha de "2025-10-22" a "miércoles, 22 de octubre de 2025"
 */
function formatearFecha(fechaStr: string): string {
  const fecha = dayjs(fechaStr);
  return fecha.format("dddd, D [de] MMMM [de] YYYY");
}

/**
 * Extrae el primer número de teléfono
 */
function extraerPrimerTelefono(telefono: string): string {
  if (!telefono) return "";

  const numeros = telefono.split(" - ");
  const primerNumero = numeros[0].trim();

  if (primerNumero && !primerNumero.startsWith("+")) {
    return `+57${primerNumero}`;
  }

  return primerNumero;
}

/**
 * Limpia y formatea las observaciones
 */
function limpiarObservacion(obs: string): string {
  if (!obs) return "Sin observaciones adicionales";

  // Reemplazar saltos de línea por espacios
  return obs
    .replace(/\\n/g, " - ")
    .replace(/\n/g, " - ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 500); // Limitar a 500 caracteres
}

/**
 * Obtiene la dirección según la sede
 */
function obtenerDireccion(sede: string): string {
  const sedeUpper = sede.toUpperCase();

  if (sedeUpper.includes("PEREIRA")) {
    return "Av Circunvalar Carrera 13 #9-42";
  } else if (sedeUpper.includes("DOSQUEBRADAS")) {
    return "Carrera 16 #16-40 barrio valher";
  }

  // Fallback: retornar la sede como dirección
  return sede;
}

/**
 * Procesa una cita y la convierte en parámetros para la plantilla
 */
function procesarCita(cita: CitaAPI) {
  return {
    citaId: cita.id,
    telefono: extraerPrimerTelefono(cita.telefono),
    nombre: cita.nombre,
    fecha: formatearFecha(cita.requerida),
    hora: formatearHora(cita.hora, cita.ampm),
    medico: cita.medico,
    sede: cita.sede,
    direccion: obtenerDireccion(cita.sede),
    consultorio: cita.consultorio,
    tipo: cita.tipo || "CONSULTA",
    entidad: cita.entidad || "PARTICULAR",
    observacion: limpiarObservacion(cita.observacion),
  };
}

/**
 * Envía mensajes desde el JSON
 */
async function main() {
  console.log("\n╔═══════════════════════════════════════════════════╗");
  console.log("║   📤 ENVÍO DE MENSAJES DESDE JSON DE PRUEBA     ║");
  console.log("╚═══════════════════════════════════════════════════╝\n");

  // Leer el archivo JSON de prueba
  const jsonPath = path.join(__dirname, "../test-api-data.json");
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  console.log(`📊 Total de citas en el JSON: ${jsonData.data.length}\n`);

  // Filtrar citas con teléfono válido y que NO estén canceladas
  const citasValidas = jsonData.data.filter((c: CitaAPI) => {
    const estadoLower = (c.estado || "").toLowerCase();
    const estaCancelada =
      estadoLower.includes("cancel") ||
      estadoLower.includes("cancelo") ||
      estadoLower === "cancelado" ||
      estadoLower === "cancelada";

    // Validar que el teléfono exista y sea válido (acepta múltiples formatos)
    const tieneNumeroValido = c.telefono && esNumeroValido(c.telefono);

    return tieneNumeroValido && !estaCancelada;
  });

  const citasCanceladas = jsonData.data.length - citasValidas.length;
  console.log(
    `✅ Citas válidas (con teléfono y NO canceladas): ${citasValidas.length}`,
  );
  if (citasCanceladas > 0) {
    console.log(
      `🚫 Citas omitidas (sin teléfono o canceladas): ${citasCanceladas}\n`,
    );
  } else {
    console.log(
      `❌ Citas sin teléfono: ${jsonData.data.length - citasValidas.length}\n`,
    );
  }

  if (citasValidas.length === 0) {
    console.log("⚠️  No hay citas con teléfono para enviar\n");
    return;
  }

  // Usar la nueva plantilla v4 (con 10 parámetros)
  const templateName = config.meta.templateName; // Lee desde .env
  console.log(`📝 Usando plantilla: ${templateName}\n`);
  console.log(
    `✅ Esta plantilla incluye dirección, observaciones y WhatsApp de contacto\n`,
  );
  console.log(
    `⚠️  Asegúrate de que la plantilla esté APROBADA antes de ejecutar\n`,
  );

  let exitosos = 0;
  let fallidos = 0;

  // Enviar cada cita
  for (let i = 0; i < citasValidas.length; i++) {
    const cita = citasValidas[i];
    const procesada = procesarCita(cita);

    console.log(`\n${"=".repeat(80)}`);
    console.log(
      `📋 CITA ${i + 1}/${citasValidas.length} - ID: ${procesada.citaId}`,
    );
    console.log("=".repeat(80));
    console.log(`\n👤 Paciente:    ${procesada.nombre}`);
    console.log(`📞 Teléfono:    ${procesada.telefono}`);
    console.log(`📅 Fecha:       ${procesada.fecha}`);
    console.log(`⏰ Hora:        ${procesada.hora}`);
    console.log(`👨‍⚕️ Médico:      ${procesada.medico}`);
    console.log(`🏢 Sede:        ${procesada.sede}`);
    console.log(`� Dirección:   ${procesada.direccion}`);
    console.log(`📋 Tipo:        ${procesada.tipo}`);
    console.log(`💳 Entidad:     ${procesada.entidad}`);
    console.log(`📝 Observación: ${procesada.observacion}`);

    // Crear parámetros usando el servicio (detecta automáticamente 9 o 10 parámetros según plantilla)
    const citaParaPlantilla = {
      nombre: procesada.nombre,
      requerida: cita.requerida,
      hora: cita.hora,
      ampm: cita.ampm,
      medico: procesada.medico,
      sede: procesada.sede,
      tipo: procesada.tipo,
      entidad: procesada.entidad,
      observacion: procesada.observacion,
      telefono: procesada.telefono,
      id: procesada.citaId,
      consultorio: cita.consultorio,
      td: cita.td,
      documento: cita.documento,
      estado: cita.estado,
      motivoCancela: cita.motivoCancela,
      fechaSolicita: cita.fechaSolicita,
      concepto: cita.concepto,
      orden: cita.orden,
      creadaPor: cita.creadaPor,
      modificadaPor: cita.modificadaPor,
      actualizada: cita.actualizada,
      impresa: cita.impresa,
    };

    const parametros = metaTemplateService.crearParametros(citaParaPlantilla);

    console.log(`\n📋 Parámetros generados: ${parametros.length}`);
    console.log(`   WhatsApp contacto: ${parametros[9] || "N/A"}`);

    console.log(`\n📤 Enviando mensaje...`);

    try {
      const resultado = await metaWhatsappService.enviarMensajePlantilla(
        procesada.telefono,
        templateName,
        parametros,
      );

      if (resultado.success) {
        console.log(`✅ ¡Mensaje enviado exitosamente!`);
        console.log(`   📨 Message ID: ${resultado.messageId}`);

        // Guardar en base de datos
        guardarMensaje({
          citaId: procesada.citaId,
          nombrePaciente: procesada.nombre,
          telefono: procesada.telefono,
          mensaje: `Recordatorio enviado para ${procesada.fecha} a las ${procesada.hora}`,
          plantillaId: templateName,
          fechaCita: cita.requerida,
          medico: procesada.medico,
          sede: procesada.sede,
        });

        exitosos++;
      } else {
        console.log(`❌ Error al enviar mensaje: ${resultado.error}`);
        fallidos++;
      }
    } catch (error: any) {
      console.log(`❌ Error inesperado: ${error.message}`);
      fallidos++;
    }

    // Delay de 1 segundo entre mensajes
    if (i < citasValidas.length - 1) {
      console.log(`\n⏳ Esperando 1 segundo antes del siguiente envío...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Resumen final
  console.log(`\n${"=".repeat(80)}`);
  console.log("📊 RESUMEN FINAL");
  console.log("=".repeat(80));
  console.log(`   📨 Total enviados:  ${citasValidas.length}`);
  console.log(`   ✅ Exitosos:        ${exitosos}`);
  console.log(`   ❌ Fallidos:        ${fallidos}`);
  console.log(
    `   📈 Tasa de éxito:   ${((exitosos / citasValidas.length) * 100).toFixed(1)}%\n`,
  );

  if (exitosos > 0) {
    console.log(
      "💡 Revisa tu WhatsApp (+573216779467) para confirmar la recepción\n",
    );
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
