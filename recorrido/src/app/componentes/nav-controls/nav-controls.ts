import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconButton } from '../icon-button/icon-button';

/**
 * Flechas de navegación entre paradas del recorrido exterior.
 * Si una dirección no tiene parada destino (o falta el video de transición),
 * el botón queda deshabilitado.
 */
@Component({
  selector: 'app-nav-controls',
  standalone: true,
  imports: [IconButton],
  templateUrl: './nav-controls.html',
  styleUrl: './nav-controls.css',
})
export class NavControls {
  @Input() prevLabel = 'Parada anterior';
  @Input() nextLabel = 'Parada siguiente';
  @Input() canPrev = true;
  @Input() canNext = true;
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
}
