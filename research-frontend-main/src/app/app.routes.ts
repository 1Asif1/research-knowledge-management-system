import { Routes } from '@angular/router';
import { RESEARCHER_ROUTES } from '@pages/researcher/researcher.routes';
import { REVIEWER_ROUTES } from '@pages/reviewer/reviewer.routes';
import { EDITOR_ROUTES } from '@pages/editor/editor.routes';
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
        data: {
          roles: [Role.RESEARCHER],
          breadcrumb: 'Researcher'
        },
        children: [
          ...RESEARCHER_ROUTES,
          {
            path: 'notifications',
            loadComponent: () =>
              import('./features/notifications/notifications.component')
                .then(m => m.NotificationsComponent)
          }
        ]
      },
      {
        path: 'editor',
        canActivate: [roleGuard],
        data: {
          roles: [Role.EDITOR],
          breadcrumb: 'Editor'
        },
        children: [
          ...EDITOR_ROUTES,
          {
            path: 'notifications',
            loadComponent: () =>
              import('./features/notifications/notifications.component').then(
                (m) => m.NotificationsComponent
              ),
            data: {
              breadcrumb: 'Notifications'
            }
          }
        ]
      },
      {
        path: 'reviewer',
        canActivate: [roleGuard],
        data: {
          roles: [Role.REVIEWER],
          breadcrumb: 'Reviewer'
        },
        children: [
          ...REVIEWER_ROUTES,
          {
            path: 'notifications',
            loadComponent: () =>
              import('./features/notifications/notifications.component')
                .then(m => m.NotificationsComponent)
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
            path: 'users',
            loadComponent: () => import('@pages/users/users-page.component').then((m) => m.UsersPageComponent)
          },
          {
            path: 'profile',
            loadComponent: () =>
              import('@shared/components/profile/profile.component')
                .then(m => m.ProfileComponent)
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
