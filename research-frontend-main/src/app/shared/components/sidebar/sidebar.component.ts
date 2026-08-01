import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TokenStorageService } from '@core/services/token-storage.service';
import { SIDEBAR_MENUS } from './sidebar-menu.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private readonly tokenStorage = inject(TokenStorageService);

  collapsed = input(false);
  readonly sidebarToggle = output<void>();

  readonly exactMatchOptions = { exact: true };
  readonly subsetMatchOptions = { exact: false };

  readonly menuItems = computed(() => {
    const user = this.tokenStorage.user();
    return user ? SIDEBAR_MENUS[user.role] : [];
  });
}
