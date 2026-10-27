import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';

@Component({
  selector: 'app-gallery-carousel',
  standalone: true,
  templateUrl: './gallery-carousel.component.html',
  styleUrls: ['./gallery-carousel.component.css']
})
export class GalleryCarouselComponent implements OnChanges {
  @Input() imagenes: string[] = [];
  @Input() isVisible = false;
  @Output() closed = new EventEmitter<void>();

  indice = 0;
  cargando = signal<boolean>(true);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && this.isVisible) {
      this.indice = 0;
      this.cargando.set(true);
    }
  }

  get imagenActual(): string {
    const img = this.imagenes[this.indice];
    return img ? encodeURI(img) : '';
  }

  anterior() {
    if (this.imagenes.length === 0) return;
    this.cargando.set(true);
    this.indice = (this.indice - 1 + this.imagenes.length) % this.imagenes.length;
  }

  siguiente() {
    if (this.imagenes.length === 0) return;
    this.cargando.set(true);
    this.indice = (this.indice + 1) % this.imagenes.length;
  }

  cerrar() {
    this.closed.emit();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (!this.isVisible) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.cerrar();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.anterior();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.siguiente();
    }
  }
}
