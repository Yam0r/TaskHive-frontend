import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { UserResponseDto } from '../../api';
import { retry } from 'rxjs';
import { UsersService } from '../../api/api/users.service';

@Component({
  selector: 'app-sidebar',
  imports: [
    MatIconModule, 
    RouterModule,
    CommonModule,

  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent implements OnInit{
  private userService = inject(UsersService)
  private cdr = inject(ChangeDetectorRef)
  private router = inject(Router);

  currentUser:UserResponseDto | null = null;

  ngOnInit() {
    this.userService.getMyProfileInfo().subscribe({
      next: (user) => {
        console.log('Profile is upload:', user);
        this.currentUser = user;
        this.cdr.detectChanges()
      },
      error: (err) => {
        console.error('Ошибка при загрузке профиля (возможно, токен истек или не передался):', err);
      }
    });
  }

  getInitials(firstName?: string, lastName?: string): string {
    if (!firstName && !lastName) return 'UN';
    
    const firstLetter = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastLetter = lastName ? lastName.charAt(0).toUpperCase() : '';
    
    return `${firstLetter}${lastLetter}`;
  }

  logout(){
    localStorage.removeItem('token');
    this.currentUser = null;
    this.router.navigate(['/login'])
  }
}
