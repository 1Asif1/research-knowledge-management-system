import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type TimelineStepState = 'completed' | 'current' | 'pending' | 'rejected';

export interface TimelineStep {
  label: string;
  description?: string;
  timestamp?: string;
  state: TimelineStepState;
  icon?: string;
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="timeline">
      <li *ngFor="let step of steps(); let last = last" class="timeline__item" [class]="'timeline__item--' + step.state">
        <div class="timeline__marker">
          <mat-icon>{{ step.icon ?? iconFor(step.state) }}</mat-icon>
        </div>
        <div class="timeline__connector" *ngIf="!last"></div>
        <div class="timeline__content">
          <div class="timeline__header">
            <span class="timeline__label">{{ step.label }}</span>
            <span class="timeline__timestamp" *ngIf="step.timestamp">{{ step.timestamp | date: 'MMM d, y, h:mm a' }}</span>
          </div>
          <p class="timeline__description" *ngIf="step.description">{{ step.description }}</p>
        </div>
      </li>
    </ol>
  `,
  styles: [`
    .timeline {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .timeline__item {
      display: flex;
      gap: var(--space-4);
      position: relative;
    }

    .timeline__marker {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--color-gray-100);
      color: var(--text-tertiary);
      z-index: 1;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .timeline__item--completed .timeline__marker {
      background: var(--color-success-bg);
      color: var(--color-success-fg);
    }

    .timeline__item--current .timeline__marker {
      background: var(--color-primary-100);
      color: var(--color-primary-700);
      box-shadow: 0 0 0 4px var(--color-primary-50);
    }

    .timeline__item--rejected .timeline__marker {
      background: var(--color-danger-bg);
      color: var(--color-danger-fg);
    }

    .timeline__connector {
      position: absolute;
      left: 15px;
      top: 32px;
      bottom: -8px;
      width: 2px;
      background: var(--surface-border);
    }

    .timeline__content {
      flex: 1;
      padding-bottom: var(--space-6);
      min-width: 0;
    }

    .timeline__header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-3);
    }

    .timeline__label {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .timeline__timestamp {
      font-size: 12px;
      color: var(--text-tertiary);
      white-space: nowrap;
    }

    .timeline__description {
      margin-top: var(--space-1);
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 20px;
    }
  `]
})
export class TimelineComponent {
  steps = input.required<TimelineStep[]>();

  iconFor(state: TimelineStepState): string {
    switch (state) {
      case 'completed': return 'check';
      case 'current': return 'radio_button_checked';
      case 'rejected': return 'close';
      default: return 'circle';
    }
  }
}
