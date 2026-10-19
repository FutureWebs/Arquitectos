import { Component, EventEmitter, HostListener, Input, Output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Building, TabDef, TabId, UiLabels } from '../../models/environment.models';
import { IconButton } from '../icon-button/icon-button';
import { GaleriaImagenes } from '../tabs/galeria-imagenes/galeria-imagenes';
import { Informacion } from '../tabs/informacion/informacion';
import { Planos } from '../tabs/planos/planos';
import { Recorrido3D } from '../tabs/recorrido-3d/recorrido-3d';

/**
 * Modal central con la información del edificio/cabaña y sus pestañas.
 * Se cierra con la X, con Escape o clickeando fuera; para salir del edificio
 * se usa el botón "Volver" de la escena (reproduce los videos inversos).
 */
@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [MatIconModule, IconButton, Informacion, GaleriaImagenes, Planos, Recorrido3D],
  templateUrl: './info-modal.html',
  styleUrl: './info-modal.css',
})
export class InfoModal {
  @Input() visible = false;
  @Input() building: Building | null = null;
  @Input() tabs: TabDef[] = [];
  @Input() labels!: UiLabels;
  @Output() closed = new EventEmitter<void>();

  readonly activeTabId = signal<TabId>('info');

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible) this.closed.emit();
  }

  selectTab(tabId: TabId): void {
    this.activeTabId.set(tabId);
  }
}
