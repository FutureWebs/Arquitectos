/**
 * Protocolo de comunicación iframe (web padre React ↔ web hija Angular)
 * mediante window.postMessage + evento 'message'.
 *
 * Secuencia:
 *   1. Hija carga          → envía { type: 'APP_READY' }
 *   2. Padre responde      → envía { type: 'CONFIG', payload: { deptos: [...] } }
 *   3. Hija pinta badges   → pisa estado/título/número según la info del padre
 *   4. Clic en un depto    → envía { type: 'DEPTO_SELECTED', payload: { depto: {...} } }
 *      y el padre abre SU modal
 *
 * Ver docs/embed-protocol.md para el contrato completo y el ejemplo en React.
 */

/** Identidad de esta app al enviar mensajes. */
export const SOURCE_HIJA = 'torre-angular';

/** Versión del protocolo. */
export const PROTOCOLO_VERSION = '1.0';

/** Tipos de mensaje soportados. */
export const TIPO_MENSAJE = {
  APP_READY: 'APP_READY',
  CONFIG: 'CONFIG',
  DEPTO_SELECTED: 'DEPTO_SELECTED',
} as const;

export type TipoMensaje = (typeof TIPO_MENSAJE)[keyof typeof TIPO_MENSAJE];

/** Estados válidos (los mismos valores que usa el cliente). */
export type EstadoDepto = 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO';

export const ESTADOS_VALIDOS: readonly EstadoDepto[] = ['DISPONIBLE', 'RESERVADO', 'VENDIDO'];

/** Envelope común de todos los mensajes intercambiados. */
export interface MensajeEmbed<T = unknown> {
  source: string;
  type: TipoMensaje;
  version: string;
  payload: T;
}

/** Depto tal como lo envía el padre (info verídica de su base de datos). */
export interface DeptoExterno {
  /** Id de la DB del cliente — se devuelve en DEPTO_SELECTED para que él busque su registro. */
  dbId: string;
  piso: number | string;
  numero: number | string;
  titulo?: string;
  estado: EstadoDepto;
  disponibilidadText?: string;
  tipologia?: string;
  precio?: number | string;
  [clave: string]: unknown;
}

/** Payload recibido en CONFIG. */
export interface ConfigPayload {
  deptos: DeptoExterno[];
}

/** Snapshot del depto devuelto al padre al hacer clic. */
export interface DeptoSeleccionado {
  dbId?: string;
  id: string;
  piso: string;
  numero: string;
  titulo: string;
  estado: string;
  /** Etiqueta visible en el badge, ej: "1-11". */
  badge: string;
}

/** Payload enviado en DEPTO_SELECTED. */
export interface DeptoSelectedPayload {
  depto: DeptoSeleccionado;
}

/** Mensaje APP_READY (hija → padre). */
export function mensajeAppReady(): MensajeEmbed<null> {
  return {
    source: SOURCE_HIJA,
    type: TIPO_MENSAJE.APP_READY,
    version: PROTOCOLO_VERSION,
    payload: null,
  };
}

/** Mensaje DEPTO_SELECTED (hija → padre). */
export function mensajeDeptoSelected(depto: DeptoSeleccionado): MensajeEmbed<DeptoSelectedPayload> {
  return {
    source: SOURCE_HIJA,
    type: TIPO_MENSAJE.DEPTO_SELECTED,
    version: PROTOCOLO_VERSION,
    payload: { depto },
  };
}

/** Guard: ¿el dato crudo parece un mensaje nuestro/ajeno del protocolo? */
export function esMensajeEmbed(data: unknown): data is MensajeEmbed {
  if (!data || typeof data !== 'object') return false;
  const m = data as Partial<MensajeEmbed>;
  return typeof m.type === 'string' && typeof m.version === 'string' && 'payload' in m;
}

/** Guard: ¿es un CONFIG con un payload válido? */
export function esConfigMsg(msg: MensajeEmbed): msg is MensajeEmbed<ConfigPayload> {
  if (msg.type !== TIPO_MENSAJE.CONFIG) return false;
  const payload = msg.payload as ConfigPayload | null;
  return !!payload && Array.isArray(payload.deptos);
}

/** Normaliza piso/número para el match (acepta "1", 1, " 1 "). */
export function claveDepto(piso: number | string, numero: number | string): string {
  return `${Number(piso)}-${Number(numero)}`;
}

/** Extrae el número de depto de nuestro id interno ("P1-Apto-11" → 11). */
export function numeroDeId(id: string): number {
  const partes = id.split('-Apto-');
  const n = Number(partes[1]);
  return Number.isNaN(n) ? -1 : n;
}
