import { Routes } from '@angular/router';
import { TourShell } from './componentes/tour-shell/tour-shell';

export const routes: Routes = [
  { path: '', component: TourShell },
  // Galería de componentes reutilizables (herramienta de desarrollo visual).
  {
    path: 'componentes',
    loadComponent: () =>
      import('./componentes/component-gallery/component-gallery').then(
        (m) => m.ComponentGallery,
      ),
  },
  { path: '**', redirectTo: '' },
];
