import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="app-footer">
      <span>© {{ year }} ScholarFlow Research Knowledge Management System</span>
      <span class="app-footer__meta">v1.0.0 · Academic &amp; Governance Edition</span>
    </footer>
  `,
  styles: [`
    .app-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--surface-divider);
      font-size: 12px;
      color: var(--text-tertiary);
      flex-shrink: 0;
    }

    .app-footer__meta {
      color: var(--text-tertiary);
    }
  `]
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
