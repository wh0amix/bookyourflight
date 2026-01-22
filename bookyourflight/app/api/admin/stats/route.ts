import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const [
      totalReservations,
      confirmedReservations,
      pendingReservations,
      totalRevenue,
      totalUsers,
      totalResources,
      recentReservations,
    ] = await Promise.all([
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: 'CONFIRMED' } }),
      prisma.reservation.count({ where: { status: 'PENDING_PAYMENT' } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.user.count(),
      prisma.resource.count(),
      prisma.reservation.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          resource: {
            select: {
              name: true,
            },
          },
          payment: {
            select: {
              amount: true,
              status: true,
            },
          },
        },
      }),
    ]);

    const revenueByDay = await prisma.$queryRaw<
      { date: Date; revenue: number; count: number }[]
    >`
      SELECT
        DATE(p."createdAt") as date,
        SUM(p.amount)::float as revenue,
        COUNT(*)::int as count
      FROM "Payment" p
      WHERE p.status = 'COMPLETED'
      AND p."createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(p."createdAt")
      ORDER BY date DESC
    `;

    return NextResponse.json(
      {
        stats: {
          totalReservations,
          confirmedReservations,
          pendingReservations,
          totalRevenue: totalRevenue._sum.amount
            ? parseFloat(totalRevenue._sum.amount.toString())
            : 0,
          totalUsers,
          totalResources,
        },
        recentReservations: recentReservations.map((res) => ({
          id: res.id,
          userEmail: res.user.email,
          userName: `${res.user.firstName || ''} ${res.user.lastName || ''}`.trim(),
          resourceName: res.resource.name,
          passengerCount: res.passengerCount,
          status: res.status,
          amount: res.payment?.amount ? parseFloat(res.payment.amount.toString()) : 0,
          paymentStatus: res.payment?.status,
          createdAt: res.createdAt,
        })),
        revenueByDay: revenueByDay.map((item) => ({
          date: item.date.toISOString().split('T')[0],
          revenue: item.revenue,
          count: item.count,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
