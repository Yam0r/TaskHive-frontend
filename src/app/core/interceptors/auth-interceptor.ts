import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TokenService } from '../auth/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Never send our JWT to third-party hosts (CDNs, fonts, external APIs)
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const tokenService = inject(TokenService);
  const router = inject(Router);
  const token = tokenService.get();

  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 on a protected endpoint = token expired or invalid -> log out.
      // 401 from /auth/login is just wrong credentials, the login form handles it.
      const isAuthEndpoint = req.url.startsWith(`${environment.apiUrl}/auth/`);
      if (error.status === 401 && token && !isAuthEndpoint) {
        tokenService.clear();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
