import {Component, Input, Output, EventEmitter, ElementRef, ViewChild, SimpleChanges, signal} from '@angular/core';
import {Apartment, Floor} from '../../models/building.models';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-edificio-overlay',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './edificio-overlay.component.html',
  styleUrls: ['./edificio-overlay.component.css']
})
export class EdificioOverlay {
  @Input({ required: true }) floorData!: Floor;
  @Input({ required: true }) listaPisos: Floor[] = [];
  @Input() isVisible = false;
  @Input() isFullscreen = false;
  /** Durante la intro de entrada (T2 → T) los botones de piso están inactivos */
  @Input() seleccionBloqueada = false;

  @Output() backPressed = new EventEmitter<void>();
  @Output() toggleFullscreen = new EventEmitter<void>();
  @Output() apartmentSelected = new EventEmitter<Apartment>();
  @Output() floorChanged = new EventEmitter<Floor>();

  @ViewChild('overlayContainer') overlayContainer!: ElementRef<HTMLDivElement>;

  isFloorFlashing = signal<boolean>(false);
  private flashTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['floorData']) {
      const prev: Floor | undefined = changes['floorData'].previousValue;
      const curr: Floor | undefined = changes['floorData'].currentValue;

      if (curr && prev && prev.nivel !== curr.nivel && this.isVisible) {
        this.triggerFloorFlash();
      }
    }

    if ((changes['isVisible'] && this.isVisible) || (changes['floorData'] && this.isVisible)) {
      this.centerScrollToMiddle();
    }
  }

  private triggerFloorFlash() {
    if (this.flashTimer) {
      clearTimeout(this.flashTimer);
    }
    this.isFloorFlashing.set(false);

    requestAnimationFrame(() => {
      this.isFloorFlashing.set(true);
      this.flashTimer = setTimeout(() => {
        this.isFloorFlashing.set(false);
        this.flashTimer = null;
      }, 150);
    });
  }

  ngOnDestroy() {
    if (this.flashTimer) {
      clearTimeout(this.flashTimer);
    }
  }

  get pisosInvertidosSinPrimero() {

    return this.listaPisos.slice().reverse().slice(1);
  }

  deptoNumero(apto: Apartment): string {
    return apto.id.split('-Apto-')[1] || apto.id;
  }


  centerScrollToMiddle() {
    if (window.innerWidth < 1024) {
      // Usamos un pequeño delay y requestAnimationFrame para asegurar que Angular ya renderizó el DOM
      setTimeout(() => {
        requestAnimationFrame(() => {
          if (this.overlayContainer) {
            const container = this.overlayContainer.nativeElement;
            const scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
            container.scrollLeft = scrollLeft;
          }
        });
      }, 60);
    }
  }

}

