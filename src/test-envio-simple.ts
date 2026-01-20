import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

/**
 * Script simple para enviar mensaje de texto a WhatsApp
 * NOTA: Los mensajes de texto solo funcionan si hay una conversación abierta (usuario escribió en últimas 24hrs)
 * Para iniciar conversaciones nuevas, DEBES usar plantillas aprobadas.
 */

const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || "";
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "";
const DESTINATARIO = process.argv[2] || "+573216779467";

async function enviarMensajeTexto(telefono: string, mensaje: string) {
  try {
    console.log(`\n📤 Intentando enviar mensaje a: ${telefono}`);
    console.log(`📝 Mensaje: ${mensaje}\n`);

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: telefono,
        type: "text",
        text: {
          body: mensaje,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ ¡Mensaje enviado exitosamente!");
    console.log("📨 Message ID:", response.data.messages[0].id);
    console.log("\n💡 Revisa tu WhatsApp para confirmar la recepción\n");

    return response.data;
  } catch (error: any) {
    console.error("❌ Error al enviar mensaje:");

    if (error.response?.data) {
      const errorData = error.response.data.error;
      console.error(`\n🔴 ${errorData.message}`);
      console.error(`📋 Code: ${errorData.code}`);
      console.error(`📋 Subcode: ${errorData.error_subcode || "N/A"}`);

      if (errorData.code === 131026 || errorData.error_subcode === 2388113) {
        console.error("\n💡 SOLUCIÓN:");
        console.error(
          "   Este error ocurre porque NO hay una conversación abierta.",
        );
        console.error("   Para iniciar conversaciones, necesitas:");
        console.error("   1. Crear una plantilla en Meta WhatsApp Manager");
        console.error("   2. Esperar aprobación (24-48 hrs)");
        console.error("   3. Usar esa plantilla para enviar mensajes");
        console.error("\n   O bien:");
        console.error("   - El usuario debe escribirte primero");
        console.error(
          "   - Luego puedes responder con texto libre (ventana de 24hrs)",
        );
      }
    } else {
      console.error(error.message);
    }

    throw error;
  }
}

// Ejecutar
const mensaje = `🧪 *Prueba del Sistema de Recordatorios*

Hola! Este es un mensaje de prueba del sistema automatizado de recordatorios de Unidad Oftalmológica Laser S.A.

Si recibes este mensaje, significa que la conexión con Meta WhatsApp Business está funcionando correctamente. ✅

_Enviado desde el sistema de recordatorios automáticos_`;

enviarMensajeTexto(DESTINATARIO, mensaje)
  .then(() => {
    console.log("✨ Proceso completado exitosamente");
    process.exit(0);
  })
  .catch(() => {
    console.log("\n⚠️  El envío falló");
    process.exit(1);
  });
