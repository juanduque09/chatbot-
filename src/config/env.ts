import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

interface Config {
  api: {
    url: string;
    key: string;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    whatsappFrom: string;
  };
  cron: {
    schedule: string;
  };
  env: string;
  logLevel: string;
}

const config: Config = {
  api: {
    url: process.env.API_URL || '',
    key: process.env.API_KEY || '',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
  },
  cron: {
    schedule: process.env.CRON_SCHEDULE || '0 18 * * *', // 6 PM diario por defecto
  },
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validar configuración crítica
export function validateConfig(): void {
  const requiredVars = [
    { key: 'API_URL', value: config.api.url },
    { key: 'TWILIO_ACCOUNT_SID', value: config.twilio.accountSid },
    { key: 'TWILIO_AUTH_TOKEN', value: config.twilio.authToken },
  ];

  const missing = requiredVars.filter(v => !v.value);

  if (missing.length > 0) {
    console.warn('⚠️  Faltan las siguientes variables de entorno:');
    missing.forEach(v => console.warn(`   - ${v.key}`));
    console.warn('\n💡 Configura las credenciales de Twilio en .env');
    console.warn('📖 Lee GUIA_INSTALACION_TWILIO.md para más info\n');
    // No detener el servidor, solo advertir
  }
}

export default config;
