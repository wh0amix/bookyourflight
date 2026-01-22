'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, XCircle, Users, Plane, MapPin, Calendar, DollarSign } from 'lucide-react';

interface Reservation {
  id: string;
  resourceName: string;
  passengerCount: number;
  status: string;
  confirmedAt: string | null;
  createdAt: string;
  totalPrice: number;
  departureTime: string;
  origin?: string;
  destination?: string;
  flightNumber?: string;
  airline?: string;
  passengerData: {
    passengers: Array<{
      firstName: string;
      lastName: string;
      passportNumber: string;
    }>;
  };
}

export default function ReservationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReservation();
  }, [id]);

  async function fetchReservation() {
    try {
      const res = await fetch(`/api/reservations/${id}`);
      if (!res.ok) {
        throw new Error('Reservation not found');
      }

      const data = await res.json();
      setReservation(data);
    } catch (err) {
      setError('Réservation non trouvée');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 flex items-center justify-center">
        <p className="text-zinc-400">Chargement...</p>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/reservations" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg">
            Retour aux réservations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          href="/reservations"
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à mes réservations
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Détails de la réservation</h1>
              <p className="text-sm text-zinc-400">ID: {reservation.id}</p>
            </div>
            <div
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
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
                ? 'En attente de paiement'
                : 'Annulée'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Plane className="w-5 h-5 text-orange-500 mt-1" />
                <div>
                  <p className="text-sm text-zinc-400">Vol</p>
                  <p className="font-semibold">{reservation.resourceName}</p>
                  {reservation.flightNumber && (
                    <p className="text-sm text-zinc-500">N° {reservation.flightNumber}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-1" />
                <div>
                  <p className="text-sm text-zinc-400">Itinéraire</p>
                  <p className="font-semibold">
                    {reservation.origin && reservation.destination
                      ? `${reservation.origin} → ${reservation.destination}`
                      : 'Non spécifié'}
                  </p>
                  {reservation.airline && (
                    <p className="text-sm text-zinc-500">{reservation.airline}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <p className="text-sm text-zinc-400">Date de départ</p>
                  <p className="font-semibold">
                    {reservation.departureTime
                      ? new Date(reservation.departureTime).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Non spécifié'}
                  </p>
                  {reservation.departureTime && (
                    <p className="text-sm text-zinc-500">
                      {new Date(reservation.departureTime).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-purple-400 mt-1" />
                <div>
                  <p className="text-sm text-zinc-400">Passagers</p>
                  <p className="font-semibold">{reservation.passengerCount} personne(s)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <p className="text-sm text-zinc-400">Montant total</p>
                  <p className="text-2xl font-bold text-green-400">
                    {(reservation.totalPrice / 100).toFixed(2)} €
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {reservation.status === 'CONFIRMED' ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-400 mt-1" />
                )}
                <div>
                  <p className="text-sm text-zinc-400">
                    {reservation.status === 'CONFIRMED' ? 'Confirmée le' : 'Créée le'}
                  </p>
                  <p className="font-semibold">
                    {new Date(
                      reservation.confirmedAt || reservation.createdAt
                    ).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {reservation.passengerData?.passengers && reservation.passengerData.passengers.length > 0 && (
            <div className="border-t border-zinc-800 pt-6">
              <h2 className="text-lg font-semibold mb-4">Informations des passagers</h2>
              <div className="space-y-3">
                {reservation.passengerData.passengers.map((passenger, index) => (
                  <div
                    key={index}
                    className="bg-zinc-800/30 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {passenger.firstName || passenger.lastName
                          ? `${passenger.firstName} ${passenger.lastName}`
                          : `Passager ${index + 1}`}
                      </p>
                      {passenger.passportNumber && (
                        <p className="text-sm text-zinc-400">
                          Passeport: {passenger.passportNumber}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reservation.status === 'PENDING_PAYMENT' && (
            <div className="mt-6 bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                Cette réservation est en attente de paiement. Veuillez compléter le paiement pour
                confirmer votre réservation.
              </p>
            </div>
          )}

          {reservation.status === 'CONFIRMED' && (
            <div className="mt-6 bg-green-500/10 border border-green-500 rounded-lg p-4">
              <p className="text-green-400 text-sm">
                Votre réservation est confirmée! Un email de confirmation vous a été envoyé.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Link
            href="/reservations"
            className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-center transition-colors"
          >
            Retour à mes réservations
          </Link>
          {reservation.status === 'CONFIRMED' && (
            <button className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-medium transition-colors">
              Télécharger le billet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
