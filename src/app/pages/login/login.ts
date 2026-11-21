import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';

import { InputErrorStateMatcherExample } from '../../components/custom-input/custom-input';
import { AuthenticationService } from '../../api/api/authentication.service';
import { UserRegistrationRequestDto } from '../../api/model/userRegistrationRequestDto';
import { TokenService } from '../../core/auth/token.service';

/** Cross-field validator: password and repeatPassword must be equal. */
const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const repeat = group.get('repeatPassword')?.value;
  return password && repeat && password !== repeat ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputErrorStateMatcherExample],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  private tokenService = inject(TokenService);

  currentView: 'menu' | 'login' | 'register' = 'menu';
  errorMessages = signal<string[]>([]);
  loading = signal(false);

  // Validators mirror the backend DTOs (UserLoginRequestDto / UserRegistrationRequestDto)
  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  registerForm = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      firstName: ['', [Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.minLength(2), Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(35)]],
      repeatPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch },
  );

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.startRequest();

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => this.finishAuth(response.token),
      error: (err: HttpErrorResponse) => this.handleError(err),
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.startRequest();

    const { firstName, lastName, ...rest } = this.registerForm.getRawValue();
    // Optional fields: send undefined instead of "" (backend @Size(min = 2) rejects empty strings)
    const dto: UserRegistrationRequestDto = {
      ...rest,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
    };

    // Register, then log in with the same credentials so the user lands on the dashboard
    this.authService
      .registerUser(dto)
      .pipe(switchMap(() => this.authService.login({ email: dto.email, password: dto.password })))
      .subscribe({
        next: (response) => this.finishAuth(response.token),
        error: (err: HttpErrorResponse) => this.handleError(err),
      });
  }

  showLogin() {
    this.switchView('login');
  }

  showRegistration() {
    this.switchView('register');
  }

  showMenu() {
    this.switchView('menu');
  }

  private switchView(view: 'menu' | 'login' | 'register') {
    this.currentView = view;
    this.errorMessages.set([]);
    this.loginForm.reset();
    this.registerForm.reset();
  }

  private startRequest() {
    this.loading.set(true);
    this.errorMessages.set([]);
  }

  private finishAuth(token: string | undefined) {
    this.loading.set(false);
    if (!token) {
      this.errorMessages.set(['Unexpected server response. Please try again.']);
      return;
    }
    this.tokenService.set(token);
    this.router.navigate(['/dashboard']);
  }

  /** Maps backend error format (GlobalExceptionHandler) to messages for the user. */
  private handleError(err: HttpErrorResponse) {
    this.loading.set(false);

    if (err.status === 0) {
      this.errorMessages.set(['Server is unavailable. Please try again later.']);
    } else if (err.status === 401) {
      this.errorMessages.set(['Invalid email or password.']);
    } else if (Array.isArray(err.error?.errors)) {
      this.errorMessages.set(err.error.errors); // 400: {"errors": [...]}
    } else if (typeof err.error?.error === 'string') {
      this.errorMessages.set([err.error.error]); // 409 etc.: {"error": "..."}
    } else {
      this.errorMessages.set(['Something went wrong. Please try again.']);
    }
  }
}
