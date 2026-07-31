import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { ModuleHeaderComponent } from '@shared/components/module-header/module-header.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ReportService } from '@core/services/report.service';
import { AnnualReportSummaryResponse, ReportResponse } from '@core/models';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, ModuleHeaderComponent, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-module-header module="MODULE 5" title="Reports & Analytics"></app-module-header>

    <app-loading-spinner *ngIf="loading()" message="Loading reports..."></app-loading-spinner>

    <div class="reports-error" *ngIf="error()">{{ error() }}</div>

    <section class="metrics" *ngIf="!loading() && !error()">
      <article>
        <h3>{{ summary()?.totalReports ?? 0 }}</h3>
        <p>Total reports</p>
      </article>
      <article>
        <h3>{{ summary()?.publicationReports ?? 0 }}</h3>
        <p>Publication reports</p>
      </article>
      <article>
        <h3>{{ reports().length }}</h3>
        <p>Generated entries</p>
      </article>
    </section>

    <section class="report-list" *ngIf="!loading() && !error()">
      <article *ngFor="let report of reports()">
        <h4>{{ report.title }}</h4>
        <p>{{ report.reportType }} · {{ report.paperStatus }}</p>
      </article>
      <article *ngIf="reports().length === 0" class="reports-empty">
        <p>No reports available.</p>
      </article>
    </section>
  `,
  styles: [`
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 12px;
      margin-bottom: 14px;
    }

    .metrics article,
    .report-list article {
      border: 1px solid #dbe2ed;
      border-radius: 12px;
      background: #fff;
      padding: 16px 18px;
    }

    .metrics h3 {
      margin: 0 0 4px;
      color: #0f2749;
      font-size: 26px;
      font-weight: 700;
    }

    .metrics p,
    .report-list p {
      margin: 0;
      color: #455677;
      font-size: 14px;
      line-height: 1.4;
    }

    .report-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .report-list h4 {
      margin: 0 0 6px;
      color: #0f2749;
      font-size: 18px;
      font-weight: 700;
    }

    .reports-error,
    .reports-empty {
      border: 1px solid #dbe2ed;
      border-radius: 12px;
      background: #fff;
      padding: 16px 18px;
      color: #455677;
      font-size: 14px;
    }
  `]
})
export class ReportsPageComponent {
  private readonly reportService = inject(ReportService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly reports = signal<ReportResponse[]>([]);
  readonly summary = signal<AnnualReportSummaryResponse | null>(null);

  constructor() {
    const year = new Date().getFullYear();

    this.reportService.getReports().subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(error.status === 0 ? 'Report service is not reachable.' : 'Unable to load reports.');
      }
    });

    this.reportService.getAnnualSummary(year).subscribe({
      next: (summary) => this.summary.set(summary),
      error: () => undefined
    });
  }
}
