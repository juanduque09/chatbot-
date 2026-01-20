import axios, { AxiosInstance } from "axios";
import config from "../config/env";
import logger from "../utils/logger";
import { formatearTelefonoWhatsApp } from "../utils/phone.utils";

/**
 * Servicio para enviar mensajes por WhatsApp usando Meta Business API
 */
class MetaWhatsAppService {
  private client: AxiosInstance;
  private phoneNumberId: string;
  private accessToken: string;
  private apiVersion: string = "v18.0";

  constructor() {
    this.phoneNumberId = config.meta.phoneNumberId;
    this.accessToken = config.meta.accessToken;

    this.client = axios.create({
      baseURL: `https://graph.facebook.com/${this.apiVersion}`,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 segundos
    });
  }

  /**
   * Enviar mensaje usando plantilla
   */
  async enviarMensajePlantilla(
    telefono: string,
    templateName: string,
    parametros: string[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const telefonoFormateado = formatearTelefonoWhatsApp(telefono);

      logger.info(`📤 Enviando WhatsApp (Meta) a ${telefono}...`);

      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: telefonoFormateado,
          type: "template",
          template: {
            name: templateName,
            language: {
              code: "es", // Español
            },
            components: [
              {
                type: "body",
                parameters: parametros.map((text) => ({
                  type: "text",
                  text: text,
                })),
              },
            ],
          },
        }
      );

      const messageId = response.data.messages[0].id;

      logger.info(`✅ Mensaje enviado exitosamente. Message ID: ${messageId}`);

      return {
        success: true,
        messageId,
      };
    } catch (error: any) {
      const errorMsg = this.extraerErrorMeta(error);

      logger.error(`❌ Error al enviar WhatsApp a ${telefono}:`, {
        error: errorMsg,
        code: error.response?.data?.error?.code,
        subcode: error.response?.data?.error?.error_subcode,
      });

      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Enviar mensaje de texto simple (solo funciona si hay conversación abierta)
   */
  async enviarMensajeTexto(
    telefono: string,
    texto: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const telefonoFormateado = formatearTelefonoWhatsApp(telefono);

      logger.info(`📤 Enviando mensaje de texto a ${telefono}...`);

      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: telefonoFormateado,
          type: "text",
          text: {
            body: texto,
          },
        }
      );

      const messageId = response.data.messages[0].id;

      logger.info(`✅ Mensaje de texto enviado. Message ID: ${messageId}`);

      return {
        success: true,
        messageId,
      };
    } catch (error: any) {
      const errorMsg = this.extraerErrorMeta(error);

      logger.error(`❌ Error al enviar texto a ${telefono}:`, errorMsg);

      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Enviar múltiples mensajes con delay y reintentos
   */
  async enviarMensajesLote(
    mensajes: Array<{
      telefono: string;
      templateName: string;
      parametros: string[];
      nombre: string;
      citaId: number;
    }>
  ): Promise<{
    exitosos: number;
    fallidos: number;
    resultados: Array<{
      citaId: number;
      nombre: string;
      telefono: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }>;
  }> {
    let exitosos = 0;
    let fallidos = 0;
    const resultados: Array<any> = [];

    logger.info(`📨 Iniciando envío de ${mensajes.length} mensajes...`);

    for (const item of mensajes) {
      try {
        const resultado = await this.enviarMensajePlantilla(
          item.telefono,
          item.templateName,
          item.parametros
        );

        if (resultado.success) {
          exitosos++;
          logger.info(`   ✅ ${item.nombre} (${item.telefono})`);
        } else {
          fallidos++;
          logger.warn(
            `   ❌ ${item.nombre} (${item.telefono}): ${resultado.error}`
          );
        }

        resultados.push({
          citaId: item.citaId,
          nombre: item.nombre,
          telefono: item.telefono,
          success: resultado.success,
          messageId: resultado.messageId,
          error: resultado.error,
        });

        // Delay de 500ms entre mensajes (Meta permite ~80 msg/seg)
        await this.delay(500);
      } catch (error) {
        fallidos++;
        logger.error(`   ❌ Error con ${item.nombre}:`, error);

        resultados.push({
          citaId: item.citaId,
          nombre: item.nombre,
          telefono: item.telefono,
          success: false,
          error: "Error inesperado",
        });
      }
    }

    logger.info(`\n📊 Resumen de envío:`);
    logger.info(`   ✅ Exitosos: ${exitosos}`);
    logger.info(`   ❌ Fallidos: ${fallidos}`);
    logger.info(
      `   📈 Tasa de éxito: ${((exitosos / mensajes.length) * 100).toFixed(1)}%`
    );

    return { exitosos, fallidos, resultados };
  }

  /**
   * Enviar mensaje de prueba
   */
  async enviarMensajePrueba(telefono: string): Promise<boolean> {
    // Para pruebas, usamos mensaje de texto simple
    const resultado = await this.enviarMensajeTexto(
      telefono,
      "🧪 *Mensaje de Prueba*\n\nEste es un mensaje de prueba del sistema de recordatorios automáticos de Clínica Láser.\n\nSi recibió este mensaje, el sistema está funcionando correctamente. ✅"
    );

    return resultado.success;
  }

  /**
   * Verificar configuración de Meta
   */
  verificarConfiguracion(): boolean {
    const configurado = !!(
      this.accessToken &&
      this.phoneNumberId &&
      this.accessToken !== "tu_token_aqui" &&
      this.phoneNumberId !== "tu_phone_number_id"
    );

    if (!configurado) {
      logger.warn("⚠️  Configuración de Meta incompleta en .env");
    }

    return configurado;
  }

  /**
   * Obtener información del perfil de WhatsApp Business
   */
  async obtenerPerfilNegocio(): Promise<any> {
    try {
      const response = await this.client.get(`/${this.phoneNumberId}`, {
        params: {
          fields: "display_phone_number,verified_name,quality_rating",
        },
      });

      return response.data;
    } catch (error: any) {
      logger.error("❌ Error al obtener perfil de negocio:", error.message);
      throw error;
    }
  }

  /**
   * Verificar estado de una plantilla
   */
  async verificarPlantilla(templateName: string): Promise<any> {
    try {
      const response = await this.client.get(
        `/${config.meta.wabaId}/message_templates`,
        {
          params: {
            name: templateName,
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      logger.error(
        `❌ Error al verificar plantilla ${templateName}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Marcar mensaje como leído
   */
  async marcarComoLeido(messageId: string): Promise<void> {
    try {
      await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      });
    } catch (error: any) {
      logger.error(
        `❌ Error al marcar mensaje ${messageId} como leído:`,
        error.message
      );
    }
  }

  /**
   * Extraer mensaje de error de Meta API
   */
  private extraerErrorMeta(error: any): string {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      const metaError = error.response.data.error;
      return `${metaError.message} (Code: ${metaError.code})`;
    }
    return error.message || "Error desconocido";
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Obtener límites de rate limiting
   */
  async obtenerLimitesAPI(): Promise<any> {
    try {
      // Los headers de respuesta incluyen info de rate limits
      const response = await this.client.get(`/${this.phoneNumberId}`);

      return {
        callCount: response.headers["x-business-use-case-usage"],
        appUsage: response.headers["x-app-usage"],
      };
    } catch (error: any) {
      logger.error("❌ Error al obtener límites de API:", error.message);
      return null;
    }
  }
}

export default new MetaWhatsAppService();
