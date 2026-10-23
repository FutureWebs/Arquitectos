import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-galeria-imagenes',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './galeria-imagenes.html',
  styleUrl: './galeria-imagenes.css'
})
export class GaleriaImagenes {
  @Input() imagenes: string[] = [];

  selectedIndex = 0;
  lightboxOpen = false;

  openLightbox(index: number) {
    this.selectedIndex = index;
    this.lightboxOpen = true;
  }

  closeLightbox() {
    this.lightboxOpen = false;
  }

  prev() {
    this.selectedIndex = this.selectedIndex === 0
      ? this.imagenes.length - 1
      : this.selectedIndex - 1;
  }

  next() {
    this.selectedIndex = this.selectedIndex === this.imagenes.length - 1
      ? 0
      : this.selectedIndex + 1;
  }
}
