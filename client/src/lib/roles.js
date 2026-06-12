/** Backend User.role: 'admin' | 'user' — company agents use 'user'. */
export const ROLE_ADMIN = 'admin';
export const ROLE_USER = 'user';

export function isAdminRole(user) {
  return user?.role === ROLE_ADMIN;
}

export function isAgentRole(user) {
  return user?.role === ROLE_USER;
}

/** Company agents use `user`; everyone else (including legacy users without role) lands on admin dashboard. */
export function homePathForRole(role) {
  return role === ROLE_USER ? '/agent/dashboard' : '/dashboard';
}
