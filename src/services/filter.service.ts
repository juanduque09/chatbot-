import { Cita } from '../types/cita.types';
import { getFechaMañana } from '../utils/date.utils';
import { esNumeroValido } from '../utils/phone.utils';
import logger from '../utils/logger';

/**
 * Servicio para filtrar citas según criterios
 */
class FilterService {
  /**
   * Filtrar citas para el día de mañana
   */
  filtrarCitasMañana(citas: Cita[]): Cita[] {
    const fechaMañana = getFechaMañana();
    logger.info(`🔍 Filtrando citas para el día: ${fechaMañana}`);

    const citasFiltradas = citas.filter((cita) => {
      return cita.requerida === fechaMañana;
    });

    logger.info(`✅ Se encontraron ${citasFiltradas.length} citas para mañana`);
    return citasFiltradas;
  }

  /**
   * Filtrar citas que NO estén canceladas
   */
  filtrarCitasActivas(citas: Cita[]): Cita[] {
    return citas.filter((cita) => {
      return cita.estado !== 'CANCELADO' && cita.estado !== 'CANCELADA';
    });
  }

  /**
   * Filtrar citas con teléfono válido
   */
  filtrarCitasConTelefonoValido(citas: Cita[]): Cita[] {
    const citasValidas: Cita[] = [];
    const citasInvalidas: Cita[] = [];

    citas.forEach((cita) => {
      if (cita.telefono && esNumeroValido(cita.telefono)) {
        citasValidas.push(cita);
      } else {
        citasInvalidas.push(cita);
        logger.warn(`⚠️  Cita ID ${cita.id} tiene teléfono inválido: ${cita.telefono}`);
      }
    });

    if (citasInvalidas.length > 0) {
      logger.warn(`⚠️  ${citasInvalidas.length} citas sin teléfono válido`);
    }

    return citasValidas;
  }

  /**
   * Obtener citas que necesitan recordatorio
   * (mañana + activas + teléfono válido)
   */
  obtenerCitasParaRecordatorio(citas: Cita[]): Cita[] {
    logger.info('🎯 Filtrando citas que necesitan recordatorio...');

    let citasFiltradas = this.filtrarCitasMañana(citas);
    citasFiltradas = this.filtrarCitasActivas(citasFiltradas);
    citasFiltradas = this.filtrarCitasConTelefonoValido(citasFiltradas);

    logger.info(`📋 Total de citas para enviar recordatorio: ${citasFiltradas.length}`);

    // Log de resumen por sede
    const porSede = this.agruparPorSede(citasFiltradas);
    porSede.forEach((citas, sede) => {
      logger.info(`   📍 ${sede}: ${citas.length} citas`);
    });

    // Log de resumen por médico
    const porMedico = this.agruparPorMedico(citasFiltradas);
    porMedico.forEach((citas, medico) => {
      logger.info(`   👨‍⚕️ ${medico}: ${citas.length} citas`);
    });

    return citasFiltradas;
  }

  /**
   * Agrupar citas por sede
   */
  private agruparPorSede(citas: Cita[]): Map<string, Cita[]> {
    const agrupadas = new Map<string, Cita[]>();

    citas.forEach((cita) => {
      if (!agrupadas.has(cita.sede)) {
        agrupadas.set(cita.sede, []);
      }
      agrupadas.get(cita.sede)?.push(cita);
    });

    return agrupadas;
  }

  /**
   * Agrupar citas por médico
   */
  private agruparPorMedico(citas: Cita[]): Map<string, Cita[]> {
    const agrupadas = new Map<string, Cita[]>();

    citas.forEach((cita) => {
      if (!agrupadas.has(cita.medico)) {
        agrupadas.set(cita.medico, []);
      }
      agrupadas.get(cita.medico)?.push(cita);
    });

    return agrupadas;
  }
}

export default new FilterService();
