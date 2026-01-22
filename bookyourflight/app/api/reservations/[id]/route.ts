import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncUserWithPrisma } from '@/lib/auth/sync-user';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await syncUserWithPrisma();
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        resource: {
          select: {
            name: true,
            priceInCents: true,
            metadata: true,
          },
        },
        payment: {
          select: {
            amount: true,
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (reservation.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formatted = {
      id: reservation.id,
      resourceName: reservation.resource.name,
      passengerCount: reservation.passengerCount,
      passengerData: reservation.passengerData,
      status: reservation.status,
      confirmedAt: reservation.confirmedAt,
      createdAt: reservation.createdAt,
      totalPrice: reservation.payment?.amount
        ? parseInt(reservation.payment.amount.toString()) * 100
        : reservation.resource.priceInCents * reservation.passengerCount,
      departureTime: reservation.resource.metadata?.departureTime,
      origin: reservation.resource.metadata?.origin,
      destination: reservation.resource.metadata?.destination,
      flightNumber: reservation.resource.metadata?.flightNumber,
      airline: reservation.resource.metadata?.airline,
    };

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    );
  }
}
