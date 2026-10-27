import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { GaleriaImagenes } from '../tabs/galeria-imagenes/galeria-imagenes';
import { Planos } from '../tabs/planos/planos';
import { Informacion } from '../tabs/informacion/informacion';
import { InfoDepto } from '../../models/info-depto';

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, GaleriaImagenes, Planos, Informacion],
  templateUrl: './info-card.html',
  styleUrl: './info-card.css'
})
export class InfoCard implements OnChanges {
  @Input() info!: InfoDepto;
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() open = new EventEmitter<void>();

  activeTab: 'informacion' | 'galeria' | 'planos' = 'informacion';

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['visible'] && this.visible) || changes['info']) {
      this.activeTab = 'informacion';
    }
  }

  selectTab(tab: 'informacion' | 'galeria' | 'planos') {
    this.activeTab = tab;
  }

  abrirRecorrido3D() {
    if (this.info?.planta3D) {
      window.open(this.info.planta3D, '_blank', 'noopener');
    }
  }

  toggle() {
    if (this.visible) {
      this.close.emit();
    } else {
      this.open.emit();
    }
  }

  onClose() {
    this.close.emit();
  }
}
