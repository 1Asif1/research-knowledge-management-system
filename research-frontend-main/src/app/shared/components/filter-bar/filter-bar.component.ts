import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
// add FormsModule to the imports array above

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDefinition {
  key: string;
  label: string;
  options: FilterOption[];
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-bar">
      <mat-form-field
        *ngFor="let filter of filters()"
        appearance="outline"
        class="filter-bar__field"
        subscriptSizing="dynamic"
      >
        <mat-label>{{ filter.label }}</mat-label>
        <mat-select
          [ngModel]="selected()[filter.key] ?? ''"
          (ngModelChange)="onSelect(filter.key, $event)"
        >
          <mat-option value="">All</mat-option>
          <mat-option *ngFor="let opt of filter.options" [value]="opt.value">
            {{ opt.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <button
        *ngIf="hasActiveFilters()"
        mat-button
        class="filter-bar__reset"
        (click)="reset.emit()"
      >
        <mat-icon>filter_alt_off</mat-icon>
        Clear filters
      </button>
    </div>
  `,
  styles: [`
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
    }

    .filter-bar__field {
      width: 180px;

      ::ng-deep .mat-mdc-text-field-wrapper {
        height: 40px;
      }
    }

    .filter-bar__reset {
      color: var(--text-secondary);
      font-size: 13px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 4px;
      }
    }
  `]
})
export class FilterBarComponent {
  filters = input<FilterDefinition[]>([]);
  selected = input<Record<string, string>>({});

  filterChange = output<{ key: string; value: string }>();
  reset = output<void>();

  onSelect(key: string, value: string): void {
    this.filterChange.emit({ key, value });
  }

  hasActiveFilters(): boolean {
    return Object.values(this.selected()).some((v) => !!v);
  }
}
