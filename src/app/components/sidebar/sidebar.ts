import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { UserResponseDto } from '../../api';
import { UsersService } from '../../api/api/users.service';
import { TokenService } from '../../core/auth/token.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-sidebar',
  imports: [TranslocoPipe, 
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
  private tokenService = inject(TokenService);

  currentUser:UserResponseDto | null = null;

  ngOnInit() {
    // A 401 here is handled globally by authInterceptor (logout + redirect)
    this.userService.getMyProfileInfo().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.cdr.detectChanges();
      },
    });
  }

  getInitials(firstName?: string, lastName?: string): string {
    if (!firstName && !lastName) return 'UN';
    
    const firstLetter = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastLetter = lastName ? lastName.charAt(0).toUpperCase() : '';
    
    return `${firstLetter}${lastLetter}`;
  }

  logout(){
    this.tokenService.clear();
    this.currentUser = null;
    this.router.navigate(['/login'])
  }
}
