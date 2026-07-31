import { Role } from '@core/models';

export function roleFromUrl(url: string): Role {
  const segment = url.split('?')[0].split('/').filter(Boolean)[0]?.toUpperCase();
  switch (segment) {
    case Role.ADMIN:
      return Role.ADMIN;
    case Role.EDITOR:
      return Role.EDITOR;
    case Role.REVIEWER:
      return Role.REVIEWER;
    case Role.RESEARCHER:
    default:
      return Role.RESEARCHER;
  }
}

export function roleLabel(role: Role): string {
  switch (role) {
    case Role.ADMIN:
      return 'ADMIN';
    case Role.EDITOR:
      return 'EDITOR';
    case Role.REVIEWER:
      return 'REVIEWER';
    case Role.RESEARCHER:
    default:
      return 'RESEARCHER';
  }
}
