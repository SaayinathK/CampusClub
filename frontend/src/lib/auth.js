export const VALID_ROLES = ['student', 'admin'];

export function isValidRole(role) {
  return VALID_ROLES.includes(role);
}

export function getDefaultRoute(role) {
  return role === 'admin' ? '/admin/dashboard' : '/dashboard';
}
