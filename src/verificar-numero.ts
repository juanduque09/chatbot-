import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || "";
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "";

/**
 * Verifica si un número tiene WhatsApp activo
 */
async function verificarNumero(telefono: string) {
  try {
    console.log(`\n🔍 Verificando número: ${telefono}\n`);

    // Intentar enviar un mensaje de prueba (sin realmente enviarlo)
    // o consultar el estado del número
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: telefono,
        type: "text",
        text: {
          preview_url: false,
          body: "Verificación",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        validateStatus: () => true, // Aceptar cualquier código de estado
      },
    );

    if (response.status === 200) {
      console.log("✅ El número tiene WhatsApp activo");
      console.log("📨 Message ID:", response.data.messages[0].id);
      console.log(
        "\n⚠️  NOTA: Se envió un mensaje de prueba. Revisa el WhatsApp.",
      );
      return true;
    } else if (response.data.error?.code === 133010) {
      console.log("❌ El número NO está registrado en WhatsApp");
      console.log(
        "💡 El usuario debe instalar y activar WhatsApp en ese número",
      );
      return false;
    } else if (response.data.error?.code === 131026) {
      console.log(
        "⚠️  El número tiene WhatsApp, pero no hay conversación abierta",
      );
      console.log(
        "💡 Necesitas usar una plantilla aprobada para iniciar la conversación",
      );
      return true;
    } else {
      console.log("⚠️  Estado desconocido:");
      console.log(JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error: any) {
    console.error("❌ Error al verificar:", error.message);
    return false;
  }
}

// Ejecutar
const numero = process.argv[2] || "+573216779467";
verificarNumero(numero)
  .then((existe) => {
    process.exit(existe ? 0 : 1);
  })
  .catch(() => {
    process.exit(1);
  });
