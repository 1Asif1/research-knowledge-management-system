import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-paginator
      [length]="length()"
      [pageSize]="pageSize()"
      [pageIndex]="pageIndex()"
      [pageSizeOptions]="pageSizeOptions()"
      (page)="handlePage($event)"
      showFirstLastButtons
    ></mat-paginator>
  `,
  styles: [`
    :host {
      display: block;
    }

    mat-paginator {
      background: transparent;
      color: var(--text-secondary);
    }
  `]
})
export class PaginationComponent {
  length = input(0);
  pageSize = input(10);
  pageIndex = input(0);
  pageSizeOptions = input<number[]>([5, 10, 25, 50]);

  pageChange = output<PageEvent>();

  handlePage(event: PageEvent): void {
    this.pageChange.emit(event);
  }
}
