import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Pantalla de recepción: texto superior + botón "Empezar" centrado
 * sobre el arte del complejo (que dibuja `app-media-stage`).
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
  @Output() started = new EventEmitter<void>();
}
