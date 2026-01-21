import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function syncUserWithPrisma() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new Error('Unauthorized: No user ID');
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    const response = await fetch('https://api.clerk.com/v1/users/' + userId, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Clerk user');
    }

    const clerkUser = await response.json();

    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.email_addresses[0]?.email_address || '',
        firstName: clerkUser.first_name || undefined,
        lastName: clerkUser.last_name || undefined,
      },
    });
  }

  return user;
}
