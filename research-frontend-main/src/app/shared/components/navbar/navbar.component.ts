import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '@core/services/auth.service';
import { Role } from '@core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly activeRole = signal<Role>(Role.RESEARCHER);
  readonly roleOptions: Role[] = [Role.RESEARCHER, Role.REVIEWER, Role.EDITOR, Role.ADMIN];

  constructor() {
    this.syncRoleWithCurrentRoute();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.syncRoleWithCurrentRoute());
  }

  onRoleChange(value: string): void {
    if (!this.isRole(value)) {
      return;
    }
    this.activeRole.set(value);
    this.router.navigate([`/${value.toLowerCase()}/dashboard`]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  private syncRoleWithCurrentRoute(): void {
    const segment = this.router.url.split('?')[0].split('/').filter(Boolean)[0]?.toUpperCase();
    if (segment && this.isRole(segment)) {
      this.activeRole.set(segment);
    }
  }

  private isRole(value: string): value is Role {
    return this.roleOptions.includes(value as Role);
  }
}
