import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Position } from '../../models/environment.models';

/**
 * Botón "Entrar" superpuesto sobre un edificio/cabaña dentro de la escena.
 * La posición (% del contenedor) viene de data.environment.ts y varía
 * según parada y dispositivo.
 */
@Component({
  selector: 'app-enter-hotspot',
  standalone: true,
  templateUrl: './enter-hotspot.html',
  styleUrl: './enter-hotspot.css',
})
export class EnterHotspot {
  @Input({ required: true }) label = 'Entrar';
  @Input({ required: true }) position: Position = { x: 50, y: 50 };
  @Input() buildingName = '';
  @Output() entered = new EventEmitter<void>();
}
