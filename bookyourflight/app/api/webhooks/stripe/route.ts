import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email/brevo';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const sessionId = session.id;

        console.log('Checkout session completed:', sessionId);

        const payment = await prisma.payment.findUnique({
          where: { stripeCheckoutSessionId: sessionId },
          include: {
            reservation: true,
          },
        });

        if (!payment) {
          console.error('Payment not found for session:', sessionId);
          break;
        }

        if (payment.status === 'COMPLETED') {
          console.log('Payment already processed:', sessionId);
          break;
        }

        // Get full reservation and user data
        const reservation = await prisma.reservation.findUnique({
          where: { id: payment.reservation.id },
          include: { user: true, resource: true },
        });

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

        // Send confirmation email
        if (reservation?.user) {
          const htmlContent = emailTemplates.reservationConfirmation({
            passengerName: reservation.user.firstName || reservation.user.email,
            flightName: reservation.resource.name,
            flightNumber: (reservation.resource.metadata as any)?.flightNumber || 'N/A',
            origin: (reservation.resource.metadata as any)?.origin || 'N/A',
            destination: (reservation.resource.metadata as any)?.destination || 'N/A',
            departureTime: (reservation.resource.metadata as any)?.departureTime || 'N/A',
            passengerCount: reservation.passengerCount,
            totalPrice: Number(payment.amount) * 100,
            reservationId: reservation.id,
          });

          await sendEmail({
            to: reservation.user.email,
            subject: 'Votre réservation est confirmée',
            htmlContent,
            type: 'RESERVATION_CONFIRMATION',
            metadata: {
              reservationId: reservation.id,
              userId: reservation.userId,
            },
          });
        }

        console.log('Payment processed successfully:', sessionId);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        console.log('Refund processed:', charge.id);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
