import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner-wrap" [class.overlay]="overlay()">
      <mat-spinner [diameter]="diameter()" strokeWidth="3"></mat-spinner>
      <p *ngIf="message()" class="spinner-message">{{ message() }}</p>
    </div>
  `,
  styles: [`
    .spinner-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: var(--space-8) 0;
    }

    .spinner-wrap.overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.72);
      backdrop-filter: blur(1px);
      z-index: 10;
      border-radius: inherit;
    }

    .spinner-message {
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 500;
    }

    ::ng-deep .mat-mdc-progress-spinner circle {
      stroke: var(--color-primary-500);
    }
  `]
})
export class LoadingSpinnerComponent {
  diameter = input(40);
  message = input<string | null>(null);
  overlay = input(false);
}
