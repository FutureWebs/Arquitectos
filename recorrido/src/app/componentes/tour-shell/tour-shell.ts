import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DATA_ENVIRONMENT } from '../../data/data.environment';
import { TourStateService } from '../../services/tour-state.service';
import { EnterHotspot } from '../enter-hotspot/enter-hotspot';
import { IconButton } from '../icon-button/icon-button';
import { InfoModal } from '../info-modal/info-modal';
import { LoadingScreen } from '../loading-screen/loading-screen';
import { MediaStage } from '../media-stage/media-stage';
import { NavControls } from '../nav-controls/nav-controls';
import { StartScreen } from '../start-screen/start-screen';
import { StopIndicators, StopMarker } from '../stop-indicators/stop-indicators';

/**
 * Escenario del recorrido: compone los componentes reutilizables sobre la
 * capa multimedia y delega toda la lógica en `TourStateService`.
 *
 *   INICIO (SVG + Empezar) → EXTERIOR (paradas A/B/C + hotspots) → INTERIOR (modal)
 */
@Component({
  selector: 'app-tour-shell',
  standalone: true,
  imports: [
    MediaStage,
    LoadingScreen,
    StartScreen,
    IconButton,
    StopIndicators,
    NavControls,
    EnterHotspot,
    InfoModal,
  ],
  templateUrl: './tour-shell.html',
  styleUrl: './tour-shell.css',
})
export class TourShell implements OnInit {
  readonly state = inject(TourStateService);
  private readonly router = inject(Router);
  readonly labels = DATA_ENVIRONMENT.ui;
  readonly tabs = DATA_ENVIRONMENT.tabs;
  readonly stopMarkers: StopMarker[] = DATA_ENVIRONMENT.tour.stops.map((stop) => ({
    id: stop.id,
    label: stop.label,
  }));

  readonly isFullscreen = signal(false);

  ngOnInit(): void {
    this.state.init();
  }

  /** Acceso a la galería de componentes reutilizables (herramienta de desarrollo). */
  openGallery(): void {
    this.router.navigate(['/componentes']);
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()?.then(
        () => this.isFullscreen.set(true),
        (error: unknown) => console.warn('[tour-shell]', error),
      );
    } else {
      document.exitFullscreen()?.then(
        () => this.isFullscreen.set(false),
        (error: unknown) => console.warn('[tour-shell]', error),
      );
    }
  }
}
