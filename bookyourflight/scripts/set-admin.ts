import { clerkClient } from '@clerk/nextjs/server';

async function setAdmin() {
  const userId = process.argv[2];

  if (!userId) {
    console.error('❌ Usage: tsx scripts/set-admin.ts <userId>');
    console.error('   Find your userId in Clerk Dashboard > Users');
    process.exit(1);
  }

  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { role: 'ADMIN' }
    });
    console.log('✅ User promoted to ADMIN:', userId);
    console.log('🔄 Please sign out and sign in again for changes to take effect');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setAdmin();
