import { Role } from '@core/models';

export interface SidebarMenuItem {
  label: string;
  route: string;
  exact?: boolean;
}

// Per-role menus aligned to the RKMS screenshots.
export const SIDEBAR_MENUS: Record<Role, SidebarMenuItem[]> = {
  [Role.RESEARCHER]: [
    {
      label: 'Dashboard',
      route: '/researcher/dashboard',
      exact: true
    },
    {
      label: 'Submit Paper',
      route: '/researcher/submit'
    },
    {
      label: 'My Papers',
      route: '/researcher/papers'
    },
    {
      label: 'Notifications',
      route: '/researcher/notifications'
    },
    {
      label: 'Profile',
      route: '/researcher/profile'
    }
  ],
  [Role.EDITOR]: [
    { label: 'Dashboard', route: '/editor/dashboard', exact: true },
    { label: 'Papers', route: '/editor/papers' },
    { label: 'Reviews', route: '/editor/reviews' },
    { label: 'Reports', route: '/editor/reports' },
    { label: 'Notifications', route: '/editor/notifications' }
  ],
  [Role.REVIEWER]: [
    {
      label: 'Dashboard',
      route: '/reviewer/dashboard',
      exact: true
    },
    {
      label: 'Assigned Papers',
      route: '/reviewer/assigned-papers'
    },
    {
      label: 'Reviewed Papers',
      route: '/reviewer/reviewed-papers'
    },
    {
      label: 'Notifications',
      route: '/reviewer/notifications'
    },
    {
      label: 'Profile',
      route: '/reviewer/profile'
    }
  ],
  [Role.ADMIN]: [
    { label: 'Dashboard', route: '/admin/dashboard', exact: true },
    { label: 'Papers', route: '/admin/papers' },
    { label: 'Reports', route: '/admin/reports' },
    { label: 'Notifications', route: '/admin/notifications' },
    { label: 'Manage Users', route: '/admin/users' }
  ]
};
