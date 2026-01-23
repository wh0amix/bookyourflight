import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/roles';
import { sendEmail, emailTemplates } from '@/lib/email/brevo';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        resource: true,
        payment: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    switch (action) {
      case 'confirm': {
        console.log('🔵 [ADMIN] Confirmation request for reservation:', id);

        if (reservation.status === 'CONFIRMED') {
          return NextResponse.json({ error: 'Already confirmed' }, { status: 400 });
        }

        // Get user data for email
        const user = await prisma.user.findUnique({
          where: { id: reservation.userId },
        });

        console.log('🔵 [ADMIN] User found:', user ? user.email : 'NULL');

        await prisma.$transaction(async (tx) => {
          await tx.reservation.update({
            where: { id },
            data: {
              status: 'CONFIRMED',
              confirmedAt: new Date(),
            },
          });

          if (reservation.payment) {
            await tx.payment.update({
              where: { id: reservation.payment.id },
              data: {
                status: 'COMPLETED',
                paidAt: new Date(),
              },
            });
          }

          await tx.resource.update({
            where: { id: reservation.resourceId },
            data: {
              availableSlots: {
                decrement: reservation.passengerCount,
              },
            },
          });
        });

        console.log('🔵 [ADMIN] Transaction completed successfully');

        // Send confirmation email
        if (user) {
          console.log('🔵 [ADMIN] Preparing to send email to:', user.email);

          const htmlContent = emailTemplates.reservationConfirmation({
            passengerName: user.firstName || user.email,
            flightName: reservation.resource.name,
            flightNumber: (reservation.resource.metadata as any)?.flightNumber || 'N/A',
            origin: (reservation.resource.metadata as any)?.origin || 'N/A',
            destination: (reservation.resource.metadata as any)?.destination || 'N/A',
            departureTime: (reservation.resource.metadata as any)?.departureTime || 'N/A',
            passengerCount: reservation.passengerCount,
            totalPrice: reservation.payment ? Number(reservation.payment.amount) * 100 : 0,
            reservationId: reservation.id,
          });

          console.log('🔵 [ADMIN] Email template generated, calling sendEmail()...');

          const emailResult = await sendEmail({
            to: user.email,
            subject: 'Votre réservation est confirmée',
            htmlContent,
            type: 'RESERVATION_CONFIRMATION',
            metadata: {
              reservationId: reservation.id,
              userId: user.id,
            },
          });

          console.log('🔵 [ADMIN] Email send result:', emailResult);
        } else {
          console.warn('⚠️ [ADMIN] User not found, cannot send email');
        }

        return NextResponse.json({ message: 'Reservation confirmed' }, { status: 200 });
      }

      case 'cancel': {
        if (reservation.status === 'CANCELLED') {
          return NextResponse.json({ error: 'Already cancelled' }, { status: 400 });
        }

        // Get user data for email
        const user = await prisma.user.findUnique({
          where: { id: reservation.userId },
        });

        await prisma.$transaction(async (tx) => {
          await tx.reservation.update({
            where: { id },
            data: {
              status: 'CANCELLED',
              cancelledAt: new Date(),
              cancellationReason: body.reason || 'Cancelled by admin',
            },
          });

          if (reservation.status === 'CONFIRMED') {
            await tx.resource.update({
              where: { id: reservation.resourceId },
              data: {
                availableSlots: {
                  increment: reservation.passengerCount,
                },
              },
            });
          }

          if (reservation.payment && reservation.payment.status === 'COMPLETED') {
            await tx.payment.update({
              where: { id: reservation.payment.id },
              data: {
                status: 'REFUND_INITIATED',
              },
            });
          }
        });

        // Send cancellation email
        if (user) {
          const htmlContent = emailTemplates.reservationCancelled({
            passengerName: user.firstName || user.email,
            flightName: reservation.resource.name,
            reservationId: reservation.id,
            refundAmount: reservation.payment ? Number(reservation.payment.amount) * 100 : undefined,
          });

          await sendEmail({
            to: user.email,
            subject: 'Votre réservation a été annulée',
            htmlContent,
            type: 'RESERVATION_CANCELLED',
            metadata: {
              reservationId: reservation.id,
              userId: user.id,
            },
          });
        }

        return NextResponse.json({ message: 'Reservation cancelled' }, { status: 200 });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update reservation' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { resource: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Get user data for email before deleting
    const user = await prisma.user.findUnique({
      where: { id: reservation.userId },
    });

    await prisma.$transaction(async (tx) => {
      if (reservation.status === 'CONFIRMED') {
        await tx.resource.update({
          where: { id: reservation.resourceId },
          data: {
            availableSlots: {
              increment: reservation.passengerCount,
            },
          },
        });
      }

      await tx.reservation.delete({
        where: { id },
      });
    });

    // Send deletion email
    if (user) {
      const htmlContent = emailTemplates.reservationCancelled({
        passengerName: user.firstName || user.email,
        flightName: reservation.resource.name,
        reservationId: reservation.id,
      });

      await sendEmail({
        to: user.email,
        subject: 'Votre réservation a été supprimée',
        htmlContent,
        type: 'RESERVATION_CANCELLED',
        metadata: {
          reservationId: reservation.id,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ message: 'Reservation deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete reservation' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
