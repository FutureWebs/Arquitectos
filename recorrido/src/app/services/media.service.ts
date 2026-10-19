import { Injectable, computed, signal } from '@angular/core';
import { DATA_ENVIRONMENT } from '../data/data.environment';
import { DeviceId, MediaKey } from '../models/environment.models';

/**
 * Resuelve las claves multimedia ('tour/fotos/parada-a.webp') a una URL real
 * según el dispositivo activo.
 *
 *   mobile  -> public/mobile/tour/fotos/parada-a.webp
 *   desktop -> public/desktop/tour/fotos/parada-a.webp   (si 'desktop' apunta a 'desktop')
 *
 * Si el archivo del dispositivo no existe, los componentes caen en
 * `fallbackUrl()` (siempre la raíz de mobile) en lugar de romperse.
 */
@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly config = DATA_ENVIRONMENT.media;
  private readonly query =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(min-width: 769px)')
      : null;

  /** Dispositivo activo. Cambia en vivo al redimensionar la ventana. */
  readonly device = signal<DeviceId>(this.query?.matches ? 'desktop' : this.config.defaultDevice);

  readonly isDesktop = computed(() => this.device() === 'desktop');

  constructor() {
    this.query?.addEventListener('change', (event) => {
      this.device.set(event.matches ? 'desktop' : 'mobile');
    });
  }

  /** URL primaria para la clave y el dispositivo actuales. */
  url(key: MediaKey): string {
    return this.urlForDevice(key, this.device());
  }

  /** URL bajo la raíz de mobile, o '' si ya es la primaria (no hay fallback posible). */
  fallbackUrl(key: MediaKey): string {
    const primary = this.url(key);
    const mobile = this.urlForDevice(key, 'mobile');
    return mobile === primary ? '' : mobile;
  }

  urlForDevice(key: MediaKey, device: DeviceId): string {
    const root = device === 'desktop' ? this.config.roots.desktop : this.config.roots.mobile;
    return `${root}/${key}`;
  }

  /** Precarga una imagen (posters, arte de inicio, galerías). */
  preloadImage(key: MediaKey): void {
    if (!key) return;
    this.loadImage(this.url(key));
    const fallback = this.fallbackUrl(key);
    if (fallback) this.loadImage(fallback);
  }

  private loadImage(src: string): void {
    const img = new Image();
    img.src = src;
  }
}
