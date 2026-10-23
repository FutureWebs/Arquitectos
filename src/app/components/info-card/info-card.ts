import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { GaleriaImagenes } from '../tabs/galeria-imagenes/galeria-imagenes';
import { Planos } from '../tabs/planos/planos';
import { Informacion } from '../tabs/informacion/informacion';
import { InfoDepto } from '../../models/info-depto';

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

@Component({
  selector: 'app-info-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, GaleriaImagenes, Planos, Informacion],
  templateUrl: './info-card.html',
  styleUrl: './info-card.css'
})
export class InfoCard implements OnDestroy {
  @Input() info!: InfoDepto;
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() open = new EventEmitter<void>();
  @ViewChild('planta3dContainer') planta3dContainer!: ElementRef<HTMLDivElement>;

  activeTab: 'informacion' | 'galeria' | 'planos' | 'planta3d' = 'informacion';
  is3DFullscreen = false;
  usingFakeFullscreen = false;
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
    const container = this.planta3dContainer?.nativeElement as FullscreenElement | undefined;

    if (this.is3DFullscreen) {
      if (this.usingFakeFullscreen) {
        this.usingFakeFullscreen = false;
        this.is3DFullscreen = false;
      } else {
        document.exitFullscreen()?.catch(() => {});
      }
      return;
    }

    const request = container && (container.requestFullscreen ?? container.webkitRequestFullscreen);
    if (container && typeof request === 'function') {
      Promise.resolve(request.call(container))
        .then(() => {
          this.usingFakeFullscreen = false;
          this.is3DFullscreen = true;
        })
        .catch(() => this.enterFakeFullscreen());
      return;
    }

    this.enterFakeFullscreen();
  }

  @HostListener('document:fullscreenchange')
  @HostListener('document:webkitfullscreenchange')
  onFullscreenChange() {
    const stillFullscreen = !!(document.fullscreenElement ?? (document as any).webkitFullscreenElement);
    if (!stillFullscreen && this.is3DFullscreen && !this.usingFakeFullscreen) {
      this.is3DFullscreen = false;
    }
  }

  ngOnDestroy() {
    if (this.is3DFullscreen && !this.usingFakeFullscreen && document.fullscreenElement) {
      document.exitFullscreen()?.catch(() => {});
    }
  }

  private enterFakeFullscreen() {
    this.usingFakeFullscreen = true;
    this.is3DFullscreen = true;
  }
}
