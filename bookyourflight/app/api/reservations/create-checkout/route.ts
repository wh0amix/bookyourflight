import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { syncUserWithPrisma } from '@/lib/auth/sync-user';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { resourceId, passengerCount, passengerData } = body;

    if (!resourceId || !passengerCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    if (resource.availableSlots < passengerCount) {
      return NextResponse.json(
        { error: 'Not enough available slots' },
        { status: 400 }
      );
    }

    const user = await syncUserWithPrisma();

    const totalAmount = resource.priceInCents * passengerCount;

    const now = new Date();
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        resourceId,
        passengerCount,
        passengerData: passengerData || { passengers: [] },
        startTime: now,
        endTime,
        status: 'PENDING_PAYMENT',
      },
    });

    const isTestMode = process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === 'true';
    console.log('Creating checkout - Test mode:', isTestMode);
    let checkoutUrl: string;
    let sessionId: string;
    let paymentIntentId: string;

    if (isTestMode) {
      sessionId = `test_session_${Math.random().toString(36).substring(7)}`;
      paymentIntentId = `test_pi_${Math.random().toString(36).substring(7)}`;
      checkoutUrl = `${process.env.NEXT_PUBLIC_API_URL}/reservations/success?session_id=${sessionId}`;
    } else {
      console.log('Creating Stripe checkout session...');
      console.log('Stripe key configured:', !!process.env.STRIPE_SECRET_KEY);
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: resource.currency.toLowerCase(),
              product_data: {
                name: resource.name,
                description: `${passengerCount} passager(s) - ${resource.description || ''}`,
                metadata: {
                  resourceId,
                  reservationId: reservation.id,
                },
              },
              unit_amount: resource.priceInCents,
            },
            quantity: passengerCount,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_API_URL}/reservations/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/resources/${resourceId}`,
        metadata: {
          reservationId: reservation.id,
          userId: user.id,
          resourceId,
        },
      });

      checkoutUrl = checkoutSession.url as string;
      sessionId = checkoutSession.id;
      paymentIntentId = checkoutSession.payment_intent as string;
    }

    const payment = await prisma.payment.create({
      data: {
        reservationId: reservation.id,
        stripePaymentIntentId: paymentIntentId,
        stripeCheckoutSessionId: sessionId,
        amount: new Prisma.Decimal(totalAmount / 100),
        currency: resource.currency,
        status: isTestMode ? 'COMPLETED' : 'PENDING',
        metadata: {
          passengerCount,
          testMode: isTestMode,
        },
      },
    });

    return NextResponse.json(
      {
        checkoutUrl,
        reservationId: reservation.id,
        sessionId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating checkout:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error.message || String(error),
        type: error.type,
      },
      { status: 500 }
    );
  }
}
