import { Injectable, computed, inject, signal } from '@angular/core';
import { DATA_ENVIRONMENT } from '../data/data.environment';
import { MediaService } from './media.service';
import { Building, MediaKey, Position, SceneId, StopDef } from '../models/environment.models';
import { StopDirection, StepResult, VideoStep, transitionKey } from '../models/tour.models';

interface Hotspot {
  building: Building;
  position: Position;
}

/**
 * Máquina de estados del recorrido + cola de transiciones en video.
 *
 *   inicio ──intro──▶ exterior(A ⇄ B ⇄ C) ──inside──▶ interior(modal)
 *     ▲                   │                                │
 *     └─────outro─────────┴──────────exit──────────────────┘
 *
 * El estado (parada/escena) recién cambia cuando el video TERMINA, así la UI
 * nunca se adelanta al video.
 */
@Injectable({ providedIn: 'root' })
export class TourStateService {
  private readonly media = inject(MediaService);
  private readonly cfg = DATA_ENVIRONMENT;
  private readonly tour = DATA_ENVIRONMENT.tour;

  /** Estado de la escena. */
  readonly scene = signal<SceneId>('inicio');
  /** Parada actual del recorrido exterior. */
  readonly stopId = signal<string>(this.tour.startStop);
  /** true mientras se reproduce una transición (la UI se oculta). */
  readonly animating = signal(false);
  /** true mientras el <video> está emitiendo frames. */
  readonly playing = signal(false);
  /** true mientras carga el arte de la pantalla inicial. */
  readonly loading = signal(true);
  readonly modalOpen = signal(false);
  readonly activeBuildingId = signal<string | null>(null);

  /** Clave del fondo visible. */
  readonly posterKey = signal<MediaKey>(this.cfg.start.image);
  /** Clave del video a reproducir. */
  readonly videoKey = signal<MediaKey>('');
  /** Incrementa cada vez que arranca un paso: le indica al <video> que ejecute play(). */
  readonly playToken = signal(0);

  readonly posterUrl = computed(() => this.media.url(this.posterKey()));
  readonly posterFallbackUrl = computed(() => this.media.fallbackUrl(this.posterKey()));
  /** Respaldo de archivo distinto (ej: foto si el SVG de inicio no carga). */
  readonly posterFallbackKey = computed<MediaKey>(() =>
    this.posterKey() === this.cfg.start.image ? this.cfg.start.fallbackImage ?? '' : '',
  );
  readonly videoUrl = computed(() => this.media.url(this.videoKey()));
  readonly videoFallbackUrl = computed(() => this.media.fallbackUrl(this.videoKey()));

  readonly currentStop = computed(
    () => this.tour.stops.find((stop) => stop.id === this.stopId()) ?? this.tour.stops[0],
  );
  /** Parada a la que lleva la flecha derecha, o null si no hay video/viaje posible. */
  readonly nextStop = computed(() => this.neighbourStop('next'));
  readonly prevStop = computed(() => this.neighbourStop('prev'));

  readonly activeBuilding = computed(() => {
    const id = this.activeBuildingId();
    return this.cfg.buildings.find((building) => building.id === id) ?? null;
  });

  /** Botones "Entrar" visibles en el momento (escena exterior y con posición cargada). */
  readonly hotspots = computed<Hotspot[]>(() => {
    if (this.scene() !== 'exterior' || this.animating()) return [];
    const device = this.media.device();
    const stopId = this.stopId();
    return this.cfg.buildings.reduce<Hotspot[]>((acc, building) => {
      const responsive = building.hotspot.stops[stopId];
      const position = responsive ? responsive[device] : undefined;
      if (position) acc.push({ building, position });
      return acc;
    }, []);
  });

  readonly showBack = computed(() => this.scene() !== 'inicio' && !this.animating());

  private queue: VideoStep[] = [];
  private currentStep: VideoStep | null = null;
  private waitingForStart = false;
  private readonly preloadedVideos = new Map<string, HTMLVideoElement>();

  // ───────────────────────────── ARRANQUE ─────────────────────────────

  /** Precarga la pantalla inicial y oculta el loader. Llamar una sola vez. */
  init(): void {
    this.media.preloadImage(this.cfg.start.image);
    if (this.cfg.start.fallbackImage) this.media.preloadImage(this.cfg.start.fallbackImage);
    this.preloadVideo(this.tour.intro.video);

    const img = new Image();
    const done = () => window.setTimeout(() => this.loading.set(false), 300);
    img.onload = done;
    img.onerror = done;
    img.src = this.posterUrl();
  }

