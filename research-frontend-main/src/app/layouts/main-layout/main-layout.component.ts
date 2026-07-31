import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from '@shared/components/navbar/navbar.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  readonly sidebarCollapsed = signal(false);
}
