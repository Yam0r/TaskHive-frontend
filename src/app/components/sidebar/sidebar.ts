import { Component, computed, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { TokenService } from '../../core/auth/token.service';
import { TaskStore } from '../../core/tasks/task-store.service';

@Component({
  selector: 'app-sidebar',
  imports: [TranslocoPipe, MatIconModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly store = inject(TaskStore);

  readonly user = this.store.me;

  /** Tasks that are not done yet, shown next to "My tasks". */
  readonly openTasks = computed(() => {
    const { total, completed } = this.store.stats();
    return total - completed;
  });

  /** "First Last", or the part of the email before @ when the user has no name. */
  readonly displayName = computed(() => {
    const user = this.user();
    if (!user) return '';
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return fullName || (user.email ?? '').split('@')[0];
  });

  readonly initials = computed(() => {
    const user = this.user();
    if (user?.firstName || user?.lastName) {
      return ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase();
    }
    return this.displayName().slice(0, 2).toUpperCase();
  });

  ngOnInit(): void {
    // A 401 here is handled globally by authInterceptor (logout + redirect)
    if (!this.user()) {
      this.store.load();
    }
  }

  logout(): void {
    this.tokenService.clear();
    this.store.reset();
    this.router.navigate(['/login']);
  }
}
