import { Component, computed, ElementRef, input, signal, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IconButton } from '../../icon-button/icon-button';
import { BuildingTour3d } from '../../../models/environment.models';

/** Pestaña "3D": recorrido 3D embebido en un iframe, con pantalla completa. */
@Component({
  selector: 'app-recorrido-3d',
  standalone: true,
  imports: [IconButton],
  templateUrl: './recorrido-3d.html',
  styleUrl: './recorrido-3d.css',
})
export class Recorrido3D {
  readonly tour3d = input<BuildingTour3d | undefined>(undefined);
  readonly emptyLabel = input('No hay recorrido 3D disponible');
  readonly fullscreenLabel = input('Pantalla completa');

  @ViewChild('container') private containerRef?: ElementRef<HTMLDivElement>;

  readonly isFullscreen = signal(false);

  readonly safeUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.tour3d()?.url;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  constructor(private readonly sanitizer: DomSanitizer) {}

  toggleFullscreen(): void {
    const element = this.containerRef?.nativeElement;
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen()?.then(
        () => this.isFullscreen.set(true),
        (error: unknown) => console.warn('[recorrido-3d]', error),
      );
    } else {
      document.exitFullscreen()?.then(
        () => this.isFullscreen.set(false),
        (error: unknown) => console.warn('[recorrido-3d]', error),
      );
    }
  }
}
