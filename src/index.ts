import express, { Request, Response } from 'express';
import { validateConfig } from './config/env';
import logger from './utils/logger';
import whatsappService from './services/whatsapp.service';
import templateService from './services/template.service';
import { iniciarCronJob, ejecutarManualmente } from './jobs/reminder.job';

// Validar configuración al iniciar
validateConfig();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/**
 * Ruta de health check
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'chatbot-recordatorios-twilio',
    timestamp: new Date().toISOString(),
    twilioConfigured: whatsappService.verificarConfiguracion(),
  });
});

/**
 * Ruta para verificar configuración de Twilio
 */
app.get('/api/twilio/estado', (_req: Request, res: Response) => {
  const configurado = whatsappService.verificarConfiguracion();
  res.json({
    configurado,
    mensaje: configurado 
      ? '✅ Twilio WhatsApp configurado correctamente' 
      : '❌ Falta configurar TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_WHATSAPP_FROM en .env'
  });
});

/**
 * Ruta para ejecutar recordatorios manualmente
 */
app.post('/api/ejecutar-recordatorios', async (_req: Request, res: Response) => {
  try {
    logger.info('📞 Solicitud manual de ejecución de recordatorios');
    
    // Ejecutar en segundo plano
    ejecutarManualmente().catch((error) => {
      logger.error('Error en ejecución manual:', error);
    });

    res.json({
      success: true,
      message: 'Proceso de recordatorios iniciado con Twilio WhatsApp',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error al ejecutar recordatorios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al ejecutar recordatorios',
    });
  }
});

/**
 * Ruta para enviar mensaje de prueba con Twilio WhatsApp
 */
app.post('/api/prueba-whatsapp', async (req: Request, res: Response) => {
  try {
    const { telefono, mensaje, ...citaData } = req.body;

    if (!telefono) {
      return res.status(400).json({
        success: false,
        message: 'Falta el parámetro "telefono"',
      });
    }

    logger.info(`🧪 Enviando mensaje de prueba a ${telefono} por Twilio WhatsApp`);
    
    // Si hay datos de cita, crear mensaje personalizado y enviar
    if (citaData.nombre) {
      const mensajeEnviar = templateService.crearMensajeRecordatorio(citaData as any);
      const resultado = await whatsappService.enviarMensaje(telefono, mensajeEnviar);
      
      if (resultado) {
        return res.json({
          success: true,
          message: '✅ Mensaje enviado por Twilio WhatsApp',
          telefono,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: '❌ Error al enviar mensaje por Twilio WhatsApp',
        });
      }
    }
    
    // Si no hay datos de cita, enviar mensaje de prueba simple
    const resultado = await whatsappService.enviarMensajePrueba(telefono);

    if (resultado) {
      return res.json({
        success: true,
        message: '✅ Mensaje enviado por Twilio WhatsApp',
        telefono,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: '❌ Error al enviar mensaje por Twilio WhatsApp',
      });
    }
  } catch (error) {
    logger.error('Error al enviar mensaje de prueba:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje de prueba',
    });
  }
});

/**
 * Iniciar servidor
 */
function iniciarServidor() {
  // Verificar configuración de Twilio WhatsApp
  logger.info('📱 WhatsApp: Twilio API');
  
  if (whatsappService.verificarConfiguracion()) {
    logger.info('✅ Twilio WhatsApp configurado correctamente');
  } else {
    logger.warn('⚠️  Twilio WhatsApp NO configurado. Configura .env antes de usar.');
    logger.warn('📖 Lee GUIA_INSTALACION_TWILIO.md para instrucciones');
  }

  // Iniciar cron job
  iniciarCronJob();

  // Iniciar servidor Express
  app.listen(PORT, () => {
    logger.info('═══════════════════════════════════════════════════');
    logger.info('🚀 Sistema de Recordatorios Iniciado');
    logger.info('═══════════════════════════════════════════════════');
    logger.info(`   🌐 Servidor: http://localhost:${PORT}`);
    logger.info(`   📡 Health Check: http://localhost:${PORT}/health`);
    logger.info('═══════════════════════════════════════════════════');
  });
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('👋 SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Iniciar aplicación
iniciarServidor();
