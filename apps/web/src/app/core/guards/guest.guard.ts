import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  if (!token) {
    // nicht eingeloggt → darf auf /login
    return true;
  }

  const role = auth.getUserRole();

  if (role === 'ADMIN') {
    return router.parseUrl('/admin');
  }

  return router.parseUrl('/restaurants');
};
