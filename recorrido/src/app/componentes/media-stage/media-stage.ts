import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  effect,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { MediaService } from '../../services/media.service';
import { TourStateService } from '../../services/tour-state.service';

/**
 * Capa multimedia del escenario: fondo (poster) + video de transición.
 * Cualquier contenido superpuesto se proyecta dentro de `<ng-content>`.
 *
 * Maneja dos respaldos automáticos:
 *   1. si el archivo del dispositivo no existe → cae al de mobile
 *   2. si tampoco existe → usa la clave de respaldo definida en data (ej. foto
 *      si el SVG de inicio no carga) o, en último caso, omite el paso.
 */
@Component({
  selector: 'app-media-stage',
  standalone: true,
  templateUrl: './media-stage.html',
  styleUrl: './media-stage.css',
})
export class MediaStage implements AfterViewInit {
  @ViewChild('video') private videoRef?: ElementRef<HTMLVideoElement>;

  readonly state = inject(TourStateService);
  private readonly media = inject(MediaService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly posterSrc = signal('');
  readonly videoSrc = signal('');

  constructor() {
    effect(() => {
      this.posterSrc.set(this.posterCandidates()[0] ?? '');
    });

    effect(() => {
      const url = this.state.videoUrl();
      const token = this.state.playToken();
      this.videoSrc.set(url);
      if (!token) return;
      window.setTimeout(() => this.syncAndPlay(), 0);
    });
  }

  ngAfterViewInit(): void {
    if (this.videoSrc()) window.setTimeout(() => this.syncAndPlay(), 0);
  }

  onTimeUpdate(event: Event): void {
    const time = (event.target as HTMLVideoElement | null)?.currentTime ?? 0;
    this.state.onVideoTimeUpdate(time);
  }

  onPosterError(): void {
    const candidates = this.posterCandidates();
    const index = candidates.indexOf(this.posterSrc());
    const next = candidates[index + 1];
    if (next) this.posterSrc.set(next);
  }

  onVideoError(): void {
    if (!this.videoSrc()) return;
    const candidates = this.videoCandidates();
    const index = candidates.indexOf(this.videoSrc());
    const next = candidates[index + 1];

    if (next) {
      this.videoSrc.set(next);
      window.setTimeout(() => this.syncAndPlay(), 0);
      return;
    }
    this.state.skipCurrentVideo();
  }

  private syncAndPlay(): void {
    const element = this.videoRef?.nativeElement;
    if (!element || !this.videoSrc()) return;

    this.cdr.detectChanges();
    element.currentTime = 0;

    const attempt = element.play();
    attempt?.catch((error: unknown) => {
      const name = (error as { name?: string } | null)?.name;
      if (name === 'AbortError') return;
      console.warn('[media-stage] No se pudo reproducir el video:', error);
      this.state.skipCurrentVideo();
    });
  }

  private posterCandidates(): string[] {
    const key = this.state.posterKey();
    const candidates = [this.state.posterUrl()];

    const deviceFallback = this.state.posterFallbackUrl();
    if (deviceFallback) candidates.push(deviceFallback);

    const fileFallback = this.state.posterFallbackKey();
    if (fileFallback) {
      candidates.push(this.media.url(fileFallback));
      const fileDeviceFallback = this.media.fallbackUrl(fileFallback);
      if (fileDeviceFallback) candidates.push(fileDeviceFallback);
    }

    return key ? candidates : [];
  }

  private videoCandidates(): string[] {
    const key = this.state.videoKey();
    if (!key) return [];

    const candidates = [this.state.videoUrl()];
    const fallback = this.state.videoFallbackUrl();
    if (fallback) candidates.push(fallback);
    return candidates;
  }
}
