import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncUserWithPrisma } from '@/lib/auth/sync-user';

export async function GET(req: NextRequest) {
  try {
    const user = await syncUserWithPrisma();

    const reservations = await prisma.reservation.findMany({
      where: { userId: user.id },
      include: {
        resource: {
          select: {
            id: true,
            name: true,
            priceInCents: true,
            metadata: true,
          },
        },
        payment: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedReservations = reservations.map((res) => ({
      id: res.id,
      resourceId: res.resourceId,
      resourceName: res.resource.name,
      passengerCount: res.passengerCount,
      status: res.status,
      confirmedAt: res.confirmedAt,
      totalPrice: res.payment?.amount
        ? parseInt(res.payment.amount.toString()) * 100
        : res.resource.priceInCents * res.passengerCount,
      departureTime: res.resource.metadata?.departureTime,
      origin: res.resource.metadata?.origin,
      destination: res.resource.metadata?.destination,
    }));

    return NextResponse.json({ reservations: formattedReservations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}
