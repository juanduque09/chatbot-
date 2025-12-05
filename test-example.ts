/**
 * Script de prueba para simular el comportamiento del sistema
 * sin necesidad de tener la API real o credenciales de Twilio
 */

import { parseHora, getFechaMañana, formatearFechaLegible } from './src/utils/date.utils';
import { formatearTelefonoWhatsApp, esNumeroValido } from './src/utils/phone.utils';

// Datos de ejemplo (simula respuesta de tu API)
const citasEjemplo = [
//   {
//     hora: 759,
//     ampm: "AM",
//     consultorio: "CONSULTORIO1",
//     nombre: "JOSE SIERRA",
//     telefono: "3012984337",
//     td: "TI",
//     documento: "1110973203",
//     estado: "PENDIENTE",
//     motivoCancela: "",
//     fechaSolicita: "2025-11-12",
//     entidad: "PLAN CLINICA LASER",
//     tipo: "ECOGRAFIA",
//     concepto: "TRATAMIENTO",
//     observacion: "OD $150.000 \nASISTIR 20 MIN ANTES // ORDEN MEDICA // DOCUMENTO DE IDENTIFICACIÓN.",
//     orden: 0,
//     medico: "OSCAR VELEZ",
//     requerida: getFechaMañana(), // Fecha de mañana
//     creadaPor: "MARIA",
//     modificadaPor: "RENATA",
//     actualizada: "11/11/2025 9:52:42 a. m.",
//     id: 648444,
//     impresa: null,
//     sede: "PEREIRA"
//   },
//   {
//     hora: 1030,
//     ampm: "AM",
//     consultorio: "CONSULTORIO2",
//     nombre: "MARIA RODRIGUEZ",
//     telefono: "3157894561",
//     td: "CC",
//     documento: "98765432",
//     estado: "PENDIENTE",
//     motivoCancela: "",
//     fechaSolicita: "2025-11-12",
//     entidad: "EPS SURA",
//     tipo: "CONSULTA",
//     concepto: "CONTROL",
//     observacion: "Traer exámenes previos",
//     orden: 0,
//     medico: "VICTOR VELEZ",
//     requerida: getFechaMañana(),
//     creadaPor: "RENATA",
//     modificadaPor: "RENATA",
//     actualizada: "11/11/2025 10:00:00 a. m.",
//     id: 648445,
//     impresa: null,
//     sede: "PEREIRA"
//   },
  {
    hora: 1400,
    ampm: "PM",
    consultorio: "CONSULTORIO3",
    nombre: "Prueba Sin Nombre",
    telefono: "3206233559", // Teléfono inválido (solo 9 dígitos)
    td: "CC",
    documento: "12345678",
    estado: "PENDIENTE", // Esta cita está pendiente
    motivoCancela: "Cliente canceló",
    fechaSolicita: "2025-11-12",
    entidad: "PARTICULAR",
    tipo: "CIRUGIA",
    concepto: "PROCEDIMIENTO",
    observacion: "En ayunas",
    orden: 0,
    medico: "OSCAR VELEZ",
    requerida: getFechaMañana(),
    creadaPor: "MARIA",
    modificadaPor: "MARIA",
    actualizada: "11/11/2025 11:00:00 a. m.",
    id: 648446,
    impresa: null,
    sede: "OTRA_SEDE"
  }
];

console.log('═══════════════════════════════════════════════════');
console.log('🧪 PRUEBA DEL SISTEMA DE RECORDATORIOS');
console.log('═══════════════════════════════════════════════════\n');

console.log(`📅 Fecha de mañana: ${getFechaMañana()}`);
console.log(`📅 Fecha legible: ${formatearFechaLegible(getFechaMañana())}\n`);

console.log('📋 Procesando citas de ejemplo...\n');

citasEjemplo.forEach((cita, index) => {
  console.log(`\n--- Cita ${index + 1} ---`);
  console.log(`👤 Nombre: ${cita.nombre}`);
  console.log(`📞 Teléfono: ${cita.telefono}`);
  console.log(`📱 WhatsApp: ${formatearTelefonoWhatsApp(cita.telefono)}`);
  console.log(`✅ Teléfono válido: ${esNumeroValido(cita.telefono) ? 'Sí' : 'No'}`);
  console.log(`🕐 Hora: ${parseHora(cita.hora)} ${cita.ampm}`);
  console.log(`👨‍⚕️ Médico: ${cita.medico}`);
  console.log(`🏢 Sede: ${cita.sede}`);
  console.log(`📊 Estado: ${cita.estado}`);
  console.log(`🔔 Enviar recordatorio: ${
    cita.estado !== 'CANCELADO' && 
    cita.estado !== 'CANCELADA' && 
    esNumeroValido(cita.telefono) ? '✅ SÍ' : '❌ NO'
  }`);
});

console.log('\n═══════════════════════════════════════════════════');
console.log('📊 RESUMEN');
console.log('═══════════════════════════════════════════════════');

const citasValidas = citasEjemplo.filter(c => 
  c.estado !== 'CANCELADO' && 
  c.estado !== 'CANCELADA' && 
  esNumeroValido(c.telefono)
);

console.log(`📋 Total de citas: ${citasEjemplo.length}`);
console.log(`✅ Citas válidas para recordatorio: ${citasValidas.length}`);
console.log(`❌ Citas excluidas: ${citasEjemplo.length - citasValidas.length}`);

console.log('\n💡 Para ejecutar el sistema real:');
console.log('   1. Configura el archivo .env con tus credenciales');
console.log('   2. Ejecuta: npm run dev');
console.log('   3. Prueba con: curl -X POST http://localhost:3000/api/ejecutar-recordatorios\n');
