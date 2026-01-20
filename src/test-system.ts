import logger from './utils/logger';
import metaWhatsappService from './services/meta-whatsapp.service';
import metaTemplateService from './services/meta-template.service';
import apiService from './services/api.service';
import { initDatabase, guardarMensaje, obtenerEstadisticasHoy } from './database/db';

/**
 * Script de pruebas para validar el sistema
 */

// Inicializar base de datos
initDatabase();

async function pruebaConexionMeta() {
  console.log('\n🧪 === PRUEBA 1: Conexión con Meta WhatsApp ===\n');

  try {
    // Verificar configuración
    const configurado = metaWhatsappService.verificarConfiguracion();
    
    if (!configurado) {
      console.log('❌ Meta WhatsApp NO está configurado');
      console.log('💡 Configura las variables en .env:\n');
      console.log('   - META_ACCESS_TOKEN');
      console.log('   - META_PHONE_NUMBER_ID');
      console.log('   - META_WABA_ID\n');
      return false;
    }

    console.log('✅ Configuración de Meta encontrada');

    // Obtener perfil de negocio
    console.log('📱 Obteniendo perfil de WhatsApp Business...');
    const perfil = await metaWhatsappService.obtenerPerfilNegocio();
    
    console.log('✅ Perfil obtenido exitosamente:');
    console.log(`   📞 Número: ${perfil.display_phone_number}`);
    console.log(`   ✓ Nombre verificado: ${perfil.verified_name}`);
    console.log(`   ⭐ Calidad: ${perfil.quality_rating || 'N/A'}`);
    
    return true;
  } catch (error: any) {
    console.log('❌ Error al conectar con Meta:');
    console.log(`   ${error.message}`);
    
    if (error.response?.data) {
      console.log('\n📋 Detalles del error:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    return false;
  }
}

async function pruebaPlantilla() {
  console.log('\n🧪 === PRUEBA 2: Verificar Plantilla ===\n');

  try {
    const templateName = metaTemplateService.obtenerNombrePlantilla();
    console.log(`📝 Buscando plantilla: "${templateName}"`);

    const plantillas = await metaWhatsappService.verificarPlantilla(templateName);
    
    if (!plantillas || plantillas.length === 0) {
      console.log('❌ Plantilla NO encontrada');
      console.log('💡 Crea la plantilla en Meta WhatsApp Manager:');
      console.log(`   Nombre: ${templateName}`);
      console.log('   Ver: docs/SETUP-META-WHATSAPP.md\n');
      return false;
    }

    const plantilla = plantillas[0];
    console.log('✅ Plantilla encontrada:');
    console.log(`   📝 Nombre: ${plantilla.name}`);
    console.log(`   ✓ Estado: ${plantilla.status}`);
    console.log(`   🌍 Idioma: ${plantilla.language}`);
    console.log(`   📂 Categoría: ${plantilla.category}`);

    if (plantilla.status !== 'APPROVED') {
      console.log('\n⚠️  ADVERTENCIA: La plantilla NO está aprobada');
      console.log(`   Estado actual: ${plantilla.status}`);
      console.log('   Espera la aprobación de Meta (24-48 hrs)\n');
      return false;
    }

    return true;
  } catch (error: any) {
    console.log('❌ Error al verificar plantilla:');
    console.log(`   ${error.message}\n`);
    return false;
  }
}

async function pruebaAPI() {
  console.log('\n🧪 === PRUEBA 3: API de Citas ===\n');

  try {
    console.log('📡 Consultando API de citas...');
    const citas = await apiService.obtenerCitas();
    
    console.log(`✅ API respondió correctamente`);
    console.log(`   📋 Total de citas: ${citas.length}`);
    
    if (citas.length > 0) {
      const citaEjemplo = citas[0];
      console.log('\n📝 Ejemplo de cita:');
      console.log(`   👤 Paciente: ${citaEjemplo.nombre}`);
      console.log(`   📅 Fecha: ${citaEjemplo.requerida}`);
      console.log(`   👨‍⚕️ Médico: ${citaEjemplo.medico}`);
      console.log(`   🏢 Sede: ${citaEjemplo.sede}`);
      console.log(`   📞 Teléfono: ${citaEjemplo.telefono}`);
      console.log(`   ✓ Estado: ${citaEjemplo.estado}`);
    }

    return true;
  } catch (error: any) {
    console.log('❌ Error al consultar API de citas:');
    console.log(`   ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 La API no está accesible');
      console.log('   Verifica la URL en .env: API_URL\n');
    }
    
    return false;
  }
}

async function pruebaEnvioMensaje(telefono: string) {
  console.log('\n🧪 === PRUEBA 4: Envío de Mensaje ===\n');

  if (!telefono) {
    console.log('⚠️  No se proporcionó número de teléfono');
    console.log('💡 Uso: npm run test -- +573001234567\n');
    return false;
  }

  try {
    console.log(`📱 Enviando mensaje de prueba a: ${telefono}`);
    
    // Crear datos de cita de prueba
    const citaPrueba = {
      id: 999999,
      nombre: 'PACIENTE DE PRUEBA',
      telefono: telefono,
      medico: 'DR. PRUEBA TEST',
      sede: 'SEDE PRUEBA',
      consultorio: 'CONSULTORIO 999',
      hora: 1000,
      ampm: 'AM',
      requerida: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mañana
      tipo: 'CONSULTA',
      concepto: 'PRUEBA SISTEMA',
      entidad: 'EPS PRUEBA',
      estado: 'AGENDADO',
      td: 'CC',
      documento: '1234567890',
      motivoCancela: '',
      fechaSolicita: new Date().toISOString().split('T')[0],
      observacion: 'Este es un mensaje de prueba del sistema',
      orden: 1,
      creadaPor: 'SISTEMA',
      modificadaPor: 'SISTEMA',
      actualizada: new Date().toISOString(),
      impresa: null,
    };

    // Preparar parámetros de plantilla
    const templateName = metaTemplateService.obtenerNombrePlantilla();
    const parametros = metaTemplateService.crearParametrosRecordatorio(citaPrueba as any);

    console.log('\n📝 Parámetros del mensaje:');
    parametros.forEach((param, index) => {
      console.log(`   {{${index + 1}}} = ${param}`);
    });

    console.log('\n📤 Enviando...');
    const resultado = await metaWhatsappService.enviarMensajePlantilla(
      telefono,
      templateName,
      parametros
    );

    if (resultado.success) {
      console.log('✅ ¡Mensaje enviado exitosamente!');
      console.log(`   📨 Message ID: ${resultado.messageId}`);
      console.log('\n💡 Revisa tu WhatsApp para confirmar la recepción');
      
      // Guardar en base de datos
      const mensajeId = guardarMensaje({
        citaId: citaPrueba.id,
        nombrePaciente: citaPrueba.nombre,
        telefono: citaPrueba.telefono,
        mensaje: metaTemplateService.crearMensajePreview(citaPrueba as any),
        plantillaId: templateName,
        fechaCita: citaPrueba.requerida,
        medico: citaPrueba.medico,
        sede: citaPrueba.sede,
      });
      
      console.log(`   💾 Guardado en DB con ID: ${mensajeId}`);
      
      return true;
    } else {
      console.log('❌ Error al enviar mensaje:');
      console.log(`   ${resultado.error}`);
      return false;
    }
  } catch (error: any) {
    console.log('❌ Error inesperado:');
    console.log(`   ${error.message}\n`);
    return false;
  }
}

async function pruebaEstadisticas() {
  console.log('\n🧪 === PRUEBA 5: Estadísticas ===\n');

  try {
    const stats = obtenerEstadisticasHoy();
    
    console.log('📊 Estadísticas del día:');
    console.log(`   📨 Total enviados: ${stats.total_enviados}`);
    console.log(`   ✅ Entregados: ${stats.total_entregados}`);
    console.log(`   👀 Leídos: ${stats.total_leidos}`);
    console.log(`   ❌ Fallidos: ${stats.total_fallidos}`);
    console.log(`   📈 Tasa de entrega: ${stats.tasa_entrega.toFixed(1)}%`);
    console.log(`   📖 Tasa de lectura: ${stats.tasa_lectura.toFixed(1)}%`);
    
    return true;
  } catch (error: any) {
    console.log('❌ Error al obtener estadísticas:');
    console.log(`   ${error.message}\n`);
    return false;
  }
}

// Ejecutar pruebas
async function ejecutarPruebas() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   🧪 SISTEMA DE PRUEBAS - RECORDATORIOS META     ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  const telefono = process.argv[2]; // npm run test -- +573001234567

  const resultados = {
    conexionMeta: false,
    plantilla: false,
    api: false,
    envioMensaje: false,
    estadisticas: false,
  };

  // Prueba 1: Conexión Meta
  resultados.conexionMeta = await pruebaConexionMeta();

  // Prueba 2: Plantilla
  if (resultados.conexionMeta) {
    resultados.plantilla = await pruebaPlantilla();
  }

  // Prueba 3: API
  resultados.api = await pruebaAPI();

  // Prueba 4: Envío (solo si todo lo anterior funciona)
  if (resultados.conexionMeta && resultados.plantilla && telefono) {
    resultados.envioMensaje = await pruebaEnvioMensaje(telefono);
  } else if (!telefono) {
    console.log('\n⚠️  Omitiendo prueba de envío (no se proporcionó teléfono)');
    console.log('💡 Para probar envío: npm run test -- +573001234567\n');
  }

  // Prueba 5: Estadísticas
  resultados.estadisticas = await pruebaEstadisticas();

  // Resumen
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║              📊 RESUMEN DE PRUEBAS                ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  const simbolo = (resultado: boolean) => resultado ? '✅' : '❌';

  console.log(`${simbolo(resultados.conexionMeta)} Conexión con Meta WhatsApp`);
  console.log(`${simbolo(resultados.plantilla)} Plantilla configurada y aprobada`);
  console.log(`${simbolo(resultados.api)} API de citas accesible`);
  console.log(`${simbolo(resultados.envioMensaje || !telefono)} Envío de mensaje ${!telefono ? '(no probado)' : ''}`);
  console.log(`${simbolo(resultados.estadisticas)} Sistema de estadísticas`);

  const totalPruebas = Object.values(resultados).filter(Boolean).length;
  const totalEsperado = telefono ? 5 : 4;

  console.log(`\n📈 Resultado: ${totalPruebas}/${totalEsperado} pruebas exitosas`);

  if (totalPruebas === totalEsperado) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! Sistema listo para producción\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa la configuración.\n');
    console.log('📖 Consulta: docs/SETUP-META-WHATSAPP.md\n');
    process.exit(1);
  }
}

// Ejecutar
ejecutarPruebas().catch((error) => {
  console.error('\n❌ Error fatal en las pruebas:', error);
  process.exit(1);
});
