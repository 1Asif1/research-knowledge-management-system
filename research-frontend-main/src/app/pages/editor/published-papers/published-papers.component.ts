import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { PaperService } from '@core/services/paper.service';
import { PublicationResponse } from '@core/models';

import { LoadingSpinnerComponent } from
  '@shared/components/loading-spinner/loading-spinner.component';

type PublicationSort =
  | 'NEWEST'
  | 'OLDEST'
  | 'TITLE_ASC'
  | 'TITLE_DESC';

@Component({
  selector: 'app-published-papers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './published-papers.component.html',
  styleUrl: './published-papers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublishedPapersComponent implements OnInit {
  private readonly paperService = inject(PaperService);

  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly publications = signal<PublicationResponse[]>([]);
  readonly searchTerm = signal('');
  readonly selectedSort =
    signal<PublicationSort>('NEWEST');

  readonly filteredPublications = computed(() => {
    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const publications = this.publications()
      .filter((publication) => {
        if (!search) {
          return true;
        }

        return (
          publication.title
            .toLowerCase()
            .includes(search) ||
          publication.paperId
            .toString()
            .includes(search) ||
          publication.id
            .toString()
            .includes(search) ||
          publication.publishedDate
            .toLowerCase()
            .includes(search)
        );
      });

    return this.sortPublications(
      publications,
      this.selectedSort()
    );
  });

  readonly totalPublished = computed(
    () => this.publications().length
  );

  readonly publishedThisMonth = computed(() => {
    const now = new Date();

    return this.publications().filter((publication) => {
      const date = new Date(
        `${publication.publishedDate}T00:00:00`
      );

      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }).length;
  });

  ngOnInit(): void {
    this.loadPublications();
  }

  loadPublications(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.paperService.getAllPublications().subscribe({
      next: (publications) => {
        this.publications.set(publications);
        this.loading.set(false);
      },
      error: (error) => {
        console.error(
          'Failed to load published papers:',
          error
        );

        this.errorMessage.set(
          'Unable to load published papers. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateSort(value: PublicationSort): void {
    this.selectedSort.set(value);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedSort.set('NEWEST');
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

  private sortPublications(
    publications: PublicationResponse[],
    sort: PublicationSort
  ): PublicationResponse[] {
    const result = [...publications];

    switch (sort) {
      case 'OLDEST':
        return result.sort(
          (first, second) =>
            new Date(first.publishedDate).getTime() -
            new Date(second.publishedDate).getTime()
        );

      case 'TITLE_ASC':
        return result.sort((first, second) =>
          first.title.localeCompare(second.title)
        );

      case 'TITLE_DESC':
        return result.sort((first, second) =>
          second.title.localeCompare(first.title)
        );

      case 'NEWEST':
      default:
        return result.sort(
          (first, second) =>
            new Date(second.publishedDate).getTime() -
            new Date(first.publishedDate).getTime()
        );
    }
  }
}
