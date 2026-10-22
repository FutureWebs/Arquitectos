import { Routes } from '@angular/router';
import { LoginComponent } from './components/admin/login/login.component';
import { AdminEdificioComponent } from './components/admin/admin-edificio.component'; // Ajusta la ruta a tu componente
import { authGuard } from './guards/auth.guard';
import {MainComponent} from './components/main/main.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: MainComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminEdificioComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'home' }
];
