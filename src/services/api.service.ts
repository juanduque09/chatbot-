import axios from 'axios';
import config from '../config/env';
import logger from '../utils/logger';
import { Cita, CitaSchema } from '../types/cita.types';

/**
 * Servicio para consumir la API de citas
 */
class ApiService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = config.api.url;
    this.apiKey = config.api.key;
  }

  /**
   * Obtener todas las citas desde la API
   */
  async obtenerCitas(): Promise<Cita[]> {
    try {
      logger.info('📡 Consultando API de citas...');

      const response = await axios.get(this.baseURL, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 segundos
      });

      logger.info(`✅ Se obtuvieron ${response.data.length} citas de la API`);

      // Validar y parsear cada cita
      const citas = this.validarCitas(response.data);
      
      return citas;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('❌ Error al consultar la API:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        logger.error('❌ Error desconocido al consultar la API:', error);
      }
      throw error;
    }
  }

  /**
   * Validar estructura de las citas usando Zod
   */
  private validarCitas(data: unknown[]): Cita[] {
    const citasValidas: Cita[] = [];
    const citasInvalidas: number[] = [];

    data.forEach((item, index) => {
      try {
        const cita = CitaSchema.parse(item);
        citasValidas.push(cita);
      } catch (error) {
        citasInvalidas.push(index);
        logger.warn(`⚠️  Cita inválida en índice ${index}:`, error);
      }
    });

    if (citasInvalidas.length > 0) {
      logger.warn(`⚠️  Se encontraron ${citasInvalidas.length} citas con formato inválido`);
    }

    return citasValidas;
  }

  /**
   * Obtener citas agrupadas por médico y sede
   */
  async obtenerCitasAgrupadas(): Promise<Map<string, Cita[]>> {
    const citas = await this.obtenerCitas();
    const agrupadas = new Map<string, Cita[]>();

    citas.forEach((cita) => {
      const key = `${cita.medico}_${cita.sede}`;
      
      if (!agrupadas.has(key)) {
        agrupadas.set(key, []);
      }
      
      agrupadas.get(key)?.push(cita);
    });

    return agrupadas;
  }
}

export default new ApiService();
