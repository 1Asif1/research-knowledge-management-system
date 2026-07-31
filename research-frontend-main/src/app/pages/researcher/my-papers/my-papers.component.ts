import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ResearcherService } from '@core/services/researcher.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import { PaperSubmissionResponse, reviewStatusIntent, reviewStatusLabel } from '@core/models';

import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { PaperCardComponent } from '@shared/components/paper-card/paper-card.component';
import { SearchBarComponent } from '@shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-my-papers',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    LoadingSpinnerComponent,
    PaperCardComponent,
    SearchBarComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-papers.component.html',
  styleUrl: './my-papers.component.scss'
})
export class MyPapersComponent implements OnInit {
  private readonly researcherService = inject(ResearcherService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly allPapers = signal<PaperSubmissionResponse[]>([]);
  readonly searchTerm = signal('');

  readonly filteredPapers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.allPapers();
    return this.allPapers().filter((p) => p.title.toLowerCase().includes(term));
  });
  readonly reviewStatusLabel = reviewStatusLabel;
  readonly reviewStatusIntent = reviewStatusIntent;

  ngOnInit(): void {
    const user = this.tokenStorage.getUser();
    if (!user) {
      this.loading.set(false);
      return;
    }

    this.researcherService.getMySubmissions(user.id).subscribe({
      next: (data) => {
        this.allPapers.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  openPaper(paperId: number): void {
    this.router.navigate(['/researcher/papers', paperId]);
  }
}
