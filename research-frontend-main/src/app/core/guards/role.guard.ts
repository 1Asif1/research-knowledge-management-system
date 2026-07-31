import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '@core/services/token-storage.service';
import { Role, dashboardRouteForRole } from '@core/models';

// Usage in routes: { path: '...', canActivate: [roleGuard], data: { roles: [Role.ADMIN] } }
export const roleGuard: CanActivateFn = (route) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Role[] | undefined;
  const user = tokenStorage.getUser();

  if (!user) {
    return router.createUrlTree(['/auth/login']);
  }

  if (!allowedRoles || allowedRoles.includes(user.role)) {
    return true;
  }

  if (user.role === Role.ADMIN) {
    return true;
  }

  // Authenticated but wrong role — send them to their own dashboard rather
  // than a dead end.
  return router.createUrlTree([dashboardRouteForRole(user.role)]);
};
