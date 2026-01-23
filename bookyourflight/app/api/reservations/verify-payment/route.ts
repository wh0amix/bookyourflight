import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendEmail, emailTemplates } from '@/lib/email/brevo';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const isTestMode = sessionId.startsWith('test_session_');

    if (!isTestMode) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        );
      }
    }

    const payment = await prisma.payment.findUnique({
      where: { stripeCheckoutSessionId: sessionId },
      include: {
        reservation: {
          include: {
            resource: true,
            user: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    if (payment.status === 'COMPLETED') {
      return NextResponse.json(
        {
          reservationId: payment.reservation.id,
          resourceName: payment.reservation.resource.name,
          passengerCount: payment.reservation.passengerCount,
          amount: payment.amount.toString(),
          status: 'CONFIRMED',
        },
        { status: 200 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const resource = await tx.resource.findUnique({
        where: { id: payment.reservation.resourceId },
      });

      if (!resource || resource.availableSlots < payment.reservation.passengerCount) {
        throw new Error('Not enough available slots');
      }

      await tx.resource.update({
        where: { id: payment.reservation.resourceId },
        data: {
          availableSlots: {
            decrement: payment.reservation.passengerCount,
          },
        },
      });

      await tx.reservation.update({
        where: { id: payment.reservation.id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      });
    });

    // Envoyer l'email de confirmation
    const user = payment.reservation.user;
    if (user) {
      console.log('📧 [VERIFY-PAYMENT] Sending confirmation email to:', user.email);

      const htmlContent = emailTemplates.reservationConfirmation({
        passengerName: user.firstName || user.email,
        flightName: payment.reservation.resource.name,
        flightNumber: (payment.reservation.resource.metadata as any)?.flightNumber || 'N/A',
        origin: (payment.reservation.resource.metadata as any)?.origin || 'N/A',
        destination: (payment.reservation.resource.metadata as any)?.destination || 'N/A',
        departureTime: (payment.reservation.resource.metadata as any)?.departureTime || 'N/A',
        passengerCount: payment.reservation.passengerCount,
        totalPrice: Number(payment.amount) * 100,
        reservationId: payment.reservation.id,
      });

      const emailResult = await sendEmail({
        to: user.email,
        subject: 'Votre réservation est confirmée - BookYourFlight',
        htmlContent,
        type: 'RESERVATION_CONFIRMATION',
        metadata: {
          reservationId: payment.reservation.id,
          userId: user.id,
        },
      });

      console.log('📧 [VERIFY-PAYMENT] Email result:', emailResult);
    }

    return NextResponse.json(
      {
        reservationId: payment.reservation.id,
        resourceName: payment.reservation.resource.name,
        passengerCount: payment.reservation.passengerCount,
        amount: payment.amount.toString(),
        status: 'CONFIRMED',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
