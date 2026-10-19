import { Routes } from '@angular/router';
import { TourShell } from './componentes/tour-shell/tour-shell';

export const routes: Routes = [
  { path: '', component: TourShell },
  { path: '**', redirectTo: '' },
];
