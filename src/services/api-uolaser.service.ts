import axios, { AxiosInstance } from "axios";
import logger from "../utils/logger";

/**
 * Servicio para conectarse a la API de UOLaser
 */
class ApiUOLaserService {
  private baseURL: string;
  private usuario: string;
  private contrasenia: string;
  private token: string | null = null;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.baseURL = process.env.API_UOLASER_URL || "";
    this.usuario = process.env.API_UOLASER_USUARIO || "";
    this.contrasenia = process.env.API_UOLASER_CONTRASENIA || "";

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    logger.info("🔌 Servicio API UOLaser inicializado");
  }

  /**
   * Autentica con la API y obtiene el token JWT
   */
  async autenticar(): Promise<boolean> {
    try {
      logger.info("🔐 Autenticando con API UOLaser...");

      const response = await this.axiosInstance.post(
        "/api/uolaser/authentication/login",
        {
          usuario: this.usuario,
          contrasenia: this.contrasenia,
        },
      );

      if (response.data.status === "Éxito" && response.data.data.token) {
        this.token = response.data.data.token;
        logger.info("✅ Autenticación exitosa");
        return true;
      }

      logger.error("❌ Error en autenticación:", response.data);
      return false;
    } catch (error: any) {
      logger.error("❌ Error al autenticar:", error.message);
      return false;
    }
  }

  /**
   * Obtiene la agenda de una fecha, médico y sede específicos
   */
  async obtenerAgenda(
    fecha: string,
    medico: string = "",
    sede: string = "",
  ): Promise<any> {
    try {
      // Autenticar si no hay token
      if (!this.token) {
        const autenticado = await this.autenticar();
        if (!autenticado) {
          throw new Error("No se pudo autenticar con la API");
        }
      }

      logger.info(
        `📅 Obteniendo agenda para ${fecha} - Médico: ${medico || "TODOS"} - Sede: ${sede || "TODAS"}`,
      );

      const response = await this.axiosInstance.post(
        "/api/uolaser/services/agenda/obtener",
        {
          fecha,
          medico,
          sede,
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );

      if (response.data.status === "OK") {
        logger.info(`✅ Agenda obtenida: ${response.data.data.length} citas`);
        return response.data;
      }

      logger.error("❌ Error al obtener agenda:", response.data);
      return null;
    } catch (error: any) {
      // Si el token expiró, intentar re-autenticar
      if (error.response?.status === 401) {
        logger.warn("⚠️ Token expirado, re-autenticando...");
        this.token = null;
        return this.obtenerAgenda(fecha, medico, sede);
      }

      logger.error("❌ Error al obtener agenda:", error.message);
      return null;
    }
  }

  /**
   * Obtiene las agendas de todas las sedes y todos los médicos para una fecha
   */
  async obtenerAgendasTodasSedes(fecha: string): Promise<any[]> {
    const sedes = ["PEREIRA", "DOSQUEBRADAS"];

    // Obtener lista de médicos del .env
    const medicosEnv = process.env.API_UOLASER_MEDICOS || "";
    const medicos = medicosEnv
      .split(";")
      .map((m) => m.trim())
      .filter((m) => m);

    if (medicos.length === 0) {
      logger.warn("⚠️ No hay médicos configurados en API_UOLASER_MEDICOS");
      return [];
    }

    logger.info(`👨‍⚕️ Médicos configurados: ${medicos.length}`);

    const agendas: any[] = [];

    // Consultar cada combinación de sede + médico
    for (const sede of sedes) {
      for (const medico of medicos) {
        const agenda = await this.obtenerAgenda(fecha, medico, sede);
        if (agenda && agenda.data && agenda.data.length > 0) {
          agendas.push(...agenda.data);
          logger.info(
            `  ✅ ${sede} - ${medico}: ${agenda.data.length} cita(s)`,
          );
        }

        // Pequeño delay para no saturar la API
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    logger.info(
      `📊 Total de citas en todas las sedes: ${agendas.length} para ${fecha}`,
    );
    return agendas;
  }
}

export default new ApiUOLaserService();
