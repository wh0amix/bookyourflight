import { auth, clerkClient } from '@clerk/nextjs/server';
import { UserRole } from '@/types/globals';

export async function getUserRole(userId?: string): Promise<UserRole> {
  const effectiveUserId = userId || (await auth()).userId;

  if (!effectiveUserId) {
    return 'USER';
  }

  const client = await clerkClient();
  const user = await client.users.getUser(effectiveUserId);
  const role = user.publicMetadata?.role as UserRole;

  return role || 'USER';
}

export async function hasRole(requiredRole: UserRole, userId?: string): Promise<boolean> {
  const userRole = await getUserRole(userId);

  if (requiredRole === 'ADMIN') {
    return userRole === 'ADMIN';
  }

  return true;
}

export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return userId;
}

export async function requireAdmin() {
  const userId = await requireAuth();
  const isAdmin = await hasRole('ADMIN', userId);

  if (!isAdmin) {
    throw new Error('Forbidden: Admin access required');
  }

  return userId;
}

export async function setUserRole(userId: string, role: UserRole) {
  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { role }
  });
}
