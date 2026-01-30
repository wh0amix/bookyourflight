import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentification admin
    await requireAdmin();

    // Unwrap params pour Next.js 15
    const { id } = await params;

    // 2. Query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 3. Where clause construction
    const where: any = {
      resourceId: id,
      ...(status && { status }),
    };

    // 4. Fetch data in parallel
    const [resource, reservations, total, stats] = await Promise.all([
      // Resource details
      prisma.resource.findUnique({
        where: { id: id },
      }),

      // Reservations avec relations
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
          payment: {
            select: {
              amount: true,
              status: true,
              paidAt: true,
            },
          },
        },
      }),

      // Total count
      prisma.reservation.count({ where }),

      // Aggregates
      prisma.reservation.aggregate({
        where: { resourceId: id },
        _count: { _all: true },
        _sum: { passengerCount: true },
      }),
    ]);

    // Check if resource exists
    if (!resource) {
      return NextResponse.json(
        { error: 'Vol non trouvé' },
        { status: 404 }
      );
    }

    // 5. Calculate statistics
    const confirmedCount = await prisma.reservation.count({
      where: { resourceId: id, status: 'CONFIRMED' },
    });

    const pendingCount = await prisma.reservation.count({
      where: { resourceId: id, status: 'PENDING_PAYMENT' },
    });

    const cancelledCount = await prisma.reservation.count({
      where: { resourceId: id, status: 'CANCELLED' },
    });

    // Calculate revenue (only COMPLETED payments)
    const revenueData = await prisma.payment.aggregate({
      where: {
        reservation: {
          resourceId: id,
          status: 'CONFIRMED',
        },
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    });

    const totalPassengers = stats._sum.passengerCount || 0;
    const occupancyRate = resource.maxSlots > 0
      ? ((totalPassengers / resource.maxSlots) * 100).toFixed(2)
      : '0.00';

    const statistics = {
      totalReservations: stats._count._all,
      confirmedReservations: confirmedCount,
      pendingReservations: pendingCount,
      cancelledReservations: cancelledCount,
      totalPassengers,
      occupancyRate: parseFloat(occupancyRate),
      totalRevenue: parseFloat(revenueData._sum.amount?.toString() || '0'),
    };

    // 6. Format response with search filtering if needed
    let filteredReservations = reservations;

    // Client-side filtering for search (since Prisma doesn't support JSON search easily)
    if (search) {
      const searchLower = search.toLowerCase();
      filteredReservations = reservations.filter((r) => {
        const userMatch =
          r.user.email?.toLowerCase().includes(searchLower) ||
          r.user.firstName?.toLowerCase().includes(searchLower) ||
          r.user.lastName?.toLowerCase().includes(searchLower);

        // Search in passenger data
        const passengerMatch = r.passengerData
          ? JSON.stringify(r.passengerData).toLowerCase().includes(searchLower)
          : false;

        return userMatch || passengerMatch;
      });
    }

    return NextResponse.json({
      resource: {
        id: resource.id,
        name: resource.name,
        availableSlots: resource.availableSlots,
        maxSlots: resource.maxSlots,
        metadata: resource.metadata,
      },
      statistics,
      reservations: filteredReservations.map((r) => ({
        id: r.id,
        status: r.status,
        passengerCount: r.passengerCount,
        createdAt: r.createdAt.toISOString(),
        confirmedAt: r.confirmedAt?.toISOString() || null,
        user: r.user,
        payment: r.payment
          ? {
              amount: parseFloat(r.payment.amount.toString()),
              status: r.payment.status,
              paidAt: r.payment.paidAt?.toISOString() || null,
            }
          : null,
        passengers: (r.passengerData as any)?.passengers || [],
      })),
      pagination: {
        page,
        limit,
        total: search ? filteredReservations.length : total,
        pages: Math.ceil((search ? filteredReservations.length : total) / limit),
      },
    });
  } catch (error: any) {
    console.error('[API] Error fetching passengers:', error);

    if (error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
