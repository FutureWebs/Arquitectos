/**
 * MODELOS DEL ENTORNO
 * Definen la forma exacta de `data.environment.ts`.
 * Si necesitás agregar un dato nuevo al template, agregá el acá y TypeScript
 * te va a marcar el error en todos los proyectos que no lo tengan.
 */

/** Dispositivos soportados. Las carpetas de assets se resuelven con `media.roots`. */
export type DeviceId = 'mobile' | 'desktop';

/** Estado general de la escena del recorrido. */
export type SceneId = 'inicio' | 'exterior' | 'interior';

/** Identificador de una pestaña del modal. */
export type TabId = 'info' | 'galeria' | 'planos' | 'tour3d';

/** Ruta relativa (dentro de la carpeta del dispositivo) a un archivo multimedia. Ej: 'tour/fotos/parada-a.webp' */
export type MediaKey = string;

/** Posición en porcentaje dentro del escenario (0-100). */
export interface Position {
  x: number;
  y: number;
}

/** Posición que cambia según el dispositivo (el encuadre de la foto/video no es el mismo). */
export interface ResponsivePosition {
  mobile: Position;
  desktop: Position;
}

/** Datos generales del proyecto. */
export interface ProjectInfo {
  /** Nombre corto, se usa en el <title> del documento. */
  name: string;
}

/** Todos los textos visibles de la interfaz. Cambiar acá cambia todos los textos. */
export interface UiLabels {
  loading: string;
  hero: string;
  start: string;
  back: string;
  enter: string;
  fullscreen: string;
  exitFullscreen: string;
  prevStop: string;
  nextStop: string;
  closeModal: string;
  stopIndicator: string;
  emptyGallery: string;
  emptyPlans: string;
  emptyTour3d: string;
  tabInfo: string;
  tabGallery: string;
  tabPlans: string;
  tabTour3d: string;
}

/** Resolución de carpetas: cada dispositivo mira una raíz distinta dentro de `public/`. */
export interface MediaRoots {
  mobile: string;
  desktop: string;
}

export interface MediaConfig {
  roots: MediaRoots;
  /**
   * Dispositivo usado cuando no se puede detectar el ancho (SSR/tests).
   */
  defaultDevice: DeviceId;
}

/** Pantalla de recepción: el SVG del complejo + botón "Empezar". */
export interface StartConfig {
  /** Clave multimedia del arte de recepción (idealmente un SVG). */
  image: MediaKey;
  /** Imagen de respaldo por si la principal falla al cargar. */
  fallbackImage?: MediaKey;
}

/** Una parada del recorrido exterior (A, B, C...). */
export interface StopDef {
  id: string;
  /** Texto mostrado en el indicador de parada. */
  label: string;
  /** Clave multimedia del fondo que se ve al llegar a esta parada. */
  poster: MediaKey;
}

/** Transición de video entre el inicio y la parada inicial. */
export interface IntroDef {
  video: MediaKey;
  /** Parada en la que se aterriza al terminar el video. */
  arrivalStop: string;
}

/** Transición inversa: de la parada inicial de vuelta al inicio. */
export interface OutroDef {
  video: MediaKey;
}

export interface TourConfig {
  /** Parada desde la que arranca el recorrido exterior. */
  startStop: string;
  /** Orden de las paradas. El sentido "siguiente" (flecha derecha) es el orden de este array. */
  stops: StopDef[];
  /**
   * Si es true, desde la última parada se vuelve a la primera (y viceversa).
   * Si es false, en los extremos desaparece la flecha correspondiente.
   */
  loop: boolean;
  /**
   * Videos entre paradas. Clave: `"A>B"` (origen>destino), valor: clave multimedia.
   * Si falta una clave, el botón correspondiente no se muestra en esa parada.
   */
  transitions: Record<string, MediaKey>;
  intro: IntroDef;
  outro: OutroDef;
}

/** Contenido libre de la pestaña "Información". */
export interface BuildingInfo {
  description: string;
  /** Filas de datos (label / valor). Ej: Superficie / 45 m² */
  specs: { label: string; value: string }[];
  /** Chips de características. Ej: "Piscina", "Quincho" */
  features?: string[];
  /** Botones de acción. Ej: { label: 'Consultar', url: 'https://...' } */
  actions?: { label: string; url: string }[];
}

export interface BuildingPlan {
  title: string;
  image: MediaKey;
}

export interface BuildingTour3d {
  title?: string;
  /** URL embebible (iframe) del recorrido 3D. */
  url: string;
}

/** Todo lo que se muestra dentro del modal de un edificio/cabaña. */
export interface BuildingContent {
  subtitle?: string;
  badge?: string;
  description?: string;
  gallery: MediaKey[];
  plans: BuildingPlan[];
  tour3d?: BuildingTour3d;
  info: BuildingInfo;
}

/**
 * Botón "Entrar" superpuesto sobre el edificio en la escena.
 * Las paradas que no estén listadas no muestran el botón.
 */
export interface HotspotConfig {
  stops: Record<string, ResponsivePosition>;
}

export interface Building {
  id: string;
  name: string;
  /** Parada desde la que se entra (y desde la que se sale). */
  entryStop: string;
  /**
   * Videos de aproximación opcionales, por parada de origen.
   * Si falta una parada, se encadenan automáticamente los videos
   * de `tour.transitions` hasta llegar a `entryStop`.
   */
  approach?: Record<string, MediaKey>;
  /** Video: entryStop -> interior del edificio. */
  insideVideo: MediaKey;
  /** Fondo que queda mientras el modal está abierto. */
  interiorPoster: MediaKey;
  /** Video: interior -> entryStop. */
  exitVideo: MediaKey;
  hotspot: HotspotConfig;
  content: BuildingContent;
}

/** Definición de una pestaña del modal (orden y textos configurables). */
export interface TabDef {
  id: TabId;
  label: string;
  /** Nombre de un ícono Material Icons. */
  icon: string;
}

export interface DataEnvironment {
  project: ProjectInfo;
  ui: UiLabels;
  media: MediaConfig;
  start: StartConfig;
  tour: TourConfig;
  buildings: Building[];
  tabs: TabDef[];
}
