import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  if (!token) {
    return router.parseUrl('/login');
  }

  const role = auth.getUserRole();
  if (role !== 'ADMIN') {
    return router.parseUrl('/restaurants');
  }

  return true;
};
