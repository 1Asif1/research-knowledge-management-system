import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

import { ModuleHeaderComponent } from '@shared/components/module-header/module-header.component';
import { UserService } from '@core/services/user.service';
import { ALL_ROLES, Role, UserResponse, roleDisplayName } from '@core/models';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, ModuleHeaderComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-module-header module="MODULE 1" title="Manage Users"></app-module-header>

    <section class="users-tools">
      <label class="users-search">
        <span>Search users</span>
        <input type="text" [formControl]="searchControl" placeholder="Search by name or email" />
      </label>
      <p class="users-hint" *ngIf="searching()">Searching...</p>
    </section>

    <section class="users-create">
      <h3>Create user</h3>
      <form [formGroup]="createForm" (ngSubmit)="createUser()">
        <input type="text" formControlName="firstName" placeholder="First name" />
        <input type="text" formControlName="lastName" placeholder="Last name" />
        <input type="email" formControlName="email" placeholder="Email" />
        <input type="password" formControlName="password" placeholder="Password" />
        <select formControlName="role">
          <option *ngFor="let role of roles" [value]="role">{{ roleDisplayName(role) }}</option>
        </select>
        <button type="submit" [disabled]="creating()">{{ creating() ? 'Creating...' : 'Create user' }}</button>
      </form>
    </section>

    <div class="users-success" *ngIf="success()">{{ success() }}</div>
    <div class="users-error" *ngIf="error()">{{ error() }}</div>

    <section class="users-list" *ngIf="!loading() && users().length > 0">
      <article *ngFor="let user of users()">
        <div class="users-card-head">
          <div class="users-card-title">
            <h3>{{ user.firstName }} {{ user.lastName }}</h3>
            <span class="role-badge" [class]="(user.role || '').toLowerCase()">{{ roleDisplayName(user.role) }}</span>
          </div>
          <p>{{ user.email }}</p>
        </div>
        <div class="users-actions">
          <select [value]="roleDrafts()[user.id] || user.role" (change)="onRoleDraftChange(user.id, $any($event.target).value)">
            <option *ngFor="let role of roles" [value]="role" [selected]="role === (roleDrafts()[user.id] || user.role)">{{ roleDisplayName(role) }}</option>
          </select>
          <button type="button" (click)="updateRole(user)" [disabled]="updatingUserId() === user.id">
            {{ updatingUserId() === user.id ? 'Saving...' : 'Update role' }}
          </button>
          <button type="button" class="danger" (click)="deleteUser(user)" [disabled]="deletingUserId() === user.id">
            {{ deletingUserId() === user.id ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </article>
    </section>

    <p class="users-empty" *ngIf="loading()">Loading users...</p>
    <p class="users-empty" *ngIf="!loading() && users().length === 0">No users found.</p>
  `,
  styles: [`
    .users-tools,
    .users-create,
    .users-list article,
    .users-error,
    .users-success,
    .users-empty {
      border: 1px solid #dbe2ed;
      border-radius: 12px;
      background: #fff;
      padding: 14px 18px;
      margin-bottom: 12px;
    }

    .users-search {
      display: grid;
      gap: 6px;
    }

    .users-search span {
      font-size: 14px;
      font-weight: 600;
      color: #10284a;
    }

    .users-search input {
      border: 1px solid #c9d5e8;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 14px;
    }

    .users-hint {
      margin: 8px 0 0;
      font-size: 13px;
      color: #455677;
    }

    .users-create h3 {
      margin: 0 0 10px;
      color: #10284a;
      font-size: 16px;
    }

    .users-create form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
      align-items: center;
    }

    .users-create input,
    .users-create select,
    .users-actions select {
      border: 1px solid #c9d5e8;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 14px;
      background: #fff;
    }

    button {
      border: 1px solid #1d5bbf;
      background: #1d5bbf;
      color: #fff;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    button.danger {
      border-color: #b53b3b;
      background: #b53b3b;
    }

    .users-success {
      border-color: #c4e8cd;
      background: #f2fcf4;
      color: #23613b;
    }

    .users-error,
    .users-empty {
      border-color: #e5d0d0;
      background: #fff2f2;
      color: #8b3735;
    }

    .users-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .users-list article {
      margin-bottom: 0;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
    }

    .users-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .users-card-head h3 {
      margin: 0;
      font-size: 18px;
      color: #10284a;
    }

    .role-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      background: #e2e8f0;
      color: #334155;
    }

    .role-badge.researcher {
      background: #e0f2fe;
      color: #0369a1;
    }

    .role-badge.reviewer {
      background: #fef3c7;
      color: #92400e;
    }

    .role-badge.editor {
      background: #f3e8ff;
      color: #6b21a8;
    }

    .role-badge.admin {
      background: #fee2e2;
      color: #991b1b;
    }

    .users-card-head p {
      margin: 4px 0 0;
      color: #455677;
      font-size: 14px;
    }

    .users-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  `]
})
export class UsersPageComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly subscriptions = new Subscription();

  readonly roles = ALL_ROLES;
  readonly roleDisplayName = roleDisplayName;
  readonly users = signal<UserResponse[]>([]);
  readonly loading = signal(false);
  readonly searching = signal(false);
  readonly creating = signal(false);
  readonly updatingUserId = signal<number | null>(null);
  readonly deletingUserId = signal<number | null>(null);
  readonly success = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly roleDrafts = signal<Record<number, Role>>({});

  readonly searchControl = this.fb.nonNullable.control('');
  readonly createForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: [Role.RESEARCHER, Validators.required]
  });

  constructor() {
    this.fetchUsers('');

    this.subscriptions.add(
      this.searchControl.valueChanges
        .pipe(debounceTime(250), distinctUntilChanged())
        .subscribe((query) => this.fetchUsers(query))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  createUser(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.creating.set(true);
    this.error.set(null);
    this.success.set(null);

    this.userService.createUser(this.createForm.getRawValue()).subscribe({
      next: () => {
        this.creating.set(false);
        this.success.set('User created successfully.');
        this.createForm.patchValue({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: Role.RESEARCHER
        });
        this.fetchUsers(this.searchControl.getRawValue());
      },
      error: (error: HttpErrorResponse) => {
        this.creating.set(false);
        if (error.status === 409) {
          this.error.set('This email is already registered.');
          return;
        }
        this.error.set(error.status === 0 ? 'User service is not reachable.' : 'Unable to create user.');
      }
    });
  }

  updateRole(user: UserResponse): void {
    const nextRole = this.roleDrafts()[user.id];
    if (!nextRole || nextRole === user.role) {
      return;
    }

    this.updatingUserId.set(user.id);
    this.error.set(null);
    this.success.set(null);

    this.userService.updateUser(user.id, { role: nextRole }).subscribe({
      next: (updatedUser) => {
        this.updatingUserId.set(null);
        this.success.set(`Role updated for ${updatedUser.firstName} ${updatedUser.lastName}.`);
        this.users.update((currentUsers) =>
          currentUsers.map((currentUser) => currentUser.id === updatedUser.id ? updatedUser : currentUser)
        );
        this.roleDrafts.update((drafts) => ({
          ...drafts,
          [updatedUser.id]: updatedUser.role
        }));
      },
      error: (error: HttpErrorResponse) => {
        this.updatingUserId.set(null);
        this.error.set(error.status === 0 ? 'User service is not reachable.' : 'Unable to update role.');
      }
    });
  }

  deleteUser(user: UserResponse): void {
    if (!window.confirm(`Delete ${user.firstName} ${user.lastName}? This cannot be undone.`)) {
      return;
    }

    this.deletingUserId.set(user.id);
    this.error.set(null);
    this.success.set(null);

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.deletingUserId.set(null);
        this.success.set(`Deleted user ${user.firstName} ${user.lastName}.`);
        this.users.update((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== user.id));
      },
      error: (error: HttpErrorResponse) => {
        this.deletingUserId.set(null);
        this.error.set(error.status === 0 ? 'User service is not reachable.' : 'Unable to delete user.');
      }
    });
  }

  onRoleDraftChange(userId: number, role: string): void {
    this.roleDrafts.update((currentDrafts) => ({ ...currentDrafts, [userId]: role as Role }));
  }

  private fetchUsers(query: string): void {
    if (!this.users().length) {
      this.loading.set(true);
    } else {
      this.searching.set(true);
    }
    this.error.set(null);

    this.userService.searchUsers(query).subscribe({
      next: (result) => {
        this.users.set(result);
        this.loading.set(false);
        this.searching.set(false);
        this.roleDrafts.set(
          result.reduce<Record<number, Role>>((drafts, user) => {
            drafts[user.id] = user.role;
            return drafts;
          }, {})
        );
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.searching.set(false);
        this.error.set(error.status === 0 ? 'User service is not reachable.' : 'Unable to load users.');
      }
    });
  }
}
