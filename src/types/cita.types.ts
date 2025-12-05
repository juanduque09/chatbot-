import { z } from 'zod';

// Schema de validación para una cita
export const CitaSchema = z.object({
  hora: z.number(),
  ampm: z.string(),
  consultorio: z.string(),
  nombre: z.string(),
  telefono: z.string(),
  td: z.string(),
  documento: z.string(),
  estado: z.string(),
  motivoCancela: z.string(),
  fechaSolicita: z.string(),
  entidad: z.string(),
  tipo: z.string(),
  concepto: z.string(),
  observacion: z.string(),
  orden: z.number(),
  medico: z.string(),
  requerida: z.string(), // Fecha de la cita
  creadaPor: z.string(),
  modificadaPor: z.string(),
  actualizada: z.string(),
  id: z.number(),
  impresa: z.nullable(z.string()),
  sede: z.string(),
});

// Tipo TypeScript inferido del schema
export type Cita = z.infer<typeof CitaSchema>;

// Tipo para la respuesta de la API
export interface ApiResponse {
  fecha: string;
  medico: string;
  sede: string;
  citas?: Cita[];
}

// Tipo para el mensaje de recordatorio
export interface Recordatorio {
  citaId: number;
  telefono: string;
  mensaje: string;
  nombre: string;
  fecha: string;
  hora: string;
  medico: string;
  sede: string;
}

// Estados de cita
export enum EstadoCita {
  ATENDIDO = 'ATENDIDO',
  PENDIENTE = 'PENDIENTE',
  CANCELADO = 'CANCELADO',
  NO_ASISTIO = 'NO_ASISTIO',
}

// Configuración de sedes
export const SEDES = ['PEREIRA', 'OTRA_SEDE'] as const;
export type Sede = typeof SEDES[number];
