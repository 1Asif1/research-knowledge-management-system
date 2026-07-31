import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { StatusIntent } from '@core/models';

@Component({
  selector: 'app-paper-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="paper-card card-surface-hover" (click)="view.emit()">
      <div class="paper-card__header">
        <h3 class="paper-card__title">{{ title() }}</h3>
        <app-status-badge [label]="statusLabel()" [intent]="statusIntent()"></app-status-badge>
      </div>

      <p class="paper-card__description" *ngIf="description()">{{ description() }}</p>

      <div class="paper-card__meta">
        <span *ngIf="authorName()">
          <mat-icon>person_outline</mat-icon>
          {{ authorName() }}
        </span>
        <span *ngIf="date()">
          <mat-icon>schedule</mat-icon>
          {{ date() | date: 'MMM d, y' }}
        </span>
      </div>
    </article>
  `,
  styles: [`
    .paper-card {
      padding: var(--space-5);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .paper-card__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-3);
    }

    .paper-card__title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 22px;
    }

    .paper-card__description {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 20px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .paper-card__meta {
      display: flex;
      align-items: center;
      gap: var(--space-5);
      margin-top: var(--space-2);
      font-size: 12px;
      color: var(--text-tertiary);

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      mat-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }
    }
  `]
})
export class PaperCardComponent {
  title = input.required<string>();
  description = input<string | null>(null);
  authorName = input<string | null>(null);
  date = input<string | null>(null);
  statusLabel = input<string>('—');
  statusIntent = input<StatusIntent>('neutral');

  view = output<void>();
}
