import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DATA_ENVIRONMENT } from '../../data/data.environment';
import {
  Building,
  BuildingInfo,
  BuildingPlan,
  BuildingTour3d,
  MediaKey,
  TabDef,
  UiLabels,
} from '../../models/environment.models';
import { EnterHotspot } from '../enter-hotspot/enter-hotspot';
import { IconButton } from '../icon-button/icon-button';
import { InfoModal } from '../info-modal/info-modal';
import { LoadingScreen } from '../loading-screen/loading-screen';
import { MediaImage } from '../media-image/media-image';
import { NavControls } from '../nav-controls/nav-controls';
import { StartScreen } from '../start-screen/start-screen';
import { StopIndicators, StopMarker } from '../stop-indicators/stop-indicators';
import { GaleriaImagenes } from '../tabs/galeria-imagenes/galeria-imagenes';
import { Informacion } from '../tabs/informacion/informacion';
import { Planos } from '../tabs/planos/planos';
import { Recorrido3D } from '../tabs/recorrido-3d/recorrido-3d';

/**
 * Galería de componentes reutilizables.
 *
 * Herramienta de desarrollo: muestra cada componente aislado con sus inputs,
 * estados y eventos para revisarlos y corregirlos sin tener que recorrer el
 * tour. Nada de lo que pasa acá afecta la escena real.
 */
@Component({
  selector: 'app-component-gallery',
  standalone: true,
  imports: [
    IconButton,
    StartScreen,
    LoadingScreen,
    StopIndicators,
    NavControls,
    EnterHotspot,
    MediaImage,
    InfoModal,
    Informacion,
    GaleriaImagenes,
    Planos,
    Recorrido3D,
  ],
  templateUrl: './component-gallery.html',
  styleUrl: './component-gallery.css',
})
export class ComponentGallery {
  private readonly router = inject(Router);

  readonly labels: UiLabels = DATA_ENVIRONMENT.ui;
  readonly tabs: TabDef[] = DATA_ENVIRONMENT.tabs;
  readonly building: Building = DATA_ENVIRONMENT.buildings[0];
  readonly heroText = DATA_ENVIRONMENT.ui.hero;

  readonly gallery: MediaKey[] = this.building.content.gallery;
  readonly plans: BuildingPlan[] = this.building.content.plans;
  readonly info: BuildingInfo = this.building.content.info;
  readonly tour3d: BuildingTour3d | undefined = this.building.content.tour3d;
  readonly poster: MediaKey = DATA_ENVIRONMENT.tour.stops[0].poster;

  readonly demoStops: StopMarker[] = DATA_ENVIRONMENT.tour.stops.map((stop) => ({
    id: stop.id,
    label: stop.label,
  }));

  readonly activeStop = signal(this.demoStops[0].id);
  readonly canPrev = signal(true);
  readonly canNext = signal(true);
  readonly modalOpen = signal(false);

  /** Salida de los eventos (`@Output`) de los componentes, para verificarlos. */
  readonly events = signal<string[]>([]);

  goBack(): void {
    this.router.navigate(['/']);
  }

  log(source: string, event: string): void {
    const time = new Date().toLocaleTimeString('es-AR', { hour12: false });
    this.events.update((list) => [`${time} · ${source}: ${event}`, ...list].slice(0, 6));
  }
}