  // ───────────────────────────── ACCIONES ─────────────────────────────

  /** Botón "Empezar": video de acercamiento hasta la parada inicial. */
  start(): void {
    if (this.animating() || this.scene() !== 'inicio') return;
    const arrival = this.tour.intro.arrivalStop;
    this.run([
      {
        video: this.tour.intro.video,
        poster: this.stopPoster(arrival),
        result: { scene: 'exterior', stopId: arrival },
      },
    ]);
  }

  /** Flechas del recorrido exterior. */
  rotate(direction: StopDirection): void {
    if (this.animating() || this.scene() !== 'exterior') return;
    const target = this.neighbourStop(direction);
    if (!target) return;
    const video = this.transitionVideo(this.stopId(), target.id);
    if (!video) return;
    this.run([{ video, poster: target.poster, result: { stopId: target.id } }]);
  }

  /** Botón "Entrar" de una cabaña/edificio. */
  enter(buildingId: string): void {
    if (this.animating() || this.scene() !== 'exterior') return;
    const building = this.building(buildingId);
    if (!building) return;

    const steps: VideoStep[] = [];
    const from = this.stopId();

    if (from !== building.entryStop) {
      const explicit = building.approach ? building.approach[from] : undefined;
      if (explicit) {
        steps.push({
          video: explicit,
          poster: this.stopPoster(building.entryStop),
          result: { stopId: building.entryStop },
        });
      } else {
        const path = this.pathBetween(from, building.entryStop);
        if (path && path.length > 0) {
          steps.push(...this.stepsForPath(from, path));
        } else {
          // Sin videos disponibles: saltamos sin transición.
          this.stopId.set(building.entryStop);
        }
      }
    }

    steps.push({
      video: building.insideVideo,
      poster: building.interiorPoster,
      result: { scene: 'interior', buildingId: building.id, openModal: true },
    });

    this.run(steps);
  }

  /** Sale del interior hacia la parada de entrada del edificio. */
  exit(): void {
    if (this.animating() || this.scene() !== 'interior') return;
    const building = this.activeBuilding();
    if (!building) return;

    this.modalOpen.set(false);
    this.run([
      {
        video: building.exitVideo,
        poster: this.stopPoster(building.entryStop),
        result: { scene: 'exterior', buildingId: null },
      },
    ]);
  }

  /** Botón "Volver": recorre los videos inversos hasta la pantalla inicial. */
  back(): void {
    if (this.animating()) return;

    if (this.scene() === 'interior') {
      this.exit();
      return;
    }
    if (this.scene() !== 'exterior') return;

    this.modalOpen.set(false);
    const steps: VideoStep[] = [];
    const from = this.stopId();
    const to = this.tour.startStop;

    if (from !== to) {
      const path = this.pathBetween(from, to);
      if (path && path.length > 0) {
        steps.push(...this.stepsForPath(from, path));
      } else {
        this.stopId.set(to);
      }
    }

    steps.push({
      video: this.tour.outro.video,
      poster: this.cfg.start.image,
      result: { scene: 'inicio' },
    });
    this.run(steps);
  }

