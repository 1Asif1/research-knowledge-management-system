import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ReportService } from '@core/services/report.service';
import {
  PublishedPaperSummaryResponse
} from '@core/models';

import { LoadingSpinnerComponent } from
  '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-editor-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './editor-reports.component.html',
  styleUrls: ['./editor-reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorReportsComponent implements OnInit {
  private readonly reportService = inject(ReportService);

  readonly publishedPapers = signal<PublishedPaperSummaryResponse[]>([]);
  readonly selectedPaperId = signal<number | null>(null);
  readonly searchQuery = signal('');
  readonly loadingPublishedPapers = signal(false);
  readonly downloadingPdf = signal(false);
  readonly publishedReportError = signal('');
  readonly filteredPublishedPapers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.publishedPapers();
    }

    return this.publishedPapers().filter((paper) => {
      const title = paper.title?.toLowerCase() ?? '';
      const author = paper.authorName?.toLowerCase() ?? '';
      const id = String(paper.paperId);

      return title.includes(query) || author.includes(query) || id.includes(query);
    });
  });

  ngOnInit(): void {
    this.loadPublishedPapers();
  }

  loadPublishedPapers(): void {
    this.loadingPublishedPapers.set(true);
    this.publishedReportError.set('');

    this.reportService.getPublishedPapers().subscribe({
      next: (papers) => {
        const loadedPapers = papers || [];
        this.publishedPapers.set(loadedPapers);
        this.loadingPublishedPapers.set(false);
        if (loadedPapers.length === 0) {
          this.selectedPaperId.set(null);
          return;
        }

        const selectedPaperId = this.selectedPaperId();
        const hasSelectedPaper = selectedPaperId !== null
          && loadedPapers.some((paper) => paper.paperId === selectedPaperId);
        if (!hasSelectedPaper) {
          this.selectedPaperId.set(loadedPapers[0].paperId);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load published papers:', err);
        this.publishedReportError.set(this.resolveErrorMessage(err));
        this.loadingPublishedPapers.set(false);
      }
    });
  }

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
  }

  selectPaper(paperId: number): void {
    if (!paperId) return;
    this.selectedPaperId.set(paperId);
  }

  downloadPdfReport(): void {
    const paperId = this.selectedPaperId();
    if (!paperId) return;

    this.downloadingPdf.set(true);
    this.reportService.downloadPublishedPaperReportPdf(paperId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Published_Paper_Report_${paperId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.downloadingPdf.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to download PDF report:', err);
        alert('Could not download PDF report. Please try again.');
        this.downloadingPdf.set(false);
      }
    });
  }

  private resolveErrorMessage(error: HttpErrorResponse): string {
    const body = error?.error as { message?: string } | string | null;

    if (body && typeof body === 'object' && typeof body.message === 'string' && body.message.length > 0) {
      return body.message;
    }

    if (typeof body === 'string' && body.length > 0) {
      return body;
    }

    if (error?.message) {
      return error.message;
    }

    return 'Unable to load published paper reports. Please check backend connection and try again.';
  }
}
