import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email/brevo';
import { requireAdmin } from '@/lib/auth/roles';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Test email
    const htmlContent = emailTemplates.reservationConfirmation({
      passengerName: 'Test User',
      flightName: 'Vol Paris-Londres AF1234',
      flightNumber: 'AF1234',
      origin: 'CDG',
      destination: 'LHR',
      departureTime: '2026-02-15T10:00:00Z',
      passengerCount: 1,
      totalPrice: 12900,
      reservationId: 'test-reservation-id',
    });

    const result = await sendEmail({
      to: email,
      subject: '[TEST] Votre réservation est confirmée',
      htmlContent,
      type: 'RESERVATION_CONFIRMATION',
      metadata: { test: true },
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${email}`,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
