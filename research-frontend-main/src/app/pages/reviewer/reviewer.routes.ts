import { Routes } from '@angular/router';

export const REVIEWER_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.ReviewerDashboardComponent
      ),
    data: {
      breadcrumb: 'Dashboard'
    }
  },
  {
    path: 'assigned-papers',
    loadComponent: () =>
      import('./assigned-papers/assigned-papers.component').then(
        (m) => m.AssignedPapersComponent
      ),
    data: {
      breadcrumb: 'Assigned Papers'
    }
  },
  {
    path: 'reviews/:reviewId',
    loadComponent: () =>
      import('./review-paper/review-paper.component').then(
        (m) => m.ReviewPaperComponent
      ),
    data: {
      breadcrumb: 'Review Paper'
    }
  },
  {
    path: 'reviewed-papers',
    loadComponent: () =>
      import('./reviewed-papers/reviewed-papers.component').then(
        (m) => m.ReviewedPapersComponent
      ),
    data: {
      breadcrumb: 'Reviewed Papers'
    }
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('@shared/components/profile/profile.component')
        .then(m => m.ProfileComponent)
  }
];
