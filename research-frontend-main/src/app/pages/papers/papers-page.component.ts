import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { ModuleHeaderComponent } from '@shared/components/module-header/module-header.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { PaperCardComponent } from '@shared/components/paper-card/paper-card.component';
import { SearchBarComponent } from '@shared/components/search-bar/search-bar.component';
import { roleFromUrl } from '@pages/page-role.utils';
import { Role, PageResponse, PaperResponse, paperStatusIntent, paperStatusLabel } from '@core/models';
import { PaperService } from '@core/services/paper.service';

@Component({
  selector: 'app-papers-page',
  standalone: true,
  imports: [CommonModule, ModuleHeaderComponent, LoadingSpinnerComponent, PaperCardComponent, SearchBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-module-header [module]="moduleLabel()" title="Research Papers"></app-module-header>

    <app-search-bar
      placeholder="Search by title, author, or research area"
      (searchChange)="onSearch($event)"
    ></app-search-bar>

    <app-loading-spinner *ngIf="loading()" message="Loading papers..."></app-loading-spinner>

    <div class="papers-error" *ngIf="error()">{{ error() }}</div>

    <div class="paper-list" *ngIf="!loading() && !error()">
      <app-paper-card
        *ngFor="let paper of filteredPapers()"
        [title]="paper.title"
        [description]="paper.description"
        [authorName]="paper.authorName"
        [statusLabel]="paperStatusLabel(paper.status)"
        [statusIntent]="paperStatusIntent(paper.status)"
        (view)="openPaper(paper.id)"
      ></app-paper-card>

      <p class="papers-empty" *ngIf="filteredPapers().length === 0">No papers match your search.</p>
    </div>
  `,
  styles: [`
    .paper-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .papers-error,
    .papers-empty {
      border: 1px solid #dbe2ed;
      background: #fff;
      border-radius: 12px;
      padding: 16px 18px;
      color: #455677;
      font-size: 14px;
    }
  `]
})
export class PapersPageComponent {
  private readonly paperService = inject(PaperService);
  private readonly router = inject(Router);

  readonly query = signal('');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly papers = signal<PaperResponse[]>([]);
  readonly moduleLabel = computed(() => {
    const role = roleFromUrl(window.location.pathname);
    return role === Role.RESEARCHER ? 'MODULE 2 & 4' : 'MODULE 2';
  });
  readonly paperStatusLabel = paperStatusLabel;
  readonly paperStatusIntent = paperStatusIntent;

  readonly filteredPapers = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      return this.papers();
    }
    return this.papers().filter((paper) =>
      `${paper.title} ${paper.description} ${paper.authorName}`.toLowerCase().includes(q)
    );
  });

  constructor() {
    this.loadPapers('');
  }

  onSearch(value: string): void {
    this.query.set(value);
    this.loadPapers(value);
  }

  openPaper(paperId: number): void {
    const role = roleFromUrl(this.router.url);
    if (role === Role.RESEARCHER) {
      this.router.navigate(['/researcher/papers', paperId]);
    }
  }

  private loadPapers(keyword: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.paperService.searchPapers(keyword).subscribe({
      next: (page: PageResponse<PaperResponse>) => {
        this.papers.set(page.content);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(error.status === 0 ? 'Paper service is not reachable.' : 'Unable to load papers.');
      }
    });
  }
}
