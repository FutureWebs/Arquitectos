import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Pantalla de recepción: texto superior + botón "Empezar" centrado
 * sobre el arte del complejo (que dibuja `app-media-stage`).
 * A la derecha lleva un acceso a la galería de componentes reutilizables.
 */
@Component({
  selector: 'app-start-screen',
  standalone: true,
  templateUrl: './start-screen.html',
  styleUrl: './start-screen.css',
})
export class StartScreen {
  @Input() heroText = '';
  @Input() startLabel = 'Empezar';
  @Input() componentsLabel = 'Componentes';
  @Output() started = new EventEmitter<void>();
  @Output() componentsRequested = new EventEmitter<void>();
}
