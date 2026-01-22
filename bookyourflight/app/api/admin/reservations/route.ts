import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          resource: {
            select: {
              id: true,
              name: true,
              metadata: true,
            },
          },
          payment: {
            select: {
              amount: true,
              status: true,
              stripeCheckoutSessionId: true,
            },
          },
        },
      }),
      prisma.reservation.count({ where }),
    ]);

    const formattedReservations = reservations.map((res) => ({
      id: res.id,
      userId: res.user.id,
      userEmail: res.user.email,
      userName: `${res.user.firstName || ''} ${res.user.lastName || ''}`.trim() || 'N/A',
      resourceId: res.resource.id,
      resourceName: res.resource.name,
      passengerCount: res.passengerCount,
      passengerData: res.passengerData,
      status: res.status,
      confirmedAt: res.confirmedAt,
      createdAt: res.createdAt,
      payment: res.payment
        ? {
            amount: parseFloat(res.payment.amount.toString()),
            status: res.payment.status,
            sessionId: res.payment.stripeCheckoutSessionId,
          }
        : null,
      flightDetails: {
        origin: res.resource.metadata?.origin,
        destination: res.resource.metadata?.destination,
        departureTime: res.resource.metadata?.departureTime,
      },
    }));

    return NextResponse.json(
      {
        reservations: formattedReservations,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}
