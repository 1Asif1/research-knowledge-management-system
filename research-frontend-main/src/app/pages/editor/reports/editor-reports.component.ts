import {
  ChangeDetectionStrategy,
  Component,
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
  PublishedPaperReportResponse,
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
  styleUrl: './editor-reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorReportsComponent implements OnInit {
  private readonly reportService = inject(ReportService);

  // Published Paper Reports state
  readonly publishedPapers = signal<PublishedPaperSummaryResponse[]>([]);
  readonly selectedPaperId = signal<number | null>(null);
  readonly publishedReport = signal<PublishedPaperReportResponse | null>(null);
  readonly loadingPublishedPapers = signal(false);
  readonly loadingPublishedReport = signal(false);
  readonly downloadingPdf = signal(false);
  readonly publishedReportError = signal('');

  ngOnInit(): void {
    this.loadPublishedPapers();
  }

  loadPublishedPapers(): void {
    this.loadingPublishedPapers.set(true);
    this.publishedReportError.set('');

    this.reportService.getPublishedPapers().subscribe({
      next: (papers) => {
        this.publishedPapers.set(papers || []);
        this.loadingPublishedPapers.set(false);
        if (papers && papers.length > 0 && !this.selectedPaperId()) {
          this.selectPaper(papers[0].paperId);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load published papers:', err);
        this.publishedReportError.set(this.resolveErrorMessage(err));
        this.loadingPublishedPapers.set(false);
      }
    });
  }

  selectPaper(paperId: number): void {
    if (!paperId) return;
    this.selectedPaperId.set(paperId);
    this.loadingPublishedReport.set(true);
    this.publishedReportError.set('');

    this.reportService.getPublishedPaperReport(paperId).subscribe({
      next: (report) => {
        this.publishedReport.set(report);
        this.loadingPublishedReport.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to load published paper report:', err);
        this.publishedReport.set(null);
        this.publishedReportError.set(this.resolveErrorMessage(err));
        this.loadingPublishedReport.set(false);
      }
    });
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
