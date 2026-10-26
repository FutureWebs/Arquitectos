import {Component, Input, Output, EventEmitter, ElementRef, ViewChild, SimpleChanges} from '@angular/core';
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

  @Output() backPressed = new EventEmitter<void>();
  @Output() toggleFullscreen = new EventEmitter<void>();
  @Output() apartmentSelected = new EventEmitter<Apartment>();
  @Output() floorChanged = new EventEmitter<Floor>();

  @ViewChild('overlayContainer') overlayContainer!: ElementRef<HTMLDivElement>;

// Cada vez que cambie 'isVisible' o cambie de piso/datos, llamamos a esto:
  ngOnChanges(changes: SimpleChanges) {
    if ((changes['isVisible'] && this.isVisible) || (changes['floorData'] && this.isVisible)) {
      this.centerScrollToMiddle();
    }
  }

  get pisosInvertidosSinPrimero() {

    return this.listaPisos.slice().reverse().slice(1);
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

