import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';

// Configurar dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

/**
 * Parsear hora desde formato numérico (ej: 759 -> "07:59")
 */
export function parseHora(hora: number): string {
  const hours = Math.floor(hora / 100);
  const minutes = hora % 100;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Obtener la fecha de mañana en formato YYYY-MM-DD
 */
export function getFechaMañana(): string {
  return dayjs().add(1, 'day').format('YYYY-MM-DD');
}

/**
 * Obtener fecha actual en formato YYYY-MM-DD
 */
export function getFechaHoy(): string {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * Formatear fecha para mostrar (ej: "14 de noviembre de 2025")
 */
export function formatearFechaLegible(fecha: string): string {
  return dayjs(fecha).format('DD [de] MMMM [de] YYYY');
}

/**
 * Validar si una fecha está en el pasado
 */
export function esFechaPasada(fecha: string): boolean {
  return dayjs(fecha).isBefore(dayjs(), 'day');
}

/**
 * Obtener día de la semana
 */
export function getDiaSemana(fecha: string): string {
  return dayjs(fecha).format('dddd');
}
