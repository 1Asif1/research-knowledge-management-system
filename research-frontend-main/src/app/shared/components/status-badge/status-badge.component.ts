import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StatusIntent } from '@core/models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="pill" [class]="'pill--' + intent()">
      <mat-icon *ngIf="icon()" class="pill-icon">{{ icon() }}</mat-icon>
      {{ label() }}
    </span>
  `,
  styles: [`
    .pill-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      line-height: 14px;
    }
  `]
})
export class StatusBadgeComponent {
  // Direct override, e.g. <app-status-badge intent="success" label="Approved" />
  label = input.required<string>();
  intent = input<StatusIntent>('neutral');
  icon = input<string | null>(null);
}
