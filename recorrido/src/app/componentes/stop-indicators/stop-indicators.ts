import { Component, Input } from '@angular/core';

export interface StopMarker {
  id: string;
  label: string;
}

/** Indicador de en qué parada del recorrido exterior nos encontramos (A · B · C). */
@Component({
  selector: 'app-stop-indicators',
  standalone: true,
  templateUrl: './stop-indicators.html',
  styleUrl: './stop-indicators.css',
})
export class StopIndicators {
  @Input({ required: true }) stops: StopMarker[] = [];
  @Input() activeId = '';
  @Input() label = 'Paradas del recorrido';
}
