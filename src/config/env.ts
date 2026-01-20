import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

interface Config {
  api: {
    url: string;
    key: string;
  };
  meta: {
    accessToken: string;
    phoneNumberId: string;
    wabaId: string;
    appId: string;
    appSecret: string;
    webhookVerifyToken: string;
    templateName: string;
  };
  cron: {
    schedule: string;
    timezone: string;
  };
  server: {
    port: number;
    webhookPath: string;
  };
  env: string;
  logLevel: string;
}

const config: Config = {
  api: {
    url: process.env.API_URL || "",
    key: process.env.API_KEY || "",
  },
  meta: {
    accessToken: process.env.META_ACCESS_TOKEN || "",
    phoneNumberId: process.env.META_PHONE_NUMBER_ID || "",
    wabaId: process.env.META_WABA_ID || "",
    appId: process.env.META_APP_ID || "",
    appSecret: process.env.META_APP_SECRET || "",
    webhookVerifyToken:
      process.env.META_WEBHOOK_VERIFY_TOKEN || "mi_token_secreto_2024",
    templateName: process.env.META_TEMPLATE_NAME || "recordatorio_cita_v1",
  },
  cron: {
    schedule: process.env.CRON_SCHEDULE || "0 18 * * *", // 6 PM diario por defecto
    timezone: process.env.TZ || "America/Bogota",
  },
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    webhookPath: process.env.WEBHOOK_PATH || "/webhooks/whatsapp",
  },
  env: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || "info",
};

// Validar configuración crítica
export function validateConfig(): void {
  const requiredVars = [
    { key: "API_URL", value: config.api.url },
    { key: "META_ACCESS_TOKEN", value: config.meta.accessToken },
    { key: "META_PHONE_NUMBER_ID", value: config.meta.phoneNumberId },
  ];

  const missing = requiredVars.filter((v) => !v.value);

  if (missing.length > 0) {
    console.warn("⚠️  Faltan las siguientes variables de entorno:");
    missing.forEach((v) => console.warn(`   - ${v.key}`));
    console.warn(
      "\n💡 Configura las credenciales de Meta WhatsApp Business API en .env"
    );
    console.warn("📖 Lee docs/SETUP-META-WHATSAPP.md para más info\n");
    // No detener el servidor, solo advertir
  }
}

export default config;
