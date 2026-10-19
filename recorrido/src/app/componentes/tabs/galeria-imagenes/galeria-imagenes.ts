import { Component, Input } from '@angular/core';
import { IconButton } from '../../icon-button/icon-button';
import { MediaImage } from '../../media-image/media-image';
import { MediaKey } from '../../../models/environment.models';

/** Pestaña "Galería": carrusel de imágenes con flechas y puntos. */
@Component({
  selector: 'app-galeria-imagenes',
  standalone: true,
  imports: [IconButton, MediaImage],
  templateUrl: './galeria-imagenes.html',
  styleUrl: './galeria-imagenes.css',
})
export class GaleriaImagenes {
  @Input() imagenes: MediaKey[] = [];
  @Input() emptyLabel = 'No hay imágenes disponibles';
  @Input() prevLabel = 'Imagen anterior';
  @Input() nextLabel = 'Imagen siguiente';

  currentIndex = 0;

  currentImage(): MediaKey {
    return this.imagenes[this.currentIndex] ?? '';
  }

  prev(): void {
    this.currentIndex =
      this.currentIndex === 0 ? this.imagenes.length - 1 : this.currentIndex - 1;
  }

  next(): void {
    this.currentIndex =
      this.currentIndex === this.imagenes.length - 1 ? 0 : this.currentIndex + 1;
  }
}
