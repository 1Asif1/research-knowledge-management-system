import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Role } from '@core/models';
import { TokenStorageService } from '@core/services/token-storage.service';
import { ModuleHeaderComponent } from '@shared/components/module-header/module-header.component';
import { SummaryCardComponent } from '@shared/components/summary-card/summary-card.component';
import { roleFromUrl, roleLabel } from '@pages/page-role.utils';

interface DashboardCard {
  title: string;
  description: string;
  meta?: string;
  route: string;
}

@Component({
  selector: 'app-role-dashboard',
  standalone: true,
  imports: [CommonModule, ModuleHeaderComponent, SummaryCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-module-header [module]="'MODULE 1 · ' + roleLabel(activeRole())" [title]="'Welcome back, ' + displayName()">
    </app-module-header>

    <div class="card-grid">
      <app-summary-card
        *ngFor="let card of cards()"
        [title]="card.title"
        [description]="card.description"
        [meta]="card.meta ?? ''"
        [route]="card.route"
      >
      </app-summary-card>
    </div>
  `,
  styles: [`
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }
  `]
})
export class RoleDashboardComponent {
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly roleLabel = roleLabel;
  readonly activeRole = computed(() => roleFromUrl(this.router.url));
  readonly displayName = computed(() => {
    const user = this.tokenStorage.user();
    if (!user) return 'A. Kamal';
    const firstInitial = user.firstName?.charAt(0).toUpperCase() ?? 'A';
    return `${firstInitial}. ${user.lastName || 'Kamal'}`;
  });

  readonly cards = computed<DashboardCard[]>(() => {
    const role = this.activeRole();
    const base = `/${role.toLowerCase()}`;
    switch (role) {
      case Role.ADMIN:
        return [
          { title: 'Research Papers', description: 'Browse, upload, and track submission status.', route: `${base}/papers` },
          { title: 'Reports & Analytics', description: 'Publication trends and performance metrics.', route: `${base}/reports` },
          { title: 'Notifications', description: '2 unread', route: `${base}/notifications` },
          { title: 'Manage Users', description: 'Roles, permissions, journals, categories.', route: `${base}/users` }
        ];
      case Role.EDITOR:
        return [
          { title: 'Research Papers', description: 'Browse, upload, and track submission status.', route: `${base}/papers` },
          { title: 'Reviews', description: 'Assigned papers awaiting recommendation.', route: `${base}/reviews` },
          { title: 'Reports & Analytics', description: 'Publication trends and performance metrics.', route: `${base}/reports` },
          { title: 'Notifications', description: '2 unread', route: `${base}/notifications` }
        ];
      case Role.REVIEWER:
        return [
          { title: 'Research Papers', description: 'Browse, upload, and track submission status.', route: `${base}/papers` },
          { title: 'Reviews', description: 'Assigned papers awaiting recommendation.', route: `${base}/reviews` },
          { title: 'Notifications', description: '2 unread', route: `${base}/notifications` }
        ];
      case Role.RESEARCHER:
      default:
        return [
          { title: 'Research Papers', description: 'Browse, upload, and track submission status.', route: `${base}/papers` },
          { title: 'Notifications', description: '2 unread', route: `${base}/notifications` }
        ];
    }
  });
}
