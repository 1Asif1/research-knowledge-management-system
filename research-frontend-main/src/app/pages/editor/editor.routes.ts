import { Routes } from '@angular/router';

export const EDITOR_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/editor-dashboard.component').then(
        (m) => m.EditorDashboardComponent
      ),
    data: {
      breadcrumb: 'Dashboard'
    }
  },
  {
    path: 'papers',
    loadComponent: () =>
      import('./papers/editor-papers.component').then(
        (m) => m.EditorPapersComponent
      ),
    data: {
      breadcrumb: 'Papers'
    }
  },
  {
    path: 'assign-reviewer/:reviewId',
    loadComponent: () =>
      import(
        './assign-reviewer/assign-reviewer.component'
      ).then(
        (m) => m.AssignReviewerComponent
      ),
    data: {
      breadcrumb: 'Assign Reviewer'
    }
  },
  {
    path: 'decisions',
    loadComponent: () =>
      import(
        './editorial-decisions/editorial-decisions.component'
      ).then(
        (m) => m.EditorialDecisionsComponent
      ),
    data: {
      breadcrumb: 'Editorial Decisions'
    }
  },
  {
    path: 'decisions/:reviewId',
    loadComponent: () =>
      import(
        './editorial-decision/editorial-decision.component'
      ).then(
        (m) => m.EditorialDecisionComponent
      ),
    data: {
      breadcrumb: 'Editorial Decision'
    }
  },
  {
    path: 'publish/:reviewId',
    loadComponent: () =>
      import(
        './publish-paper/publish-paper.component'
      ).then(
        (m) => m.PublishPaperComponent
      ),
    data: {
      breadcrumb: 'Publish Paper'
    }
  },
  {
    path: 'published-papers',
    loadComponent: () =>
      import(
        './published-papers/published-papers.component'
      ).then(
        (m) => m.PublishedPapersComponent
      ),
    data: {
      breadcrumb: 'Published Papers'
    }
  },
  {
    path: 'published-papers/:publicationId',
    loadComponent: () =>
      import(
        './published-paper-details/published-paper-details.component'
        ).then(
        (m) => m.PublishedPaperDetailsComponent
      ),
    data: {
      breadcrumb: 'Published Paper'
    }
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./reports/editor-reports.component').then(
        (m) => m.EditorReportsComponent
      ),
    data: {
      breadcrumb: 'Reports'
    }
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('@shared/components/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    data: {
      breadcrumb: 'Profile'
    }
  }
];
