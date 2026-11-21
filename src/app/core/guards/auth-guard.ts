import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TokenService } from '../auth/token.service';

/** Protected pages: only for users with a valid (not expired) token. */
export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  return tokenService.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

/** Login page: a logged-in user is sent straight to the dashboard. */
export const guestGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  return tokenService.isLoggedIn() ? router.createUrlTree(['/dashboard']) : true;
};
