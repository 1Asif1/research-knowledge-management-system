import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import { dashboardRouteForRole, roleDisplayName } from '@core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly tokenStorage = inject(TokenStorageService);
  readonly user = this.tokenStorage.user;
  readonly roleDisplayName = roleDisplayName;
  readonly profileRoute = computed(() => {
    const role = this.user()?.role;
    if (!role) {
      return '/auth/login';
    }
    return `/${role.toLowerCase()}/profile`;
  });
  readonly defaultRoute = computed(() => dashboardRouteForRole(this.user()?.role));

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
