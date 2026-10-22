import { Component, Input, Output, EventEmitter } from '@angular/core';
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

  // Devuelve el punto central (X, Y) para renderizar la etiqueta dentro del SVG de 1080x1920
  getCenterCoords(id: string): { x: number, y: number } {
    // Limpiamos el ID por si viene dinámico como "Apto-5A"
    const letra = id.charAt(id.length - 1);

    switch (letra) {
      case 'A': return { x: 273, y: 719 };  // Centro A (Arriba Izquierda)
      case 'B': return { x: 271, y: 1074 }; // Centro B (Abajo Izquierda)
      case 'C': return { x: 839, y: 717 };  // Centro C (Arriba Derecha)
      case 'D': return { x: 842, y: 1073 }; // Centro D (Abajo Derecha)
      default: return { x: 540, y: 960 };   // Centro muerto por defecto
    }
  }
}

