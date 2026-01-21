import { Webhook } from 'svix';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const svixHeaders = {
    'svix-id': req.headers.get('svix-id') || '',
    'svix-timestamp': req.headers.get('svix-timestamp') || '',
    'svix-signature': req.headers.get('svix-signature') || '',
  };

  const body = await req.text();

  const wh = new Webhook(webhookSecret);
  let evt;

  try {
    evt = wh.verify(body, svixHeaders) as any;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
  }

  if (evt.type === 'user.created' || evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const email = email_addresses[0]?.email_address;

    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    try {
      if (evt.type === 'user.created') {
        await prisma.user.create({
          data: {
            clerkId: id,
            email,
            firstName: first_name || undefined,
            lastName: last_name || undefined,
          },
        });
      } else if (evt.type === 'user.updated') {
        await prisma.user.update({
          where: { clerkId: id },
          data: {
            firstName: first_name || undefined,
            lastName: last_name || undefined,
          },
        });
      }
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log('User already exists');
      } else {
        console.error('Error syncing user:', error);
      }
    }
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data;

    try {
      await prisma.user.delete({
        where: { clerkId: id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        console.log('User not found to delete');
      } else {
        console.error('Error deleting user:', error);
      }
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
