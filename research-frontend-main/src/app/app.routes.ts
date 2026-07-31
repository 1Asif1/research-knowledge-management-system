import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from '@layouts/auth-layout/auth-layout.component';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { Role } from '@core/models';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login'
  },

  // ---- Public / Auth routes ----
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then((m) => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent)
      }
    ]
  },

  // ---- Authenticated shell ----
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'researcher',
        canActivate: [roleGuard],
        data: { roles: [Role.RESEARCHER], breadcrumb: 'Researcher' },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('@pages/role-dashboard/role-dashboard.component').then((m) => m.RoleDashboardComponent)
          },
          {
            path: 'papers',
            loadComponent: () => import('@pages/papers/papers-page.component').then((m) => m.PapersPageComponent)
          },
          {
            path: 'notifications',
            loadComponent: () =>
              import('@pages/notifications/notifications-page.component').then((m) => m.NotificationsPageComponent)
          }
        ]
      },
      {
        path: 'editor',
        canActivate: [roleGuard],
        data: { roles: [Role.EDITOR], breadcrumb: 'Editor' },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('@pages/role-dashboard/role-dashboard.component').then((m) => m.RoleDashboardComponent)
          },
          {
            path: 'papers',
            loadComponent: () => import('@pages/papers/papers-page.component').then((m) => m.PapersPageComponent)
          },
          {
            path: 'reviews',
            loadComponent: () => import('@pages/reviews/reviews-page.component').then((m) => m.ReviewsPageComponent)
          },
          {
            path: 'reports',
            loadComponent: () => import('@pages/reports/reports-page.component').then((m) => m.ReportsPageComponent)
          },
          {
            path: 'notifications',
            loadComponent: () =>
              import('@pages/notifications/notifications-page.component').then((m) => m.NotificationsPageComponent)
          }
        ]
      },
      {
        path: 'reviewer',
        canActivate: [roleGuard],
        data: { roles: [Role.REVIEWER], breadcrumb: 'Reviewer' },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('@pages/role-dashboard/role-dashboard.component').then((m) => m.RoleDashboardComponent)
          },
          {
            path: 'papers',
            loadComponent: () => import('@pages/papers/papers-page.component').then((m) => m.PapersPageComponent)
          },
          {
            path: 'reviews',
            loadComponent: () => import('@pages/reviews/reviews-page.component').then((m) => m.ReviewsPageComponent)
          },
          {
            path: 'notifications',
            loadComponent: () =>
              import('@pages/notifications/notifications-page.component').then((m) => m.NotificationsPageComponent)
          }
        ]
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN], breadcrumb: 'Admin' },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('@pages/role-dashboard/role-dashboard.component').then((m) => m.RoleDashboardComponent)
          },
          {
            path: 'papers',
            loadComponent: () => import('@pages/papers/papers-page.component').then((m) => m.PapersPageComponent)
          },
          {
            path: 'reports',
            loadComponent: () => import('@pages/reports/reports-page.component').then((m) => m.ReportsPageComponent)
          },
          {
            path: 'notifications',
            loadComponent: () =>
              import('@pages/notifications/notifications-page.component').then((m) => m.NotificationsPageComponent)
          },
          {
            path: 'users',
            loadComponent: () => import('@pages/users/users-page.component').then((m) => m.UsersPageComponent)
          }
        ]
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'auth/login'
  },
];
