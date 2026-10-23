import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.userProfile$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true; // Usuario autenticado, permite el acceso
      } else {
        router.navigate(['/login']); // Si no está logueado, redirige a login
        return false;
      }
    })
  );
};
