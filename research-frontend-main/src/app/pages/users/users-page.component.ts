import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { ModuleHeaderComponent } from '@shared/components/module-header/module-header.component';
import { UserService } from '@core/services/user.service';
import { UserResponse } from '@core/models';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, ModuleHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-module-header module="MODULE 1" title="Manage Users"></app-module-header>

    <div class="users-error" *ngIf="error()">{{ error() }}</div>

    <section class="users-list" *ngIf="!error()">
      <article *ngFor="let user of users()">
        <h3>{{ user.firstName }} {{ user.lastName }}</h3>
        <p>{{ user.email }} · {{ user.role }}</p>
      </article>

      <p class="users-empty" *ngIf="!loading() && users().length === 0">No users found.</p>
      <p class="users-empty" *ngIf="loading()">Loading users...</p>
    </section>
  `,
  styles: [`
    .users-error,
    .users-empty {
      border: 1px solid #e5d0d0;
      background: #fff2f2;
      color: #8b3735;
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 14px;
    }

    .users-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .users-list article {
      border: 1px solid #dbe2ed;
      border-radius: 12px;
      background: #fff;
      padding: 14px 18px;
    }

    .users-list h3 {
      margin: 0 0 4px;
      font-size: 18px;
      color: #10284a;
    }

    .users-list p {
      margin: 0;
      font-size: 14px;
      color: #455677;
    }
  `]
})
export class UsersPageComponent {
  private readonly userService = inject(UserService);

  readonly users = signal<UserResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users.set(res);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.status === 0 ? 'User service is not reachable.' : 'Unable to load users.');
        this.loading.set(false);
      }
    });
  }
}
