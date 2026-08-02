import { Role } from '@core/models';

export interface SidebarMenuItem {
  label: string;
  route: string;
  exact?: boolean;
  icon: string;
}

// Per-role menus for ScholarFlow.
export const SIDEBAR_MENUS: Record<Role, SidebarMenuItem[]> = {
  [Role.RESEARCHER]: [
    {
      label: 'Dashboard',
      route: '/researcher/dashboard',
      exact: true,
      icon: 'dashboard'
    },
    {
      label: 'Submit Paper',
      route: '/researcher/submit',
      icon: 'upload_file'
    },
    {
      label: 'My Papers',
      route: '/researcher/papers',
      icon: 'folder'
    },
    {
      label: 'Notifications',
      route: '/researcher/notifications',
      icon: 'notifications'
    },
    {
      label: 'Profile',
      route: '/researcher/profile',
      icon: 'person'
    }
  ],
  [Role.EDITOR]: [
    {
      label: 'Dashboard',
      route: '/editor/dashboard',
      exact: true,
      icon: 'dashboard'
    },
    {
      label: 'Papers',
      route: '/editor/papers',
      icon: 'folder'
    },
    {
      label: 'Editorial Decisions',
      route: '/editor/decisions',
      icon: 'gavel'
    },
    {
      label: 'Published Papers',
      route: '/editor/published-papers',
      icon: 'workspace_premium'
    },
    {
      label: 'Reports',
      route: '/editor/reports',
      icon: 'assessment'
    },
    {
      label: 'Notifications',
      route: '/editor/notifications',
      icon: 'notifications'
    },
    {
      label: 'Profile',
      route: '/editor/profile',
      icon: 'person'
    }
  ],
  [Role.REVIEWER]: [
    {
      label: 'Dashboard',
      route: '/reviewer/dashboard',
      exact: true,
      icon: 'dashboard'
    },
    {
      label: 'Assigned Papers',
      route: '/reviewer/assigned-papers',
      icon: 'assignment'
    },
    {
      label: 'Reviewed Papers',
      route: '/reviewer/reviewed-papers',
      icon: 'fact_check'
    },
    {
      label: 'Notifications',
      route: '/reviewer/notifications',
      icon: 'notifications'
    },
    {
      label: 'Profile',
      route: '/reviewer/profile',
      icon: 'person'
    }
  ],
  [Role.ADMIN]: [
    { label: 'Dashboard', route: '/admin/dashboard', exact: true, icon: 'dashboard' },
    { label: 'Papers', route: '/admin/papers', icon: 'folder' },
    { label: 'Reports', route: '/admin/reports', icon: 'assessment' },
    { label: 'Notifications', route: '/admin/notifications', icon: 'notifications' },
    { label: 'Manage Users', route: '/admin/users', icon: 'group' },
    { label: 'Profile', route: '/admin/profile', icon: 'person' }
  ]
};
