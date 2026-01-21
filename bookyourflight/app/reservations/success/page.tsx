'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader } from 'lucide-react';

export default function ReservationSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('Session ID non trouvée');
      setLoading(false);
      return;
    }

    async function verifyPayment() {
      try {
        const res = await fetch(`/api/reservations/verify-payment?session_id=${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Erreur lors de la vérification du paiement');
          return;
        }

        setReservation(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-zinc-400">Vérification de votre paiement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 mb-6">
            <p className="text-red-400 font-semibold">{error}</p>
          </div>
          <Link
            href="/resources"
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
          >
            Retour aux vols
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Réservation confirmée!</h1>
            <p className="text-zinc-400">Votre paiement a été traité avec succès</p>
          </div>

          {reservation && (
            <div className="space-y-6">
              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Numéro de réservation</p>
                  <p className="font-mono text-sm font-semibold text-orange-400">{reservation.reservationId}</p>
                </div>

                <div className="border-t border-zinc-700 pt-3">
                  <p className="text-xs text-zinc-400 mb-1">Vol</p>
                  <p className="font-semibold">{reservation.resourceName}</p>
                </div>

                <div className="border-t border-zinc-700 pt-3">
                  <p className="text-xs text-zinc-400 mb-1">Nombre de passagers</p>
                  <p className="font-semibold">{reservation.passengerCount}</p>
                </div>

                <div className="border-t border-zinc-700 pt-3">
                  <p className="text-xs text-zinc-400 mb-1">Montant payé</p>
                  <p className="text-lg font-bold text-orange-500">{reservation.amount} €</p>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                <p className="text-sm text-blue-200">
                  Un email de confirmation a été envoyé à votre adresse email. Vérifiez votre boîte de réception pour les détails de votre réservation.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/reservations"
                  className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-center font-medium"
                >
                  Mes réservations
                </Link>
                <Link
                  href="/resources"
                  className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-center font-medium"
                >
                  Voir d'autres vols
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
