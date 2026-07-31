import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="confirm-dialog">
      <div class="confirm-dialog__icon" [class.destructive]="data.destructive">
        <mat-icon>{{ data.icon ?? (data.destructive ? 'warning_amber' : 'help_outline') }}</mat-icon>
      </div>

      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button [mat-dialog-close]="false">
          {{ data.cancelText ?? 'Cancel' }}
        </button>
        <button
          mat-flat-button
          [color]="data.destructive ? 'warn' : 'primary'"
          [mat-dialog-close]="true"
          cdkFocusInitial
        >
          {{ data.confirmText ?? 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: var(--space-2);
      max-width: 380px;
    }

    .confirm-dialog__icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-info-bg);
      color: var(--color-info-fg);
      margin-bottom: var(--space-3);

      &.destructive {
        background: var(--color-danger-bg);
        color: var(--color-danger-fg);
      }
    }

    h2[mat-dialog-title] {
      font-size: 18px;
      font-weight: 700;
    }

    mat-dialog-content p {
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 22px;
    }

    mat-dialog-actions {
      padding-top: var(--space-4);
    }
  `]
})
export class ConfirmationDialogComponent {
  data: ConfirmationDialogData = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);
}
