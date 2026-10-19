import { Component, effect, input, signal } from '@angular/core';
import { MediaService } from '../../services/media.service';

/**
 * Imagen resoluble por dispositivo con respaldos automáticos:
 *   clave → archivo del dispositivo → archivo mobile → clave de respaldo.
 * Evita repetir esa lógica en galería, planos e información.
 */
@Component({
  selector: 'app-media-image',
  standalone: true,
  templateUrl: './media-image.html',
  styleUrl: './media-image.css',
})
export class MediaImage {
  readonly mediaKey = input.required<string>();
  /** Clave distinta a usar si la principal no existe (ej. foto de respaldo). */
  readonly fallbackKey = input('');
  readonly alt = input('');
  readonly fit = input<'cover' | 'contain'>('cover');

  readonly src = signal('');

  constructor(private readonly media: MediaService) {
    effect(() => this.src.set(this.candidates()[0] ?? ''));
  }

  onError(): void {
    const candidates = this.candidates();
    const next = candidates[candidates.indexOf(this.src()) + 1];
    if (next) this.src.set(next);
  }

  /** Se lee dentro del effect: reacciona al cambio de clave o de dispositivo. */
  private candidates(): string[] {
    const key = this.mediaKey();
    if (!key) return [];

    const list = [this.media.url(key)];

    const deviceFallback = this.media.fallbackUrl(key);
    if (deviceFallback) list.push(deviceFallback);

    const fileFallback = this.fallbackKey();
    if (fileFallback) {
      list.push(this.media.url(fileFallback));
      const fallbackDevice = this.media.fallbackUrl(fileFallback);
      if (fallbackDevice) list.push(fallbackDevice);
    }

    return [...new Set(list)];
  }
}
