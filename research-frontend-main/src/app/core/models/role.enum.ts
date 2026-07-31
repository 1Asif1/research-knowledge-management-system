// Matches AuthServiceD.Entity.Role / userservice.enums.Role / ReviewService.Enums.UserRole
// All three backend services use the identical four-value enum.
export enum Role {
  RESEARCHER = 'RESEARCHER',
  REVIEWER = 'REVIEWER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN'
}

export const ALL_ROLES: Role[] = [Role.RESEARCHER, Role.REVIEWER, Role.EDITOR, Role.ADMIN];

export function roleDisplayName(role: Role | null | undefined): string {
  switch (role) {
    case Role.RESEARCHER: return 'Researcher';
    case Role.REVIEWER: return 'Reviewer';
    case Role.EDITOR: return 'Editor';
    case Role.ADMIN: return 'Administrator';
    default: return '—';
  }
}

export function dashboardRouteForRole(role: Role | null | undefined): string {
  switch (role) {
    case Role.RESEARCHER: return '/researcher/dashboard';
    case Role.REVIEWER: return '/reviewer/dashboard';
    case Role.EDITOR: return '/editor/dashboard';
    case Role.ADMIN: return '/admin/dashboard';
    default: return '/auth/login';
  }
}
