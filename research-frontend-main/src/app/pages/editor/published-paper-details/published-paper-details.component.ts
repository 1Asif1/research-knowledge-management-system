import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';
import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PaperService } from '@core/services/paper.service';
import {
  PaperResponse,
  PublicationResponse
} from '@core/models';

import { LoadingSpinnerComponent } from
    '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-published-paper-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './published-paper-details.component.html',
  styleUrl: './published-paper-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublishedPaperDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paperService = inject(PaperService);

  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly publication =
    signal<PublicationResponse | null>(null);

  readonly paper =
    signal<PaperResponse | null>(null);

  ngOnInit(): void {
    const publicationId = Number(
      this.route.snapshot.paramMap.get(
        'publicationId'
      )
    );

    if (
      !Number.isInteger(publicationId) ||
      publicationId <= 0
    ) {
      this.errorMessage.set(
        'Invalid publication ID.'
      );

      this.loading.set(false);
      return;
    }

    this.loadPublication(publicationId);
  }

  loadPublication(publicationId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.paperService
      .getPublicationById(publicationId)
      .subscribe({
        next: (publication) => {
          this.publication.set(publication);

          this.paperService
            .getPaperById(publication.paperId)
            .subscribe({
              next: (paper) => {
                this.paper.set(paper);
                this.loading.set(false);
              },

              error: (error) => {
                console.error(
                  'Failed to load paper:',
                  error
                );

                this.errorMessage.set(
                  'Publication was found, but the paper details could not be loaded.'
                );

                this.loading.set(false);
              }
            });
        },

        error: (error) => {
          console.error(
            'Failed to load publication:',
            error
          );

          this.errorMessage.set(
            'Unable to load the publication.'
          );

          this.loading.set(false);
        }
      });
  }

  formatDate(date: string): string {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatValue(value: unknown): string {
    if (
      value === null ||
      value === undefined
    ) {
      return 'Not available';
    }

    const text = String(value).trim();

    if (!text) {
      return 'Not available';
    }

    return text
      .toLowerCase()
      .split('_')
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(' ');
  }

  goBack(): void {
    this.router.navigate([
      '/editor/published-papers'
    ]);
  }
}
