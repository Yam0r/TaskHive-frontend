import { Injectable } from '@angular/core';

const TOKEN_KEY = 'token';

/**
 * Single place that knows where the JWT is stored.
 *
 * The expiry check here is only for UX (redirect to /login early instead of
 * waiting for a 401). The backend still verifies the signature and expiry on
 * every request, so a tampered token gains nothing.
 */
@Injectable({ providedIn: 'root' })
export class TokenService {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  /** True if a token exists and its `exp` claim is still in the future. */
  isLoggedIn(): boolean {
    const token = this.get();
    if (!token) {
      return false;
    }
    const exp = this.readExpiry(token);
    if (exp === null || exp * 1000 <= Date.now()) {
      this.clear();
      return false;
    }
    return true;
  }

  private readExpiry(token: string): number | null {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const exp = JSON.parse(json).exp;
      return typeof exp === 'number' ? exp : null;
    } catch {
      return null; // malformed token
    }
  }
}