  openModal(): void {
    if (this.scene() === 'interior') this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  // ─────────────────────────── EVENTOS DEL VIDEO ───────────────────────────

  onVideoTimeUpdate(currentTime: number): void {
    if (!this.waitingForStart || !this.currentStep) return;
    if (currentTime <= 0.02) return;
    this.waitingForStart = false;
    this.playing.set(true);
  }

  onVideoEnded(): void {
    this.completeCurrentStep();
  }

  /** Si el video no se puede reproducir, aplicamos igual su resultado. */
  skipCurrentVideo(): void {
    if (!this.currentStep) return;
    this.completeCurrentStep();
  }

  // ───────────────────────────── CONSULTAS ─────────────────────────────

  stopPoster(stopId: string): MediaKey {
    return this.tour.stops.find((stop) => stop.id === stopId)?.poster ?? this.tour.stops[0].poster;
  }

  building(buildingId: string): Building | null {
    return this.cfg.buildings.find((building) => building.id === buildingId) ?? null;
  }

  transitionVideo(from: string, to: string): MediaKey | undefined {
    return this.tour.transitions[transitionKey(from, to)];
  }

  // ───────────────────────────── INTERNAS ─────────────────────────────

  /** Parada vecina en el orden, solo si existe video para ese viaje. */
  private neighbourStop(direction: StopDirection): StopDef | null {
    const from = this.stopId();
    const target = this.step(from, direction);
    if (!target) return null;
    return this.transitionVideo(from, target.id) ? target : null;
  }

  /** Vecino puro según el orden de `tour.stops` y la bandera `loop`. */
  private step(fromId: string, direction: StopDirection): StopDef | null {
    const stops = this.tour.stops;
    const index = stops.findIndex((stop) => stop.id === fromId);
    if (index < 0) return null;

    let nextIndex = direction === 'next' ? index + 1 : index - 1;
    if (nextIndex < 0 || nextIndex >= stops.length) {
      if (!this.tour.loop) return null;
      nextIndex = (nextIndex + stops.length) % stops.length;
    }
    return stops[nextIndex];
  }

  /** Camino más corto (por cantidad de videos) entre dos paradas. */
  private pathBetween(from: string, to: string): StopDirection[] | null {
    if (from === to) return [];

    const walk = (direction: StopDirection): StopDirection[] | null => {
      const path: StopDirection[] = [];
      let current = from;
      for (let i = 0; i < this.tour.stops.length; i++) {
        const target = this.step(current, direction);
        if (!target || !this.transitionVideo(current, target.id)) return null;
        path.push(direction);
        if (target.id === to) return path;
        current = target.id;
      }
      return null;
    };

    const forward = walk('next');
    const backward = walk('prev');
    if (forward && backward) return forward.length <= backward.length ? forward : backward;
    return forward ?? backward;
  }

  private stepsForPath(fromId: string, path: StopDirection[]): VideoStep[] {
    const steps: VideoStep[] = [];
    let current = fromId;

    for (const direction of path) {
      const target = this.step(current, direction);
      if (!target) break;
      const video = this.transitionVideo(current, target.id);
      if (!video) break;
      steps.push({ video, poster: target.poster, result: { stopId: target.id } });
      current = target.id;
    }
    return steps;
  }

  private run(steps: VideoStep[]): void {
    if (steps.length === 0 || this.animating()) return;
    this.queue = [...steps];
    this.animating.set(true);
    this.playNext();
  }

  private playNext(): void {
    const step = this.queue.shift();

    if (!step) {
      this.currentStep = null;
      this.waitingForStart = false;
      this.animating.set(false);
      this.playing.set(false);
      this.videoKey.set('');
      this.preloadAround();
      return;
    }

    this.currentStep = step;
    this.waitingForStart = true;
    this.playing.set(false);
    this.media.preloadImage(step.poster);

    window.setTimeout(() => {
      if (this.currentStep !== step) return;
      this.videoKey.set(step.video);
      this.playToken.update((token) => token + 1);
      this.preloadVideo(step.video);
    }, 150);
  }

  private completeCurrentStep(): void {
    const step = this.currentStep;

    if (step) {
      // El fondo pasa a ser el destino ANTES de dejar de ocultarse el video,
      // así no hay parpadeo del escenario anterior.
      this.posterKey.set(step.poster);
      this.apply(step.result);
    }

    this.waitingForStart = false;
    this.playing.set(false);
    this.playNext();
  }

  private apply(result?: StepResult): void {
    if (!result) return;
    if (result.scene) this.scene.set(result.scene);
    if (result.stopId) this.stopId.set(result.stopId);
    if (result.buildingId !== undefined) this.activeBuildingId.set(result.buildingId);
    if (result.openModal) this.modalOpen.set(true);
  }

  /** Precarga el fondo actual y los videos a los que se puede viajar desde acá. */
  private preloadAround(): void {
    this.media.preloadImage(this.posterKey());

    const neighbours = [this.nextStop(), this.prevStop()];
    for (const stop of neighbours) {
      if (!stop) continue;
      const video = this.transitionVideo(this.stopId(), stop.id);
      if (video) this.preloadVideo(video);
    }
    this.preloadVideo(this.tour.outro.video);
    this.preloadVideo(this.tour.intro.video);
  }

  private preloadVideo(key: MediaKey): void {
    if (!key || typeof document === 'undefined' || this.preloadedVideos.has(key)) return;

    const element = document.createElement('video');
    element.preload = 'auto';
    element.muted = true;
    element.src = this.media.url(key);
    element.load();
    this.preloadedVideos.set(key, element);

    if (this.preloadedVideos.size > 8) {
      const oldest = this.preloadedVideos.keys().next().value;
      if (oldest) {
        this.preloadedVideos.get(oldest)?.removeAttribute('src');
        this.preloadedVideos.delete(oldest);
      }
    }
  }
}
