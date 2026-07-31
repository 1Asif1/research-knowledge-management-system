import { Routes } from '@angular/router';

export const RESEARCHER_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
    data: { breadcrumb: 'Dashboard' }
  },
  {
    path: 'submit',
    loadComponent: () => import('./submit-paper/submit-paper.component').then((m) => m.SubmitPaperComponent),
    data: { breadcrumb: 'Submit Paper' }
  },
  {
    path: 'papers',
    loadComponent: () => import('./my-papers/my-papers.component').then((m) => m.MyPapersComponent),
    data: { breadcrumb: 'My Papers' }
  },
  {
    path: 'papers/:paperId',
    loadComponent: () => import('./paper-details/paper-details.component').then((m) => m.PaperDetailsComponent),
    data: { breadcrumb: 'Paper Details' }
  },
  {
    path: 'papers/:paperId/upload-version',
    loadComponent: () => import('./upload-version/upload-version.component').then((m) => m.UploadVersionComponent),
    data: { breadcrumb: 'Upload New Version' }
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('@shared/components/profile/profile.component')
        .then(m => m.ProfileComponent)
  }
];
