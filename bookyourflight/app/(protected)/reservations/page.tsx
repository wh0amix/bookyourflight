'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Calendar, MapPin, Users, DollarSign, AlertCircle } from 'lucide-react';

interface Reservation {
  id: string;
  resourceId: string;
  resourceName: string;
  passengerCount: number;
  status: string;
  confirmedAt: string | null;
  totalPrice: number;
  departureTime: string;
  origin?: string;
  destination?: string;
}

export default function ReservationsPage() {
  const { isSignedIn, user } = useUser();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSignedIn) return;

    async function fetchReservations() {
      try {
        const res = await fetch('/api/reservations');
        if (!res.ok) throw new Error('Failed to fetch reservations');

        const data = await res.json();
        setReservations(data.reservations || []);
      } catch (err) {
        setError('Erreur lors du chargement des réservations');
      } finally {
        setLoading(false);
      }
    }

    fetchReservations();
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Vous devez être connecté pour voir vos réservations</p>
          <Link href="/sign-in" className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 flex items-center justify-center">
        <p className="text-zinc-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-32">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mes réservations</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-12 text-center">
            <p className="text-zinc-400 mb-4">Vous n'avez pas encore de réservations</p>
            <Link href="/resources" className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg inline-block">
              Réserver un vol
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-orange-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{reservation.resourceName}</h3>
                    <p className="text-sm text-zinc-400">Réservation: {reservation.id}</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      reservation.status === 'CONFIRMED'
                        ? 'bg-green-500/20 text-green-400'
                        : reservation.status === 'PENDING_PAYMENT'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {reservation.status === 'CONFIRMED'
                      ? 'Confirmée'
                      : reservation.status === 'PENDING_PAYMENT'
                      ? 'En attente'
                      : 'Annulée'}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-zinc-400">Date départ</p>
                      <p className="font-semibold">
                        {reservation.departureTime
                          ? new Date(reservation.departureTime).toLocaleDateString('fr-FR')
                          : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-zinc-400">Route</p>
                      <p className="font-semibold">
                        {reservation.origin && reservation.destination
                          ? `${reservation.origin} → ${reservation.destination}`
                          : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-zinc-400">Passagers</p>
                      <p className="font-semibold">{reservation.passengerCount}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-zinc-400">Total</p>
                      <p className="font-semibold">{(reservation.totalPrice / 100).toFixed(2)} €</p>
                    </div>
                  </div>
                </div>

                {reservation.status === 'CONFIRMED' && (
                  <Link
                    href={`/reservations/${reservation.id}`}
                    className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Voir les détails →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
