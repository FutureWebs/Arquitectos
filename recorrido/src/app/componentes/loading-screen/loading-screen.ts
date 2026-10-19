import { Component, Input } from '@angular/core';

/** Pantalla de carga con spinner. Se muestra mientras carga el arte de inicio. */
@Component({
  selector: 'app-loading-screen',
  standalone: true,
  templateUrl: './loading-screen.html',
  styleUrl: './loading-screen.css',
})
export class LoadingScreen {
  @Input() text = 'Cargando...';
}
