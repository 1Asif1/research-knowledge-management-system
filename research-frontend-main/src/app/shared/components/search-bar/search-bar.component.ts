import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-bar">
      <mat-icon class="search-bar__icon">search</mat-icon>
      <input
        type="text"
        class="search-bar__input"
        [placeholder]="placeholder()"
        [(ngModel)]="term"
        (ngModelChange)="onTermChange($event)"
      />
      <button
        *ngIf="term"
        mat-icon-button
        class="search-bar__clear"
        (click)="clear()"
        aria-label="Clear search"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .search-bar {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: var(--surface-card-bg);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-sm);
      padding: 0 var(--space-3);
      height: 40px;
      transition: border-color var(--motion-fast) var(--motion-easing);

      &:focus-within {
        border-color: var(--color-primary-400);
      }
    }

    .search-bar__icon {
      color: var(--text-tertiary);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .search-bar__input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      color: var(--text-primary);
      font-family: inherit;
      height: 100%;

      &::placeholder {
        color: var(--text-tertiary);
      }
    }

    .search-bar__clear {
      width: 28px;
      height: 28px;
      line-height: 28px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }
  `]
})
export class SearchBarComponent implements OnInit, OnDestroy {
  placeholder = input('Search...');
  debounceMs = input(350);

  searchChange = output<string>();

  term = '';
  private readonly termChanges$ = new Subject<string>();

  ngOnInit(): void {
    this.termChanges$
      .pipe(debounceTime(this.debounceMs()), distinctUntilChanged())
      .subscribe((value) => this.searchChange.emit(value));
  }

  ngOnDestroy(): void {
    this.termChanges$.complete();
  }

  onTermChange(value: string): void {
    this.termChanges$.next(value);
  }

  clear(): void {
    this.term = '';
    this.termChanges$.next('');
  }
}
