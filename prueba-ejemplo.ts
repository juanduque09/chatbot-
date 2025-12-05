import { config } from 'dotenv';
config();

/**
 * Script de prueba rápida
 * Este script simula el envío de recordatorios usando los datos de ejemplo-citas.json
 */

// Importar los datos de ejemplo
const citasEjemplo = require('./ejemplo-citas.json');

console.log('🧪 PRUEBA RÁPIDA - Sistema de Recordatorios');
console.log('='.repeat(50));
console.log('\n📄 Datos cargados desde: ejemplo-citas.json');
console.log(`📊 Total de citas: ${citasEjemplo.length}`);

// Filtrar solo las citas AGENDADAS
const citasAgendadas = citasEjemplo.filter(
  (cita: any) => cita.estado === 'AGENDADO'
);

console.log(`✅ Citas AGENDADAS: ${citasAgendadas.length}`);
console.log(`❌ Citas CANCELADAS: ${citasEjemplo.filter((c: any) => c.estado === 'CANCELADO').length}`);
console.log(`⏺️  Citas ATENDIDAS: ${citasEjemplo.filter((c: any) => c.estado === 'ATENDIDO').length}`);

console.log('\n' + '='.repeat(50));
console.log('📱 Citas que recibirán recordatorio:');
console.log('='.repeat(50));

citasAgendadas.forEach((cita: any, index: number) => {
  const horaFormateada = `${Math.floor(cita.hora / 100)}:${String(cita.hora % 100).padStart(2, '0')} ${cita.ampm}`;
  
  console.log(`\n${index + 1}. ${cita.nombre}`);
  console.log(`   📞 Teléfono: ${cita.telefono}`);
  console.log(`   🕐 Hora: ${horaFormateada}`);
  console.log(`   👨‍⚕️ Médico: ${cita.medico}`);
  console.log(`   🏢 Sede: ${cita.sede}`);
  console.log(`   📍 Consultorio: ${cita.consultorio}`);
  console.log(`   📅 Fecha: ${cita.fechaSolicita}`);
});

console.log('\n' + '='.repeat(50));
console.log('💬 Ejemplo de mensaje que se enviará:');
console.log('='.repeat(50));

const primeraCita = citasAgendadas[0];
const horaFormateada = `${Math.floor(primeraCita.hora / 100)}:${String(primeraCita.hora % 100).padStart(2, '0')} ${primeraCita.ampm}`;

const mensajeEjemplo = `
🏥 RECORDATORIO DE CITA

Estimado/a ${primeraCita.nombre},

Le recordamos su cita programada para mañana:

📅 Fecha: ${primeraCita.fechaSolicita}
🕐 Hora: ${horaFormateada}
🏢 Sede: ${primeraCita.sede}
👨‍⚕️ Médico: ${primeraCita.medico}
📍 Consultorio: ${primeraCita.consultorio}

Por favor, llegue 15 minutos antes de su cita.

¡Gracias por confiar en nosotros!
`;

console.log(mensajeEjemplo);

console.log('='.repeat(50));
console.log('\n✅ Para enviar estos recordatorios reales:');
console.log('   1. Configura tus credenciales de Twilio en .env');
console.log('   2. Ejecuta: npm run dev');
console.log('   3. Haz POST a: http://localhost:3000/api/ejecutar-recordatorios');
console.log('\n💡 O usa el endpoint de prueba individual:');
console.log('   POST http://localhost:3000/api/prueba-whatsapp');
console.log(`   { "telefono": "${primeraCita.telefono}", "citaData": {...} }`);
console.log('\n');
