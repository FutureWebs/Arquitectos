import { MediaKey, SceneId } from './environment.models';

/** Cambio de estado que se aplica cuando termina un video. */
export interface StepResult {
  scene?: SceneId;
  stopId?: string;
  buildingId?: string | null;
  /** Abre el modal apenas termina el video (al entrar a un edificio). */
  openModal?: boolean;
}

/** Un paso de la cola de videos: qué se reproduce y qué pasa al terminar. */
export interface VideoStep {
  video: MediaKey;
  poster: MediaKey;
  result?: StepResult;
}

/** Dirección de movimiento dentro del orden de paradas. */
export type StopDirection = 'next' | 'prev';

export const transitionKey = (from: string, to: string): string => `${from}>${to}`;
