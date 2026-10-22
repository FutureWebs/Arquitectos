import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
export class InfoCard {
  @Input() info!: InfoDepto;
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() open = new EventEmitter<void>();
  @ViewChild('planta3dContainer') planta3dContainer!: ElementRef<HTMLDivElement>;

  activeTab: 'informacion' | 'galeria' | 'planos' | 'planta3d' = 'informacion';
  is3DFullscreen = false;

  safeUrl: SafeResourceUrl = '';

  constructor(private sanitizer: DomSanitizer) {}

  selectTab(tab: 'informacion' | 'galeria' | 'planos' | 'planta3d') {
    this.activeTab = tab;
    if (tab === 'planta3d' && this.info?.planta3D) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.info.planta3D);
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

  toggle3DFullscreen() {
    this.is3DFullscreen = !this.is3DFullscreen;
  }
}
