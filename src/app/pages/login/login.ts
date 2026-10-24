import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { email } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterOutlet } from '@angular/router';

import { InputErrorStateMatcherExample } from "../../components/custom-input/custom-input";
import { AuthenticationService } from '../../api/api/authentication.service';


@Component({
  selector: 'app-login',
  imports: [
    RouterOutlet,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    InputErrorStateMatcherExample
],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private form_builder = inject(FormBuilder);
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  currentView: 'menu' | 'login' | 'register' = 'menu';

  loginForm = this.form_builder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password:['', [Validators.required, Validators.minLength(8)]],
  })
  
  onSubmit(){
    if (this.loginForm.valid){
      const formData = this.loginForm.getRawValue()
      console.log("Отправка на бэкенд: ", formData)

      this.authService.login(formData)
        .subscribe({
          next: (response: any) => {
            console.log('Успешный ответ от бэкенда! Токен:', response)
            localStorage.setItem('token', response.token)
            this.router.navigate(['./dashboard'])
          },
          error: (error) => {
            console.log('Ошибка авторизации:', error)
          }
        })
    } else {
      console.log("Form isn't valid");
    }
  }

  showLogin(){
    this.currentView = 'login';
  }

  showRegistration(){
    this.currentView = 'register';
  }

  showMenu(){
    this.currentView = 'menu';
  }
}
